const express = require("express");
const router = express.Router();

const {
  createReview,
  getAllReviews,
  respondToReview,
  getListingReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);

router.get("/listing/:id", getListingReviews);

router.get("/", protect, authorize("admin", "manager"), getAllReviews);

router.delete("/:id", protect, deleteReview);

router.post(
  "/:id/respond",
  protect,
  authorize("admin", "manager"),
  respondToReview,
);

module.exports = router;
module.exports = router;
