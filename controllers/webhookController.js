const crypto = require("crypto");
const Booking = require("../models/Booking");
const { generateInvoiceAndEmail } = require("../service/invoiceService");
const { getIO } = require("../utils/socket");

const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const crypto = require("crypto");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Invalid signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    console.log("FULL EVENT:", JSON.stringify(event, null, 2));

    const payment = event.payload?.payment?.entity;

    const bookingId =
      payment?.notes?.bookingId ||
      event.payload?.payment_link?.entity?.reference_id;

    console.log("📌 Booking ID:", bookingId);

    if (!bookingId) {
      console.log("❌ No bookingId found");
      return res.json({ received: true });
    }

    if (
      event.event === "payment.captured" ||
      event.event === "payment_link.paid"
    ) {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.log("❌ Booking not found");
        return res.json({ received: true });
      }

      if (booking.isPaid) {
        console.log("⚠️ Already paid");
        return res.json({ received: true });
      }

      booking.isPaid = true;
      booking.paymentStatus = "paid";
      booking.paymentMethod = "Razorpay";

      booking.paymentDetails = {
        paymentId: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount / 100,
      };

      await booking.save();

      console.log("✅ PAYMENT UPDATED:", booking._id);

      io.emit("paymentSuccess", { bookingId });

      try {
        await generateInvoiceAndEmail(booking);
      } catch (err) {
        console.error("Invoice error:", err);
      }
    }

    if (event.event === "payment.failed") {
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: "failed",
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ message: "Webhook failed" });
  }
};




// const razorpayWebhook = async (req, res) => {
//   try {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//     const signature = req.headers["x-razorpay-signature"];
//     const body = req.body.toString();

//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(body)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       console.log("❌ Invalid webhook signature");
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     const event = JSON.parse(body);

//     console.log("✅ Webhook Event:", event.event);

//     /* ==============================
//        PAYMENT LINK SUCCESS
//     ============================== */
//     if (event.event === "payment_link.paid") {
//       const payment = event.payload.payment.entity;
//       const bookingId = event.payload.payment_link.entity.reference_id;

//       const booking = await Booking.findById(bookingId);

//       if (!booking) {
//         console.log("❌ Booking not found:", bookingId);
//         return res.json({ received: true });
//       }

//       // 🔐 Idempotency protection
//       if (booking.isPaid) {
//         console.log("⚠️ Booking already paid");
//         return res.json({ received: true });
//       }

//       booking.isPaid = true;
//       booking.paymentStatus = "paid";
//       booking.paymentMethod = "Razorpay";

//       booking.paymentDetails = {
//         paymentId: payment.id,
//         status: payment.status,
//         method: payment.method,
//         amount: payment.amount / 100,
//       };

//       await booking.save();
//           // ✅ Emit Live Payment Success
//     getIO().emit("paymentSuccess", {
//       bookingId: booking._id,
//       amount: booking.totalPrice,
//       room: booking.room.title,
//     });


//       console.log("✅ Booking Updated:", booking._id);

//       // Auto invoice
//       await generateInvoiceAndEmail(booking);
//     }

//     /* ==============================
//        PAYMENT LINK FAILED
//     ============================== */
//     if (
//       event.event === "payment_link.failed" ||
//       event.event === "payment_link.expired"
//     ) {
//       const bookingId = event.payload.payment_link.entity.reference_id;

//       await Booking.findByIdAndUpdate(bookingId, {
//         paymentStatus: "failed",
//       });

//       console.log("❌ Payment Failed:", bookingId);
//     }

//     return res.json({ received: true });
//   } catch (err) {
//     console.error("Webhook Error:", err.message);
//     return res.status(500).json({ message: "Webhook error" });
//   }
// };






module.exports = { razorpayWebhook };
