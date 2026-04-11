const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================
   HOTEL ANALYTICS API (ADMIN ONLY)
============================================ */
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  getAnalytics
);

module.exports = router;
