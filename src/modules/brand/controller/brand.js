import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { StatusCodes } from "http-status-codes";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
//add
export const addBrand = asyncHandler(async (req, res, next) => {
  let { name } = req.body;
  const userId = req.user._id;
  if (await brandModel.findOne({ name })) {
    return next(new Error(`${name} brand is already Exist`));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "brand" }
  );
  const brand = await brandModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    createdBy: userId,
  });
  return res.status(201).json({ message: "Done", brand });
});
//update
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  let { name } = req.body;

  const brand = await brandModel.findById({ _id: brandId });
  if (!brand) {
    return next(new Error("In_valid brand id", { cause: 400 }));
  }
  if (name) {
    if (brand.name == name) {
      return next(
        new Error(`sorry cannot update brand with some name ${name}`, {
          cause: 400,
        })
      );
    }
    const checkBrandName = await brandModel.findOne({
      name,
      _id: { $ne: brandId },
    });
    if (checkBrandName) {
      return next(new Error(" brand is already exist", { cause: 400 }));
    }
    brand.name = name;
    brand.slug = slugify(name, "-");
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "brand" }
    );
    await cloudinary.uploader.destroy(brand.image.public_id);
    brand.image = { secure_url, public_id };
  }
  await brand.save();
  return res.json({ message: "done", brand });
});
//delete
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await brandModel.findByIdAndDelete({ _id: brandId });
  if (!brand) {
    return next(new Error("In_valid brand id", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(brand.image.public_id);
  return res.json({ message: "done", brand });
});

//get by id
export const getBrandById = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await brandModel.findById(brandId);
  return res.status(StatusCodes.ACCEPTED).json({ message: "done", brand });
});
//get All brand
export const getAllBrand = asyncHandler(async (req, res, next) => {
  const Query = brandModel.find();
  const apiFeatures = new ApiFeatures(Query, req.query)
    .pagination()
    .sort()
    .filter()
    .select()
    .search();
  const brand = await apiFeatures.mongooseQuery;
  return res.status(StatusCodes.ACCEPTED).json({ message: "done", brand });
});
