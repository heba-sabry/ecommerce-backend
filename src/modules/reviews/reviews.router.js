import { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import * as reviewController from "./controller/reviews.js";
const router = Router({ mergeParams: true });

router
  .route("/:productId")
  .post(auth([roles.User]), reviewController.addReview);
router
  .route("/:reviewId")
  .put(auth([roles.User]), reviewController.updateReview)
  .delete(auth([roles.User]), reviewController.deleteReview)

router.get("/", reviewController.getReviews);

export default router;
