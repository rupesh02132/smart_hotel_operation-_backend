const paymentService = require("../service/paymentService");
const { updatePaymentInformationByBookingId } = require("../service/paymentService");
const Booking = require("../models/Booking");
// @desc    Create payment link using booking ID

const createPaymentLinkByListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    const paymentLink = await paymentService.createPaymentLinkByBookingId(id);
    return res.status(200).json(paymentLink);
  } catch (err) {
    console.error("Error creating payment link:", err.message);
    return res.status(500).json({ message: err.message });
  }
};


// @desc    Update payment status using booking ID

const updatePaymentInformation = async (req, res) => {
  try {
    const { payment_id, booking_id } = req.query;

    if (!payment_id || !booking_id) {
      return res.status(400).json({ message: "payment_id and booking_id are required" });
    }

    const result = await updatePaymentInformationByBookingId({
      payment_id,
      booking_id,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error updating payment info:", err.message);
    return res.status(500).json({ message: "Payment update failed: " + err.message });
  }
};




module.exports = {
  createPaymentLinkByListing,
  updatePaymentInformation ,
};
