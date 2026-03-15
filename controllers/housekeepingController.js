const asyncHandler = require("express-async-handler");
const Room = require("../models/Room");
const Booking = require("../models/Booking");


const availability = asyncHandler(async (req, res) => {

  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  // Only Vacant or Ready rooms can be toggled
  if (!["Vacant", "Ready"].includes(room.status)) {
    res.status(400);
    throw new Error("Only Vacant or Ready rooms can change availability");
  }

  room.isAvailable = req.body.isAvailable;
  await room.save();

  res.json({
    success: true,
    message: "Room availability updated",
    room,
  });
});


/* =========================================
   GET HOUSEKEEPING TASKS
   GET /api/housekeeping/tasks
========================================= */
const getHousekeepingTasks = asyncHandler(async (req, res) => {

  // Rooms that need cleaning
  const roomsToClean = await Room.find({
    status: "Cleaning",
  })
    .populate("listing", "title")
    .sort({ updatedAt: -1 });

  const tasks = await Promise.all(
    roomsToClean.map(async (room) => {

      // Get latest checked-out booking
      const booking = await Booking.findOne({
        room: room._id,
        status: { $in: ["checked-out", "cleaning"] },
      })
        .populate("user", "firstname lastname email")
        .sort({ updatedAt: -1 });

      return {
        room,
        booking,
      };
    })
  );

  res.json(tasks);
});

/* =========================================
   MARK ROOM AS CLEANED
   PUT /api/housekeeping/clean/:id
========================================= */
const markRoomCleaned = asyncHandler(async (req, res) => {

  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  if (room.status !== "Cleaning") {
    res.status(400);
    throw new Error("Room is not in Cleaning state");
  }

  /* ===============================
     UPDATE ROOM
  =============================== */
  room.status = "Ready";
  room.lastCleanedAt = new Date();
  await room.save();

  /* ===============================
     UPDATE BOOKING
  =============================== */

  const booking = await Booking.findOne({
    room: room._id,
    status: { $in: ["checked-out", "cleaning"] },
  }).sort({ updatedAt: -1 });

  if (booking) {
    booking.status = "completed";
    await booking.save();
  }

  /* ===============================
     SOCKET EMIT
  =============================== */
  if (req.io) {
    req.io.emit("roomStatusUpdated", {
      roomId: room._id,
      status: room.status,
    });
  }

  res.json({
    success: true,
    message: "Room marked as Ready and booking completed",
    room,
  });
});

/* =========================================
   HOST ROOM STATUS DASHBOARD
   GET /api/housekeeping/host/status
========================================= */
const getHostRoomStatus = asyncHandler(async (req, res) => {

  const hostId = req.user._id;

  const rooms = await Room.find()
    .populate({
      path: "listing",
      match: { user: hostId },
      select: "title",
    })
    .lean();

  const filteredRooms = rooms.filter(r => r.listing !== null);

  const roomStatusData = await Promise.all(
    filteredRooms.map(async (room) => {

      const activeBooking = await Booking.findOne({
        room: room._id,
        status: { $in: ["Booked", "checked-in"] },
      }).populate("user", "firstname lastname email");

      return {
        roomId: room._id,
        roomNumber: room.roomNumber,
        hotelTitle: room.listing?.title,
        roomStatus: room.status,
        lastCleanedAt: room.lastCleanedAt,

        guestName: activeBooking
          ? `${activeBooking.user.firstname} ${activeBooking.user.lastname}`
          : null,

        bookingStatus: activeBooking?.status || null,
        checkIn: activeBooking?.checkIn || null,
        checkOut: activeBooking?.checkOut || null,
      };
    })
  );

  res.json(roomStatusData);
});

module.exports = {
  getHousekeepingTasks,
  markRoomCleaned,
  availability,
  getHostRoomStatus,
};