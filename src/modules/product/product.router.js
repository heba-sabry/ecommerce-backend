import { Router } from "express";
const router = Router();
import * as productController from "./controller/product.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as validators from "./product.validation.js";
import { validation } from "../../middleware/validation.js";
import { auth, roles } from "../../middleware/auth.js";
import reviewRouter from "../reviews/reviews.router.js"

router.use("/:productId/review", reviewRouter);

router
  .route("/")
  .post(
    auth([roles.Admin]),
    fileUpload(fileValidation.image).fields([
      { name: "image", maxCount: 1 },
      { name: "coverImages", maxCount: 5 },
    ]),
    validation(validators.addProduct),
    productController.addProduct
  )
  .get(productController.getProducts);

export default router;
