import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as authController from "./controller/registration.js";
import { Router } from "express";

const router = Router();

router.post(
  "/signUp",
  fileUpload(fileValidation.image).single("image"),
  authController.signUp
);
router.patch("/confirmEmail", authController.confirmEmail);
router.post("/signIn", authController.signIn);
router.patch("/sendCode", authController.sendCode);
router.patch("/resetPass", authController.resetPass);

export default router;
