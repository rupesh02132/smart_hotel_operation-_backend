const razorpay = require("../config/razorpayClient");

const calculateRefundAmount = (booking) => {
  const hoursBeforeCheckIn =
    (new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60);

  if (hoursBeforeCheckIn >= 48) return booking.totalPrice;
  if (hoursBeforeCheckIn >= 24) return booking.totalPrice * 0.5;
  return 0;
};

const processRefund = async (booking) => {
  if (!booking.paymentDetails?.paymentId) return null;

  const refundAmount = calculateRefundAmount(booking);
  if (refundAmount <= 0) return null;

  const refund = await razorpay.payments.refund(
    booking.paymentDetails.paymentId,
    {
      amount: Math.round(refundAmount * 100),
    }
  );

  return refund;
};

module.exports = { processRefund, calculateRefundAmount };
