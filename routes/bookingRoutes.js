const express = require("express");

const {
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
  manualCheckIn,
  manualCheckOut,
  acceptBooking,
  rejectBooking,
  assignRoomNumber,
} = require("../controllers/bookingController");

const {
  authenticate,
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   CREATE BOOKING (USER)
============================================================ */
router.post("/createbooking", protect, createBooking);

/* ============================================================
   GET MY BOOKINGS (USER)
============================================================ */
router.get("/mybookings", protect, getMyBookings);

/* ============================================================
   GET HOST BOOKINGS (HOST)
============================================================ */
// router.get("/host", protect, authorize("host"), getHostBookings);
router.get("/host", protect,  getHostBookings);

/* ============================================================
   GET ALL BOOKINGS (ADMIN / MANAGER)
============================================================ */
router.get("/all", protect, authorize("admin", "manager"), getAllBookingController);

/* ============================================================
   GET BOOKING BY LISTING ID
============================================================ */
router.get("/listing/:bookingId", protect, getMyBookingsByListingId);

/* ============================================================
   GET BOOKING BY ID OR LISTING
============================================================ */
router.get("/booking/:booking_id", protect, getMyBookingsById);

/* ============================================================
   DELETE BOOKING (ADMIN / USER)
============================================================ */
router.delete("/:bookingId/delete", protect, deleteBooking);

/* ============================================================
   QR CODE GENERATION (ADMIN / STAFF)
============================================================ */
router.post("/generate-qr/:id", protect, authorize("admin", "staff"), generateQR);

/* ============================================================
   SELF CHECK-IN (PUBLIC - QR)
============================================================ */
router.post("/self-checkin", selfCheckIn);

/* ============================================================
   SELF CHECK-OUT (USER / STAFF)
============================================================ */
router.post("/self-checkout", protect, selfCheckOut);

// ✅ Manager Booking Control
router.put("/:id/accept", protect, acceptBooking);
router.put("/:id/reject", protect, rejectBooking);

router.put("/:id/assign-room", protect, assignRoomNumber);

router.put("/:id/manual-checkin", protect, manualCheckIn);
router.put("/:id/manual-checkout", protect, manualCheckOut);

/* ============================================================
   EXPORT
============================================================ */
module.exports = router;
