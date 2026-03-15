const express = require("express");
const router = express.Router();

const {
  createRatingController,
  getAllRatings,
} = require("../controllers/ratingController");

const { protect, authorize } = require("../middleware/authMiddleware");

/* ============================================================
   CREATE RATING (USER)
============================================================ */
router.post("/create", protect, createRatingController);

/* ============================================================
   GET ALL RATINGS FOR A LISTING (PUBLIC)
============================================================ */
router.get("/listing/:listingId", getAllRatings);

module.exports = router;
