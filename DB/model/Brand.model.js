import mongoose, { Schema, Types, model } from "mongoose";
const brandSchema = new Schema(
  {
    name: { type: String, require: true, unique: true, lowerCase: true },
    slug: { type: String, require: true, lowerCase: true },
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
  },
  {
    timestamps: true,
  }
);

const brandModel = mongoose.models.brand || model("brand", brandSchema);
export default brandModel;
