import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as subCategoryController from "./controller/subCategory.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./subcategory.validation.js";
import { auth, roles } from "../../middleware/auth.js";
const router = Router({ mergeParams: true });
router
  .route("/")
  .post(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.createSubCategory),
    subCategoryController.createSubCategory
  )
  .get(subCategoryController.getSubCategory);
router
  .route("/:subCategoryId")
  .put(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateSubCategory),
    subCategoryController.updateSubCategory
  )
  .delete(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.deleteSubCategory),
    subCategoryController.deleteSubCategory
  );
export default router;
