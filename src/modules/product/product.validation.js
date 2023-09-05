import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
export const addProduct = joi
  .object({
    name: generalFields.name,
    files: joi.object().keys({
      image: joi.array().items(generalFields.file).length(1).required(),
      coverImages: joi.array().items(generalFields.file).length(2),
    }),
    description: generalFields.name.min(30),
    quantity: joi.number().min(1).positive(),
    price: joi.number().min(0).positive(),
    discount: joi.number().min(0).max(100),
    colors: joi.custom((value, helper) => {
      if (value) {
        value = JSON.parse(value);
        const arrayValidationSchema = joi.object({
          value: joi.array().items(joi.string()),
        });
        const valRes = arrayValidationSchema.validate({ value });
        if (valRes.error) {
          return helper.message("in valid value of colors");
        }
        return true;
      }
    }),
    sizes: joi.custom((value, helper) => {
      if (value) {
        value = JSON.parse(value);
        const arrayValidationSchema = joi.object({
          value: joi.array().items(joi.string()),
        });
        const valRes = arrayValidationSchema.validate({ value });
        if (valRes.error) {
          return helper.message("in valid value of size");
        }
        return true;
      }
    }),
    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    brandId: generalFields.id,
  })
  .required();
