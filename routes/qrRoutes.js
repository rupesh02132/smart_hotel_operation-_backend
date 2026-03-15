const express = require("express");
const {
  generateQR,
  verifyQR
  
} = require("../controllers/qrController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   GENERATE QR (ADMIN / STAFF ONLY)
   POST /api/qr/generate/:id
============================================================ */
router.post(
  "/generate/:id",
  protect,

  generateQR
);


router.post(
  "/verify/:token",
  verifyQR
);

module.exports = router;