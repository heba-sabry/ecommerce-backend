import mongoose, { Schema, Types, model } from "mongoose";
const couponSchema = new Schema(
  {
    code: { type: Number, require: true, unique: true },
    amount: { type: Number, require: true, min: 0, max: 100 },
    expireDate: { type: Date, require: true, min: Date.now() },
    numOfUses: { type: Number },
    usedBy: [{ type: Types.ObjectId, ref: "user", require: true }],
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
  },
  {
    timestamps: true,
  }
);

const couponModel = mongoose.models.coupon || model("Coupon", couponSchema);
export default couponModel;
