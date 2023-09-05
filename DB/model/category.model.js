import mongoose, { Schema, Types, model } from "mongoose";
const categorySchema = new Schema(
  {
    name: { type: String, require: true, unique: true, lowerCase: true },
    slug: { type: String, require: true, lowerCase: true },
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
categorySchema.virtual("subCategories", {
  localField: "_id",
  foreignField: "categoryId",
  ref: "SubCategory",
});
const categoryModel =
  mongoose.models.category || model("category", categorySchema);
export default categoryModel;
