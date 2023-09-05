import { auth, roles } from "../../middleware/auth.js";
import * as couponController from "./controller/coupon.js";
import { Router } from "express";
const router = Router();

router.route("/").post(auth([roles.Admin]), couponController.createCoupon);

export default router;
