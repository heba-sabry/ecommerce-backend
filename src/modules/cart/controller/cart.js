import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cartModel from "../../../../DB/model/Cart.model.js";

//add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("product is not found", StatusCodes.NOT_FOUND));
  }
  if (product.stock < quantity) {
    await productModel.updateOne(
      { _id: productId },
      {
        $addToSet: {
          wishList: req.user._id,
        },
      }
    );
    return next(
      new ErrorClass(
        `out of stock max available is ${product.stock} `,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  // check cart exist
  const cart = await cartModel.findOne({ userId: req.user._id });
  // if exist --1 update old item
  let exist = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].product.toString() == productId) {
      cart.products[i].quantity = quantity;
      exist = true;
      break;
    }
  }
  // if exist --2push old item
  if (!exist) {
    cart.products.push({
      product: productId,
      quantity,
    });
  }
  await cart.save();
  return res.status(StatusCodes.CREATED).json({ message: "done", cart });
});
//delete from cart
export const deleteFromCart = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await cartModel.findOne({
    userId: req.user._id,
    "products.product": id,
  });
  if (!product) {
    return next(new ErrorClass("product is not found", StatusCodes.NOT_FOUND));
  }
  const cart = await cartModel.findOneAndUpdate(
    { userId: req.user._id },
    {
      $pull: {
        products: {
          product: id,
        },
      },
    },
    { new: true }
  );
  return res.status(StatusCodes.CREATED).json({ message: "done", cart });
});
//get
export const getUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await cartModel
    .findOne({
      userId,
    })
    .populate([
      {
        path: "products.product",
        select: "price name paymentPrice stock",
        populate: [
          {
            path: "categoryId",
            select: "name",
          },
          {
            path: "subcategoryId",
            select: "name",
          },
          {
            path: "brandId",
            select: "name",
          },
        ],
      },
    ]);
  if (!cart) {
    return next(new ErrorClass("product is not found", StatusCodes.NOT_FOUND));
  }
  let totalPrice = 0;
  cart.products = cart.products.filter((ele) => {
    if (ele?.product) {
      totalPrice += ele.product.paymentPrice * ele.quantity;
      return ele;
    }
  });
  await cart.save();
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "done", cart, totalPrice });
});
