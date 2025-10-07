const razorpay = require("../config/razorpayClient");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

const createPaymentLinkByBookingId = async (bookingId) => {
  console.log("Booking ID:", bookingId);

  try {
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      throw new Error("Booking not found" + bookingId);
    }

    const user = booking.user;
    const listing = booking.listing;

    const paymentLinkRequest = {
      amount: booking.totalPrice * 100,
      currency: "INR",
      reference_id: booking._id.toString(),
      customer: {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        contact: user.mobile,
      },
      notify: { sms: true, email: true },
      reminder_enable: true,
      callback_url: `${process.env.FRONTEND_URL}/payment/${booking._id}`,
      callback_method: "get",
    };

    // Try to create payment link
    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    // Add this check:
    if (!paymentLink || !paymentLink.short_url) {
      console.log("Invalid Razorpay response:", paymentLink);
      throw new Error("Invalid response from Razorpay");
    }

    return {
      paymentLinkId: paymentLink.id,
      payment_link_url: paymentLink.short_url,
    };
  } catch (err) {
    console.error("Payment link creation failed:", err.message);
    throw new Error("Payment link creation failed: " + err.message);
  }
};

const updatePaymentInformationByBookingId = async ({
  payment_id,
  booking_id,
}) => {
  try {
    console.log("Booking ID:", booking_id);
    console.log("Payment ID:", payment_id);

    const booking = await Booking.findById(booking_id).populate("listing");

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.isPaid) {
      return {
        success: true,
        message: "Booking already marked as paid",
        bookingId: booking._id,
      };
    }

    const payment = await razorpay.payments.fetch(payment_id);
    if (payment.status !== "captured") {
      throw new Error("Payment not captured");
    }

    booking.paymentDetails = {
      paymentId: payment_id,
      status: payment.status,
      method: payment.method,
      amount: payment.amount / 100,
    };
    booking.isPaid = true;
    await booking.save();

    await Listing.findByIdAndUpdate(booking.listing._id, {
      isAvailable: false,
    });

    return {
      success: true,
      message: "Payment captured and booking updated",
      bookingId: booking._id,
    };
  } catch (err) {
    console.error("Payment update failed:", err.message);
    throw new Error("Payment update failed: " + err.message);
  }
};

module.exports = {
  createPaymentLinkByBookingId,
  updatePaymentInformationByBookingId,
};
