const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsByListing,
  getAllReviews,
  deleteReview,
  respondToReview,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

/* ============================================================
   CREATE REVIEW (USER)
============================================================ */
router.post("/", protect, createReview);

/* ============================================================
   GET REVIEWS FOR A LISTING (PUBLIC)
============================================================ */
router.get("/listing/:listingId", getReviewsByListing);

/* ============================================================
   GET ALL REVIEWS (ADMIN / MANAGER)
============================================================ */
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  getAllReviews
);

/* ============================================================
   DELETE REVIEW (ADMIN)
============================================================ */
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteReview
);

/* ============================================================
   HOTEL RESPONSE TO REVIEW (ADMIN / MANAGER)
============================================================ */
router.post(
  "/:id/respond",
  protect,
  authorize("admin", "manager"),
  respondToReview
);

module.exports = router;
