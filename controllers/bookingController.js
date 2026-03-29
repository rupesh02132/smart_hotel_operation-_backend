const {
  createBookingService,
  getMyBookingsService,
  getHostBookingsService,
  findBookingByListingId,
  deleteBookingService,
  getAllBookingsService,
  findBookingByIdOrListing
} = require("../service/bookingService");
const Notification = require("../models/Notification");

const { processRefund } = require("../service/refundService");
const asyncHandler =require("express-async-handler");

const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const { getIO } = require("../utils/socket");

const Booking = require("../models/Booking");
const Room = require("../models/Room");

/* ============================================================
   CREATE BOOKING
============================================================ */
const createBooking = async (req, res) => {
  try {
    const createdBooking = await createBookingService({
      userId: req.user._id,
      ...req.body,
    });

    const populatedBooking = await Booking.findById(createdBooking._id)
      .populate("user", "firstname lastname email")
      .populate({
        path: "room",
        populate: { path: "listing", select: "title city" },
      });

      await Notification.create({
  user: populatedBooking.user._id,
  type: "booking",
  title: "Booking Confirmed",
  message: `Room ${populatedBooking.room.roomNumber} at ${populatedBooking.room.listing.title} booked`,
  link: `/booking/${populatedBooking._id}`,
});

    getIO().emit("newBooking", {
      bookingId: populatedBooking._id,
      guest: populatedBooking.user?.firstname,
      hotel: populatedBooking.room?.listing?.title,
      roomNumber: populatedBooking.room?.roomNumber,
      amount: populatedBooking.totalPrice,
      status: populatedBooking.status,
    });

    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



/* ============================================================
   GET MY BOOKINGS
============================================================ */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await getMyBookingsService(req.user._id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET HOST BOOKINGS
============================================================ */
const getHostBookings = async (req, res) => {
  try {
    const bookings = await getHostBookingsService(req.user._id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET BOOKING BY LISTING ID (ROOM ID)
============================================================ */
const getMyBookingsByListingId = async (req, res) => {
  try {
    const booking = await findBookingByListingId(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET BOOKING BY ID
============================================================ */
const getMyBookingsById = async (req, res) => {
  try {
    const booking = await findBookingByIdOrListing(req.params.booking_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   DELETE BOOKING
============================================================ */
const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await deleteBookingService(req.params.bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET ALL BOOKINGS
============================================================ */
const getAllBookingController = async (req, res) => {
  try {
    const bookings = await getAllBookingsService();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GENERATE QR
============================================================ */
const generateQR = async (req, res) => {
  try {
    const token = jwt.sign(
      { bookingId: req.params.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const qrImage = await QRCode.toDataURL(token);

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.qrToken = token;
    await booking.save();

    res.json({ qrImage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   SELF CHECK-IN
============================================================ */
const selfCheckIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ===============================
       VALIDATIONS
    =============================== */

    // Must be Booked
    if (booking.status !== "Booked") {
      return res.status(400).json({
        message: "Only Booked bookings can check-in",
      });
    }

    // Room must exist
    if (!booking.room) {
      return res.status(400).json({
        message: "Room not assigned",
      });
    }

    // Room must be Vacant or Ready
    if (
      booking.room.status !== "Vacant" &&
      booking.room.status !== "Ready"
    ) {
      return res.status(400).json({
        message: "Room is not available for check-in",
      });
    }

    /* ===============================
       UPDATE BOOKING
    =============================== */
    booking.status = "checked-in";
    booking.checkInStatus = true;
    booking.checkIn = new Date();
    await booking.save();

    /* ===============================
       UPDATE ROOM
    =============================== */
    booking.room.status = "Occupied";
    await booking.room.save();

    getIO().emit("guestCheckedIn", {
      bookingId: booking._id,
      roomId: booking.room._id,
    });

    res.json({
      success: true,
      message: "Guest Checked-In Successfully",
      booking,
    });

  } catch (err) {
    console.error("Self Check-In Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const selfCheckOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ===============================
       VALIDATIONS
    =============================== */

    // Must be checked-in
    if (booking.status !== "checked-in") {
      return res.status(400).json({
        message: "Only checked-in bookings can check-out",
      });
    }

    // Prevent double checkout
    if (booking.checkOutStatus === true) {
      return res.status(400).json({
        message: "Already checked-out",
      });
    }

    /* ===============================
       UPDATE BOOKING
    =============================== */
    booking.status = "checked-out";
    booking.checkOutStatus = true;
    booking.checkOut = new Date();
    await booking.save();

    /* ===============================
       UPDATE ROOM
    =============================== */
    if (!booking.room) {
      return res.status(400).json({
        message: "Room not found for booking",
      });
    }

    booking.room.status = "Cleaning";
    await booking.room.save();

    getIO().emit("guestCheckedOut", {
      bookingId: booking._id,
      roomId: booking.room._id,
    });

    res.json({
      success: true,
      message: "Guest Checked-Out Successfully",
      booking,
    });

  } catch (err) {
    console.error("Self Check-Out Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


/* ============================================================
   ACCEPT BOOKING
============================================================ */
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "firstname lastname")
      .populate({ path: "room", populate: { path: "listing" } });

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "Booked";
    await booking.save();

    getIO().emit("bookingAccepted", {
      bookingId: booking._id,
      guest: booking.user.firstname,
      roomNumber: booking.room?.roomNumber,
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   REJECT BOOKING
============================================================ */
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    getIO().emit("bookingRejected", { bookingId: booking._id });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   ASSIGN ROOM
============================================================ */
const assignRoomNumber = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.assignedRoomNumber = req.body.roomNumber;
    await booking.save();

    getIO().emit("roomAssigned", {
      bookingId: booking._id,
      roomNumber: req.body.roomNumber,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ============================================================
   MANUAL CHECK-IN / CHECK-OUT
============================================================ */
const manualCheckIn = selfCheckIn;
const manualCheckOut = selfCheckOut;

/* ============================================================
   EXPORTS (IMPORTANT: MUST MATCH ROUTES)
============================================================ */
module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getMyBookingsByListingId,
  getMyBookingsById,
  deleteBooking,
  getAllBookingController,
  generateQR,
  selfCheckIn,
  selfCheckOut,
  acceptBooking,
  rejectBooking,
  assignRoomNumber,
  manualCheckIn,
  manualCheckOut,
};