const express = require("express");
const { razorpayWebhook ,razorpayRedirect} = require("../controllers/webhookController");
const crypto = require("crypto");
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




router.post("/verify", async (req, res) => {
  const {
    bookingId,
    paymentId,
    paymentLinkId,
    signature,
  } = req.body;

  const body = paymentLinkId + "|" + paymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  console.log("EXPECTED:", expectedSignature);
  console.log("RECEIVED:", signature);

  if (expectedSignature !== signature) {
    return res.status(400).json({
      message: "Invalid signature ❌",
    });
  }

  const booking = await Booking.findById(bookingId);

  booking.isPaid = true;
  booking.paymentStatus = "paid";
  booking.paymentMethod = "Razorpay";

  await booking.save();

  res.json({ success: true });
});
module.exports = router;
