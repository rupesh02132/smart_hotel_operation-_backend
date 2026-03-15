const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    /* ======================
       USER
    ====================== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    /* ======================
       HOTEL LISTING
    ====================== */
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Listing", // Hotel
    },

    /* ======================
       ROOM TYPE (NEW)
    ====================== */
    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room", // Deluxe / Suite Room Model
    },

    roomsBooked: {
      type: Number,
      required: true,
      default: 1, // user can book 2 rooms etc
    },

    /* ======================
       SELF CHECK-IN / OUT
    ====================== */
    qrToken: String,

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    checkInStatus: {
      type: Boolean,
      default: false,
    },

    checkOutStatus: {
      type: Boolean,
      default: false,
    },

    /* ======================
       GUESTS & PRICE
    ====================== */
    guests: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
    pricePerNight: { type: Number, required: true },
    nights: { type: Number, required: true },

    /* ======================
       PAYMENT
    ====================== */
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentDetails: {
      paymentId: String,
      orderId: String,
      status: String,
      method: String,
      amount: Number,
    },

    /* ======================
       BOOKING STATUS
    ====================== */
    status: {
      type: String,
      enum: [
        "Booked",
        "checked-in",
        "checked-out",
        "cleaning",
        "completed",
        "cancelled",
      ],
      default: "Booked",
    },

    qrToken: String,
    qrExpiresAt: Date,
    qrUsed: {
      type: Boolean,
      default: false,
    },
    qrUsedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
