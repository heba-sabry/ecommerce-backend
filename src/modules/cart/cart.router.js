import { auth, roles } from "../../middleware/auth.js";
import * as cartController from "../cart/controller/cart.js";
import { Router } from "express";
const router = Router();

router
  .route("/")
  .post(auth([roles.User]), cartController.addToCart)
  .get(auth([roles.User]), cartController.getUserCart);
router.route("/:id").delete(auth([roles.User]), cartController.deleteFromCart);

export default router;
