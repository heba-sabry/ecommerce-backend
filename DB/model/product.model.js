import mongoose, { Schema, Types, model } from "mongoose";


const productSchema = new Schema(
  {
    name: { type: String, require: true, unique: true, lowerCase: true },
    slug: { type: String, require: true, lowerCase: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    paymentPrice: { type: Number, required: true, default: 0 },
    colors: { type: Array },
    sizes: { type: Array },
    image: { type: Object, required: true },
    coverImages: { type: Array },
    avgRate: { type: Number, required: true, default: 0 },
    rateNo: { type: Number, required: true, default: 0 },
    soldItems: { type: Number, required: true, default: 0 },
    subcategoryId: { type: Types.ObjectId, ref: "SubCategory", require: true },
    categoryId: { type: Types.ObjectId, ref: "category", require: true },
    brandId: { type: Types.ObjectId, ref: "brand", require: true },
    createdBy: { type: Types.ObjectId, ref: "user", require: true },
    wishList: [{ type: Types.ObjectId, ref: "user" }],
  },
  {
    toJSON: { virtuals: true },
    toObject:{virtuals:true},
    timestamps: true,
  }
);
productSchema.virtual('review', {
  ref:"Review",
  localField: "_id",
  foreignField:"productId"
})
const productModel = mongoose.models.product || model("product", productSchema);
export default productModel;
