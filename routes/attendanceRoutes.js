const express = require("express");
const {
  staffCheckIn,
  staffCheckOut,
  getAllAttendance,
} = require("../controllers/attendanceController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

/* STAFF */
router.post("/checkin", authenticate, staffCheckIn);
router.post("/checkout", authenticate, staffCheckOut);

/* ADMIN */
router.get("/", authenticate, getAllAttendance);

module.exports = router;
