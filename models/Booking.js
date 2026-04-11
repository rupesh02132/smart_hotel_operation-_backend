const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Listing", // Hotel
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },

    roomsBooked: {
      type: Number,
      required: true,
      default: 1, // user can book 2 rooms etc
    },

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
    lockedPrice: { type: Boolean, default: false },
    priceLockedAt: { type: Date },

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
