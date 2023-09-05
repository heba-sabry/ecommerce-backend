import express, { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import * as orderController from "./controller/order.js";
const router = Router();

router.route("/").post(auth([roles.User]), orderController.createOrder);
router.route("/:id").put(auth([roles.User]), orderController.cancelOrder);
  router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    orderController.webHook
  );

export default router;
