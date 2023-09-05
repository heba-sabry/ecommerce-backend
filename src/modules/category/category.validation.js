import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const createCategory = joi
  .object({
    name: joi.string().min(3).required(),
    slug: joi.string(),
    file: generalFields.file.required(),
  })
  .required();
export const updateCategory = joi
  .object({
    categoryId: generalFields.id,
    name: joi.string().min(3),
    file: generalFields.file,
  })
  .required();
export const deleteCategory = joi
  .object({
    categoryId: generalFields.id,
  })
  .required();
export const searchByName = joi
  .object({
    searchKey: generalFields.name,
  })
  .required();
export const getCategoryById = joi
  .object({
    categoryId: generalFields.id,
  })
  .required();
