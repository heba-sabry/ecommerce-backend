import userModel from "../../../../DB/model/User.model.js";
import productModel from "../../../../DB/model/product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../../utils/errorClass.js";

export const addFavorites = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { userId } = req.user._id;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("product is not found ", StatusCodes.NOT_FOUND));
  }
  const user = await userModel.updateOne(
    { userId },
    {
      $addToSet: {
        favorites: productId,
      },
    }
  );

  return res.status(StatusCodes.CREATED).json({ message: "done", user });
});
export const getFavorites = asyncHandler(async (req, res, next) => {
 const  userId  = req.user._id;
  const user = await userModel.findById(userId).populate([
    {
      path: "favorites",
    },
  ]);
  return res.status(StatusCodes.CREATED).json({ message: "done", user });
});
