const express = require("express");
const {
  createPaymentLinkByListing,
 updatePaymentInformation,
} = require("../controllers/payment.controller");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Create payment link for a specific listing
router.post('/listing/:id', authenticate, createPaymentLinkByListing);


// Razorpay callback to update payment info
router.get("/update",authenticate, updatePaymentInformation);

module.exports = router;
