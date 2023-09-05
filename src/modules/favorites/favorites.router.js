import { auth, roles } from "../../middleware/auth.js";
import * as favoritesController from "./controller/favorites.js";
import { Router } from "express";
const router = Router();

router
  .route("/:productId")
  .patch(auth([roles.User]), favoritesController.addFavorites);
router.route("/").get(auth([roles.User]), favoritesController.getFavorites);

export default router;
