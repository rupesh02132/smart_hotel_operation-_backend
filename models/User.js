const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define User Schema
const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: Number,
    },

    // Extended roles for Smart Hotel Platform
    role: {
      type: String,
      enum: ["user", "host", "admin", "staff", "manager"],
      default: "user",
    },

    // Staff housekeeping assignment
    assignedRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],

    // Fine-grained role-based permissions (optional)
    permissions: [
      {
        type: String,
        enum: ["BOOKINGS", "HOUSEKEEPING", "BILLING", "REPORTS", "ADMIN"],
      },
    ],

    otp: {
      type: Number,
    },

    otpExpire: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },

    profileImage: {
      type: String,
    },

    googleId: String,

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);



const User = mongoose.model("User", userSchema);

module.exports = User;
