import mongoose, { Schema, Types, model } from "mongoose";
const reviewSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
    productId: { type: Types.ObjectId, ref: "product", require: true },
    orderId: { type: Types.ObjectId, ref: "Order", require: true },
    comment: { type: String, require: true },
    rating: { type: Number, require: true, min: 0, max: 5 },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.models.review || model("Review", reviewSchema);
export default reviewModel;
