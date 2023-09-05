import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const addBrand = joi
  .object({
    name: generalFields.name.required(),
    slug: joi.string(),
    file: generalFields.file.required(),
  })
  .required();
export const updateBrand = joi
  .object({
    brandId: generalFields.id,
    name: joi.string().min(3),
    file: generalFields.file,
  })
  .required();
export const deleteBrand = joi
  .object({
    brandId: generalFields.id,
  })
  .required();
export const getBrandById = joi
  .object({
    brandId: generalFields.id,
  })
  .required();
