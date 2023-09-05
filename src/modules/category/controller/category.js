import slugify from "slugify";
import categoryModel from "../../../../DB/model/category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
//create
export const createCategory = asyncHandler(async (req, res, next) => {
  let { name } = req.body;
  const userId = req.user._id;
  const checkName = await categoryModel.findOne({ name });
  if (checkName) {
    return next(new Error(`Duplicated category name ${name}`, { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "category",
    }
  );
  const category = await categoryModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    createdBy: userId,
  });
  return res.status(201).json({ message: "Done", category });
});
//update
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  let { name, slug } = req.body;

  const Category = await categoryModel.findById({ _id: categoryId });
  if (!Category) {
    return next(new Error("In_valid category id", { cause: 400 }));
  }
  if (name) {
    if (Category.name == name) {
      return next(
        new Error(`sorry cannot update category with some name ${name}`, {
          cause: 400,
        })
      );
    }
    const checkCategoryName = await categoryModel.findOne({
      name,
      _id: { $ne: categoryId },
    });
    if (checkCategoryName) {
      return next(new Error(" category is already exist", { cause: 400 }));
    }
    Category.name = name;
    slug = slugify(name, "-");
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "category" }
    );
    await cloudinary.uploader.destroy(Category.image.public_id);
    Category.image = { secure_url, public_id };
  }
  await Category.save();
  return res.json({ message: "done", Category });
});
//delete
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const Category = await categoryModel.findByIdAndDelete({ _id: categoryId });
  if (!Category) {
    return next(new Error("In_valid category id", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(Category.image.public_id);
  return res.json({ message: "done", Category });
});
//search by name
export const searchByName = asyncHandler(async (req, res, next) => {
  const { searchKey } = req.query;
  const catagories = await categoryModel
    .findOne({
      name: {
        $regex: `${searchKey}`,
      },
    })
    .populate([
      {
        path: "subCategories",
      },
    ]);
  return res.json({ message: "done", catagories });
});
//get by id
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const catagories = await categoryModel.findById(categoryId).populate([
    {
      path: "subCategories",
    },
  ]);
  return res.json({ message: "done", catagories });
});
//get All catogory
export const getAll = asyncHandler(async (req, res, next) => {
  const Query = categoryModel.find().populate([
    {
      path: "subCategories",
    },
  ]);
  const apiFeatures = new ApiFeatures(Query, req.query)
    .pagination(categoryModel)
    .sort()
    .filter()
    .select()
    .search();
  const catagories = await apiFeatures.mongooseQuery;
  return res.json({ message: "done", catagories });
});
