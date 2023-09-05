import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createSubCategory = joi
  .object({
    name: generalFields.name,
    subCategoryId: generalFields.id,
    file: generalFields.file,
  })
  .required();
export const updateSubCategory = joi.object({
  subCategoryId: generalFields.id,
  name: joi.string().min(3),
  file: generalFields.file,
});
export const deleteSubCategory = joi.object({
  subCategoryId: generalFields.id,
});
