const Attendance = require("../models/Attendance");
const { getIO } = require("../utils/socket");

/* STAFF CHECK-IN */
const staffCheckIn = async (req, res) => {
  try {
    const staffId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    let record = await Attendance.findOne({ staff: staffId, date: today });
    if (record) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    record = new Attendance({
      staff: staffId,
      date: today,
      checkInTime: new Date(),
      status: "Present", // will be updated on check-out
    });
    await record.save();

    const io = getIO();
    io.emit("attendanceUpdated", { message: "Staff checked in" });

    res.json({ message: "Check-in successful", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* STAFF CHECK-OUT */
const staffCheckOut = async (req, res) => {
  try {
    const staffId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({ staff: staffId, date: today });
    if (!record) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    record.checkOutTime = new Date();
    const hours = (record.checkOutTime - record.checkInTime) / (1000 * 60 * 60);
    record.status = hours >= 4 ? "Present" : "Half-Day";

    await record.save();

    const io = getIO();
    io.emit("attendanceUpdated", { message: "Staff checked out" });

    res.json({ message: "Check-out successful", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ADMIN - GET ALL ATTENDANCE */
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("staff", "firstname lastname email role")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { staffCheckIn, staffCheckOut, getAllAttendance };