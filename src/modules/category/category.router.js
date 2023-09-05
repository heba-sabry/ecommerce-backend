import { Router } from "express";
import * as categoryController from "./controller/category.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./category.validation.js";
import subCategoryRouter from "../subcategory/subcategory.router.js";
import { auth, roles } from "../../middleware/auth.js";
import { endPoint } from "./category.endPoint.js";
const router = Router();
router.use("/:categoryId/subCategory", subCategoryRouter);
router
  .route("/")
  .post(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.createCategory),
    categoryController.createCategory
  )
  .get(validation(validators.searchByName), categoryController.searchByName);
router.get("/all", categoryController.getAll);
router
  .route("/:categoryId")
  .put(
    auth(endPoint.categoryCrud),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateCategory),
    categoryController.updateCategory
  )
  .delete(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.deleteCategory),
    categoryController.deleteCategory
  )
  .get(
    validation(validators.getCategoryById),
    categoryController.getCategoryById
  );

export default router;
