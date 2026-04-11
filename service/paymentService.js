const razorpay = require("../config/razorpayClient");
const Booking = require("../models/Booking");
const { calculateDynamicPrice } = require("../utils/dynamicPricing");

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

  const booking = await Booking.findById(bookingId)
    .populate("user")
    .populate({
      path: "room",
      populate: { path: "listing" },
    });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isPaid) {
    throw new Error("Booking already paid");
  }

  /* ===============================
     🔒 PRICE LOCK + DYNAMIC PRICING
  =============================== */

  let totalPrice;

  if (booking.lockedPrice) {
    // ✅ USE LOCKED PRICE
    totalPrice = booking.totalPrice;
    console.log("🔒 Using locked price:", totalPrice);

  } else {
    // 🔥 RECALCULATE PRICE
    const pricing = await calculateDynamicPrice(
      booking.room._id,
      booking.checkInDate
    );

    const nights = Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
      (1000 * 60 * 60 * 24)
    );

    totalPrice = pricing.finalPrice * Math.max(nights, 1);

    // ✅ SAVE & LOCK PRICE
    booking.pricePerNight = pricing.finalPrice;
    booking.totalPrice = totalPrice;
    booking.lockedPrice = true;
    booking.priceLockedAt = new Date();

    await booking.save();

    console.log("💰 New dynamic price locked:", totalPrice);
  }

  /* ===============================
     SANITIZE CONTACT
  =============================== */

  const customerContact = sanitizePhone(
    booking.user.phone || booking.user.mobile
  );

  /* ===============================
     RAZORPAY PAYMENT LINK
  =============================== */

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: totalPrice * 100, // ✅ FIXED
      currency: "INR",
      reference_id: booking._id.toString(),

      customer: {
        name: `${booking.user.firstname} ${booking.user.lastname}`,
        email: booking.user.email,
        contact: customerContact,
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
      amount: totalPrice,
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
