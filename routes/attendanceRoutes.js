const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const {
  authenticate,
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkin", authenticate, attendanceController.staffCheckIn);
router.post("/checkout", authenticate, attendanceController.staffCheckOut);
router.get("/", authenticate, attendanceController.getAllAttendance);

module.exports = router;