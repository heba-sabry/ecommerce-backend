import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", require: true, unique: true },
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: "product",
          require: true,
          unique: true,
        },
        quantity: { type: Number, require: true, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const cartModel = model("Cart", cartSchema);
export default cartModel;
