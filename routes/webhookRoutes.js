const express = require("express");
const { razorpayWebhook ,razorpayRedirect} = require("../controllers/webhookController");

const router = express.Router();

/* Razorpay Webhook */
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);
// router.get(
//   "/razorpay/payment/:id",
//   razorpayRedirect
// );
module.exports = router;
