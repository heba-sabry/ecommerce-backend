import mongoose, { Schema, Types, model } from "mongoose";
const SubCategorySchema = new Schema(
  {
    name: { type: String, require: true, unique: true, lowerCase: true },
    slug: { type: String, require: true, lowerCase: true },
    image: { type: Object, required: true },
    categoryId: { type: Types.ObjectId, ref: "category", require: false },
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
  },
  {
    timestamps: true,
  }
);
const SubCategoryModel =
  mongoose.models.SubCategory || model("SubCategory", SubCategorySchema);
export default SubCategoryModel;
