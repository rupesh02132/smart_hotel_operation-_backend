const paymentService = require("../service/paymentService");
const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");

const createPaymentLink = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result =
      await paymentService.createPaymentLinkByBookingId(bookingId);

      // ✅ Step 3: Send notification to user
      await Notification.create({
        user: req.user._id,
        type: "payment",
        title: "Payment Link Created",
        message: `A payment link has been created for your booking.`,
        link: `/booking/${bookingId}`,
      });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Payment link error:", error.message);

   res.status(400).json({
  success: false,
  message: error.message,
  stack: error.stack, // TEMP ONLY
});

  }
};




/* ================================
   GET HOST TOTAL EARNINGS
   GET /api/payments/host/earnings
================================ */
const getHostEarnings = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  // ✅ Step 1: Find all listings created by host
  const hostListings = await Listing.find({ user: hostId }).select("_id");

  const listingIds = hostListings.map((l) => l._id);

  // ✅ Step 2: Find paid bookings for those listings
  const bookings = await Booking.find({
    listing: { $in: listingIds },
    paymentStatus: "paid",
  });

  // ✅ Step 3: Calculate earnings
  const totalEarnings = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

  res.json({
    totalEarnings,
    totalBookings: bookings.length,
  });
});



module.exports = { createPaymentLink, getHostEarnings };
