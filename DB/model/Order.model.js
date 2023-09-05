import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", require: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    address: { type: String, require: true },
    phone: [{ type: Number, require: true }],
    products: [
      {
        product: {
          name: { type: String, require: true },
          price: { type: Number, require: true },
          paymentPrice: { type: Number, require: true },
          productId: {
            type: Types.ObjectId,
            ref: "product",
            require: true,
          },
        },
        quantity: { type: Number, require: true, default: 1 },
      },
    ],
    price: { type: Number, require: true },
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    paymentPrice: { type: Number, require: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "rood",
        "waitPayment",
        "delivered",
        "rejected",
        "canceled",
      ],
      default: "placed",
    },
    note: { type: String },
    reason: { type: String },
  },
  {
    timestamps: true,
  }
);
const orderModel = model("Order", orderSchema);
export default orderModel;
