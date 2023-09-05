import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import orderModel from "../../../../DB/model/Order.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";

export const addReview = asyncHandler(async (req, res, next) => {
  const createdBy = req.user._id;
  const { comment, rating } = req.body;
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("product is not found ", StatusCodes.NOT_FOUND));
  }
  const order = await orderModel.findOne({
    userId: createdBy,
    status: "delivered",
    "products.product.productId": productId,
  });
  if (!order) {
    return next(
      new ErrorClass(`can't review on this order`, StatusCodes.NOT_FOUND)
    );
  }
  const isReviewExist = await reviewModel.findOne({
    createdBy,
    productId,
    orderId: order._id,
  });
  if (isReviewExist) {
    return next(
      new ErrorClass(
        `you are already Review this product`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const review = await reviewModel.create({
    comment,
    rating ,
    productId,
    createdBy,
    orderId: order._id,
  });

  let oldAvg = product.avgRate;
  let oldNo = product.rateNo;
  let sum = oldAvg * oldNo + rating;
  let newAvg = sum / (oldAvg + 1);
  product.avgRate = newAvg;
  product.rateNo = oldNo + 1;
  await product.save();
  return res.status(StatusCodes.CREATED).json({ message: "done", review });
});
export const updateReview = asyncHandler(async (req, res, next) => {
  const createdBy = req.user._id;
  const { comment, rating } = req.body;
  const { reviewId } = req.params;

  const isReviewExist = await reviewModel.findOne(
    {
      _id: reviewId,
      createdBy,
    }
  );
  if (!isReviewExist) {
    return next(new ErrorClass(`review is not found`, StatusCodes.NOT_FOUND));
  }
  if (rating) {
    const product = await productModel.findById(isReviewExist.productId);
    product.avgRate =
  ( ( (  product.rateNo * product.avgRate) -
      isReviewExist.rating) +
      rating) / product.rateNo;
    await product.save();

    isReviewExist.rating = rating;
  }
  if (comment) {
    isReviewExist.comment = comment;
  }
  await isReviewExist.save();
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "done", isReviewExist });
});
export const deleteReview = asyncHandler(async (req, res, next) => {
  const createdBy = req.user._id;
  const { reviewId } = req.params;
  const isReviewExist = await reviewModel.findOneAndDelete({
    _id: reviewId,
    createdBy,
  });
  if (!isReviewExist) {
    return next(new ErrorClass(`review is not found`, StatusCodes.NOT_FOUND));
  }
  const product = await productModel.findById(isReviewExist.productId);
  product.avgRate =
    (product.rateNo * product.avgRate - isReviewExist.rating) /
    (product.rateNo - 1);
  product.rateNo = product.rateNo - 1;
  await product.save();
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "done", isReviewExist });
});

export const getReviews = asyncHandler(async (req, res, next) => {
  const review = await reviewModel.find();
  return res.status(StatusCodes.OK).json({ message: "done", review });
});
