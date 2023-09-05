import brandModel from "../../../../DB/model/Brand.model.js";
import SubCategoryModel from "../../../../DB/model/SubCategory.model.js";
import categoryModel from "../../../../DB/model/category.model.js";
import productModel from "../../../../DB/model/product.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import slugify from "slugify";
import { StatusCodes } from "http-status-codes";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

export const addProduct = async (req, res, next) => {
  const { categoryId, subcategoryId, brandId } = req.body;

  const isNameExist = await productModel.findOne({ name: req.body.name });
  if (isNameExist) {
    isNameExist.stock += Number(req.body.quantity);
    await isNameExist.save();
    return res.status(201).json({ message: "Done", Product: isNameExist });
  }
  const isCategoryExist = await categoryModel.findById(categoryId);
  if (!isCategoryExist) {
    return next(new Error("category not found", { cause: 409 }));
  }
  const isSubcategoryExist = await SubCategoryModel.findById(subcategoryId);
  if (!isSubcategoryExist) {
    return next(new Error("subcategory not found", { cause: 409 }));
  }
  const isBrandExist = await brandModel.findById(brandId);
  if (!isBrandExist) {
    return next(new Error("brand not found", { cause: 409 }));
  }
  req.body.slug = slugify(req.body.name, "-");
  req.body.stock = Number(req.body.quantity);
  req.body.paymentPrice =
    req.body.price - req.body.price * ((req.body.discount || 0) / 100);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: "product",
    }
  );
  req.body.image = { secure_url, public_id };
  if (req.files.coverImages) {
    const coverImages = [];
    for (let i = 0; i < req.files.coverImages.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.coverImages[i].path,
        { folder: "product/coverImages" }
      );
      coverImages.push({ secure_url, public_id });
    }
    req.body.coverImages = coverImages;
  }
  if (req.body.sizes) {
    req.body.sizes = JSON.parse(req.body.sizes);
  }
  if (req.body.colors) {
    req.body.colors = JSON.parse(req.body.colors);
  }
  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);
  return res.status(StatusCodes.CREATED).json({ message: "done", product });
};
//get products
export const getProducts = asyncHandler(async (req, res, next) => {
   const Query = productModel.find().populate([
     {
       path: "review",
     },
   ]);
  const apiFeatures = new ApiFeatures(Query, req.query)
    .pagination(productModel)
    .filter()
    .sort()
    .select()
    .search();
  const product = await apiFeatures.mongooseQuery;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    product,
    count: apiFeatures.queryData.count,
    totalPage: apiFeatures.queryData.totalPage,
    next: apiFeatures.queryData.next,
    previous: apiFeatures.queryData.previous,
  });
});
