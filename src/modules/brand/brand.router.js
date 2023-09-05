import { Router } from "express";
import * as brandController from "../brand/controller/brand.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./brand.validation.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { auth, roles } from "../../middleware/auth.js";
const router = Router();

router
  .route("/")
  .post(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.addBrand),
    brandController.addBrand
  )
  .get(brandController.getAllBrand);
router
  .route("/:brandId")
  .put(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateBrand),
    brandController.updateBrand
  )
  .delete(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.deleteBrand),
    brandController.deleteBrand
  )
  .get(validation(validators.getBrandById), brandController.getBrandById);
export default router;
