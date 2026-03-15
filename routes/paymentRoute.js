const express = require("express");
const { createPaymentLink ,getHostEarnings} = require("../controllers/payment.controller");
const { protect } = require("../middleware/authMiddleware");
const {razorpayWebhook}=require("../controllers/webhookController");
const router = express.Router();

/* Create payment link for booking */
router.post("/booking/:bookingId", protect, createPaymentLink);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

router.get("/hostEarnings", protect, getHostEarnings);

module.exports = router;
