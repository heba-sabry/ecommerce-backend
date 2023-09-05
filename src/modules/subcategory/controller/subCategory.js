import slugify from "slugify";
import SubCategoryModel from "../../../../DB/model/SubCategory.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import categoryModel from "../../../../DB/model/category.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { StatusCodes } from "http-status-codes";

//add
export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  let { name } = req.body;
  const userId = req.user._id;
  const categoryExist = await categoryModel.findById(categoryId);
  if (!categoryExist) {
    return next(new Error(`category not found`, { cause: 409 }));
  }
  const checkName = await SubCategoryModel.findOne({ name });
  if (checkName) {
    return next(
      new Error(`Duplicated SubCategory name ${name}`, { cause: 409 })
    );
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "Subcategory",
    }
  );
  const subCategory = await SubCategoryModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    createdBy: userId,
  });
  return res.status(201).json({ message: "Done", subCategory });
});
//update
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  let { name, slug } = req.body;
  const SubCategory = await SubCategoryModel.findById({ _id: subCategoryId });
  if (!SubCategory) {
    return next(new Error("In_valid subcategory id", { cause: 400 }));
  }
  if (name) {
    if (SubCategory.name == name) {
      return next(
        new Error(`sorry cannot update SubCategory with some name ${name}`, {
          cause: 400,
        })
      );
    }
    const checkSubCategoryName = await SubCategoryModel.findOne({
      name,
      _id: { $ne: SubCategoryId },
    });
    if (checkSubCategoryName) {
      return next(new Error(" category is already exist", { cause: 400 }));
    }
    SubCategory.name = name;
    slug = slugify(name, "-");
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "SubCategory" }
    );
    await cloudinary.uploader.destroy(SubCategory.image.public_id);
    SubCategory.image = { secure_url, public_id };
  }
  await SubCategory.save();
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "done", SubCategory });
});
//delete
export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  const subCategory = await SubCategoryModel.findByIdAndDelete({
    _id: subCategoryId,
  });
  if (!subCategory) {
    return next(new Error("In_valid subcategory id", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(subCategory.image.public_id);
  return res.json({ message: "done", subCategory });
});
//get All subcategory
export const getSubCategory = asyncHandler(async (req, res, next) => {
  const filter = {};
  if (req.params.categoryId) {
    filter.categoryId = req.params.categoryId;
  }
  const Query = SubCategoryModel.find(filter);
  const api = new ApiFeatures(Query, req.query)
    .pagination(SubCategoryModel)
    .sort()
    .filter()
    .select()
    .search();
  const subCatagories = await api.mongooseQuery;
  return res.json({ message: "done", subCatagories });
});
