const razorpay = require("../config/razorpayClient");
const Booking = require("../models/Booking");

const sanitizePhone = (phone) => {
  if (!phone) return "9999999999";

  // Convert to string, remove non-digits
  const cleaned = phone.toString().replace(/\D/g, "");

  // Razorpay requires 10–15 digits
  if (cleaned.length < 10) return "9999999999";

  return cleaned.slice(-10); // keep last 10 digits (India-safe)
};

const createPaymentLinkByBookingId = async (bookingId) => {
  console.log("▶ paymentService called with bookingId:", bookingId);

  if (!bookingId) {
    throw new Error("Booking ID is missing");
  }

  const booking = await Booking.findById(bookingId).populate("user");

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isPaid) {
    throw new Error("Booking already paid");
  }

  /* ===============================
     SANITIZED CUSTOMER CONTACT
  =============================== */
  const customerContact = sanitizePhone(
    booking.user.phone || booking.user.mobile
  );

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: booking.totalPrice * 100,
      currency: "INR",
      reference_id: booking._id.toString(),

      customer: {
        name: `${booking.user.firstname} ${booking.user.lastname}`,
        email: booking.user.email,
        contact: customerContact, // ✅ FIXED
      },

      notify: { sms: true, email: true },
      reminder_enable: true,

callback_url: `${process.env.FRONTEND_URL}/payment/${booking._id}`,
callback_method: "get",

    });

    if (!paymentLink?.short_url) {
      throw new Error("Invalid Razorpay response");
    }

    return {
      paymentLinkId: paymentLink.id,
      paymentUrl: paymentLink.short_url,
    };
  } catch (err) {
    console.error("❌ Razorpay error:", err);

    throw new Error(
      err?.error?.description ||
        "Failed to create Razorpay payment link"
    );
  }
};

module.exports = { createPaymentLinkByBookingId };
