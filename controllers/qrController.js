// const Booking = require("../models/Booking");
// const Room = require("../models/Room");
// const QRCode = require("qrcode");
// const jwt = require("jsonwebtoken");
// const { getIO } = require("../utils/socket");



// /* ============================================================
//    GENERATE QR (ADMIN / STAFF)
//    POST /api/qr/generate/:id

// const generateQR = async (req, res) => {
//   try {
//     const bookingId = req.params.id;

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.status !== "Booked") {
//       return res.status(400).json({
//         message: "QR can only be generated for Booked status",
//       });
//     }

//     if (booking.paymentStatus !== "paid") {
//       return res.status(400).json({
//         message: "Payment must be completed before QR generation",
//       });
//     }

//     const token = jwt.sign(
//       { bookingId },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     const qrImage = await QRCode.toDataURL(token);

//     booking.qrToken = token;
//     booking.qrExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     await booking.save();

//     res.json({
//       qrToken: token,
//       qrImage,
//       expiresAt: booking.qrExpiresAt,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// const selfCheckIn = async (req, res) => {
//   try {
//     const { token } = req.params;

//     // 1️⃣ Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const bookingId = decoded.bookingId;

//     const booking = await Booking.findById(bookingId)
//       .populate("room");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // 2️⃣ Validate Booking Status
//     if (booking.status !== "Booked") {
//       return res.status(400).json({
//         message: "Only Booked bookings can check-in",
//       });
//     }

//     // 3️⃣ Validate Payment
//     if (booking.paymentStatus !== "paid") {
//       return res.status(400).json({
//         message: "Payment not completed",
//       });
//     }

//     if (!booking.room) {
//       return res.status(400).json({
//         message: "Room not assigned",
//       });
//     }

//     // 4️⃣ Validate Room Status
//     if (
//       booking.room.status !== "Vacant" &&
//       booking.room.status !== "Ready"
//     ) {
//       return res.status(400).json({
//         message: "Room is not available for check-in",
//       });
//     }

//     // 5️⃣ Update Booking
//     booking.status = "checked-in";
//     booking.checkInStatus = true;
//     booking.checkIn = new Date();

//     await booking.save();

//     // 6️⃣ Update Room
//     booking.room.status = "Occupied";
//     await booking.room.save();

//     res.json({
//       success: true,
//       message: "Guest Checked-In Successfully",
//       booking,
//     });

//   } catch (err) {

//     if (err.name === "TokenExpiredError") {
//       return res.status(400).json({
//         message: "QR Token Expired",
//       });
//     }

//     if (err.name === "JsonWebTokenError") {
//       return res.status(400).json({
//         message: "Invalid QR Token",
//       });
//     }

//     res.status(500).json({ message: err.message });
//   }
// };



// const selfCheckOut = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const bookingId = decoded.bookingId;

//     const booking = await Booking.findById(bookingId)
//       .populate("room");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     if (booking.status !== "checked-in") {
//       return res.status(400).json({
//         message: "Only checked-in bookings can check-out",
//       });
//     }

//     if (!booking.room) {
//       return res.status(400).json({
//         message: "Room not assigned",
//       });
//     }

//     // Update Booking
//     booking.status = "checked-out";
//     booking.checkOutStatus = true;
//     booking.checkOut = new Date();

//     await booking.save();

//     // Update Room
//     booking.room.status = "Cleaning";
//     await booking.room.save();

//     res.json({
//       success: true,
//       message: "Guest Checked-Out Successfully",
//       booking,
//     });

//   } catch (err) {

//     if (err.name === "TokenExpiredError") {
//       return res.status(400).json({
//         message: "QR Token Expired",
//       });
//     }

//     if (err.name === "JsonWebTokenError") {
//       return res.status(400).json({
//         message: "Invalid QR Token",
//       });
//     }

//     res.status(500).json({ message: err.message });
//   }
// };
// */

// const generateQR = async (req, res) => {
//   try {
//     const bookingId = req.params.id;

//     const booking = await Booking.findById(bookingId);

//     if (!booking)
//       return res.status(404).json({ message: "Booking not found" });

//     if (booking.status !== "Booked")
//       return res.status(400).json({
//         message: "QR can only be generated for Booked status",
//       });

//     if (booking.paymentStatus !== "paid")
//       return res.status(400).json({
//         message: "Payment must be completed before QR generation",
//       });

//     const token = jwt.sign(
//       { bookingId },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     const qrImage = await QRCode.toDataURL(token);

//     booking.qrToken = token;
//     booking.qrExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     booking.qrUsed = false;         // 🔐 reset usage
//     booking.qrUsedAt = null;

//     await booking.save();

//     res.json({
//       qrToken: token,
//       qrImage,
//       expiresAt: booking.qrExpiresAt,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const selfCheckIn = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const bookingId = decoded.bookingId;

//     const booking = await Booking.findById(bookingId)
//       .populate("room");

//     if (!booking)
//       return res.status(404).json({ message: "Booking not found" });

//     // 🔐 SINGLE USE CHECK
//     if (booking.qrUsed)
//       return res.status(400).json({
//         message: "QR already used",
//       });

//     if (booking.qrToken !== token)
//       return res.status(400).json({
//         message: "Invalid QR token",
//       });

//     if (new Date() > booking.qrExpiresAt)
//       return res.status(400).json({
//         message: "QR expired",
//       });

//     if (booking.status !== "Booked")
//       return res.status(400).json({
//         message: "Only Booked bookings can check-in",
//       });

//     if (booking.paymentStatus !== "paid")
//       return res.status(400).json({
//         message: "Payment not completed",
//       });

//     if (
//       booking.room.status !== "Vacant" &&
//       booking.room.status !== "Ready"
//     )
//       return res.status(400).json({
//         message: "Room not available",
//       });

//     // ✅ UPDATE BOOKING
//     booking.status = "checked-in";
//     booking.checkInStatus = true;
//     booking.checkIn = new Date();
//     booking.qrUsed = true;              // 🔐 mark used
//     booking.qrUsedAt = new Date();

//     await booking.save();

//     // ✅ UPDATE ROOM
//     booking.room.status = "Occupied";
//     await booking.room.save();

//     // 📡 SOCKET BROADCAST
//     const io = getIO();
//     io.emit("guestCheckedIn", {
//       bookingId: booking._id,
//       roomId: booking.room._id,
//       status: "Occupied",
//     });

//     res.json({
//       success: true,
//       message: "Guest Checked-In Successfully",
//       booking,
//     });

//   } catch (err) {
//     if (err.name === "TokenExpiredError")
//       return res.status(400).json({ message: "QR Token Expired" });

//     if (err.name === "JsonWebTokenError")
//       return res.status(400).json({ message: "Invalid QR Token" });

//     res.status(500).json({ message: err.message });
//   }
// };

// const selfCheckOut = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const bookingId = decoded.bookingId;

//     const booking = await Booking.findById(bookingId)
//       .populate("room");

//     if (!booking)
//       return res.status(404).json({ message: "Booking not found" });

//     if (booking.status !== "checked-in")
//       return res.status(400).json({
//         message: "Only checked-in bookings can check-out",
//       });

//     booking.status = "checked-out";
//     booking.checkOutStatus = true;
//     booking.checkOut = new Date();

//     await booking.save();

//     booking.room.status = "Cleaning";
//     await booking.room.save();

//     // 📡 SOCKET BROADCAST
//     const io = getIO();
//     io.emit("guestCheckedOut", {
//       bookingId: booking._id,
//       roomId: booking.room._id,
//       status: "Cleaning",
//     });

//     res.json({
//       success: true,
//       message: "Guest Checked-Out Successfully",
//       booking,
//     });

//   } catch (err) {
//     if (err.name === "TokenExpiredError")
//       return res.status(400).json({ message: "QR Token Expired" });

//     if (err.name === "JsonWebTokenError")
//       return res.status(400).json({ message: "Invalid QR Token" });

//     res.status(500).json({ message: err.message });
//   }
// };




// verifyQR = async (req, res) => {
//   const { token } = req.body;

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     const booking = await Booking.findById(
//       decoded.bookingId
//     );

//     if (!booking)
//       return res.status(404).json({
//         message: "Booking not found",
//       });

//     if (booking.qrUsed)
//       return res.status(400).json({
//         message: "QR already used",
//       });

//     booking.status = "Checked-In";
//     booking.qrUsed = true;

//     const room = await Room.findById(
//       booking.room
//     );

//     room.status = "Occupied";

//     await booking.save();
//     await room.save();

//     res.json({
//       message: "Check-in successful 🎉",
//     });
//   } catch (err) {
//     res.status(400).json({
//       message: "Invalid or expired QR",
//     });
//   }
// };

// module.exports = {
//   generateQR,
//   selfCheckIn,
//   selfCheckOut,
// };


const Booking = require("../models/Booking");
const Room = require("../models/Room");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const { getIO } = require("../utils/socket");



const generateQR = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { type } = req.body;

    if (!["checkin", "checkout"].includes(type)) {
      return res.status(400).json({
        message: "Invalid QR type",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    /* =========================
       CHECK-IN VALIDATION
    ========================== */

    if (type === "checkin") {
      if (booking.status !== "Booked") {
        return res.status(400).json({
          message: "Check-in allowed only when status = Booked",
        });
      }

      // support both structures
      if (
        booking.paymentStatus !== "paid" &&
        booking.isPaid !== true
      ) {
        return res.status(400).json({
          message: "Payment not completed",
        });
      }
    }

    /* =========================
       CHECK-OUT VALIDATION
    ========================== */

    if (type === "checkout") {
      if (booking.status !== "checked-in") {
        return res.status(400).json({
          message:
            "Checkout allowed only when status = checked-in",
        });
      }
    }

    /* =========================
       CREATE QR TOKEN
    ========================== */

    const token = jwt.sign(
      {
        bookingId,
        type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const qrImage = await QRCode.toDataURL(token);

    booking.qrToken = token;
    booking.qrType = type;
    booking.qrExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    booking.qrUsed = false;
    booking.qrUsedAt = null;

    await booking.save();

    res.json({
      success: true,
      qrToken: token,
      qrImage,
      expiresAt: booking.qrExpiresAt,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
/* ============================================================
   VERIFY QR (CHECK-IN / CHECK-OUT)
   POST /api/qr/verify/:token
============================================================ */


const verifyQR = async (req, res) => {
  try {
    const { token } = req.params;

    /* ===============================
       VERIFY TOKEN
    =============================== */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const { bookingId, type } = decoded;

    const booking = await Booking.findById(bookingId)
      .populate("room");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    /* ===============================
       BASIC VALIDATIONS
    =============================== */

    if (!booking.room) {
      return res.status(400).json({
        message: "Room not assigned",
      });
    }

    if (booking.qrUsed) {
      return res.status(400).json({
        message: "QR already used",
      });
    }

    if (booking.qrToken !== token) {
      return res.status(400).json({
        message: "Invalid QR token",
      });
    }

    if (!booking.qrExpiresAt || new Date() > booking.qrExpiresAt) {
      return res.status(400).json({
        message: "QR expired",
      });
    }

    /* ===============================
       CHECK-IN FLOW
    =============================== */
    if (type === "checkin") {

      // Booking must be reserved
      if (booking.status !== "Booked") {
        return res.status(400).json({
          message: "Booking not valid for check-in",
        });
      }

      // Payment must be completed
      if (!booking.isPaid) {
        return res.status(400).json({
          message: "Payment not completed",
        });
      }

      // Room must be physically available
      if (!["Vacant", "Ready"].includes(booking.room.status)) {
        return res.status(400).json({
          message: "Room not available",
        });
      }

      // Update booking
      booking.status = "checked-in";
      booking.checkInStatus = true;
      booking.checkIn = new Date();

      // Update room
      booking.room.status = "Occupied";
    }

    /* ===============================
       CHECK-OUT FLOW
    =============================== */
    if (type === "checkout") {

      if (booking.status !== "checked-in") {
        return res.status(400).json({
          message: "Booking not valid for checkout",
        });
      }

      booking.status = "checked-out";
      booking.checkOutStatus = true;
      booking.checkOut = new Date();

      booking.room.status = "Cleaning";
    }

    /* ===============================
       MARK QR AS USED (SINGLE USE)
    =============================== */
    if(booking.status === "checked-in" && booking.status === "checked-out") {
      booking.qrUsed = true;
      booking.qrUsedAt = new Date();
    }

    await booking.room.save();
    await booking.save();

    /* ===============================
       SOCKET UPDATE
    =============================== */
    const io = getIO();

    io.emit("roomStatusUpdated", {
      bookingId: booking._id,
      roomId: booking.room._id,
      bookingStatus: booking.status,
      roomStatus: booking.room.status,
    });

    return res.json({
      success: true,
      message:
        type === "checkin"
          ? "Guest Checked-In Successfully"
          : "Guest Checked-Out Successfully",
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "QR Token Expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({
        message: "Invalid QR Token",
      });
    }

    return res.status(500).json({
      message: err.message,
    });
  }
};



module.exports = {
  generateQR,
  verifyQR,
};