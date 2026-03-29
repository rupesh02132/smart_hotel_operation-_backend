const roomService = require("../service/roomService");
const asyncHandler = require("express-async-handler");
const { getIO } = require("../utils/socket");
/* ======================================================
   CREATE ROOM
====================================================== */
const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoomService(
    req,
    req.user, // ✅ pass full user object
  );

  res.status(201).json(room);
});

/* ======================================================
   GET ROOMS BY HOTEL
====================================================== */
const getRoomsByHotel = asyncHandler(async (req, res) => {
  const rooms = await roomService.getRoomsByHotelService(req.params.hotelId);

  res.json(rooms);
});

/* ======================================================
   GET SINGLE ROOM
====================================================== */
const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomByIdService(req.params.id);

  res.json(room);
});

/* ======================================================
   UPDATE ROOM
====================================================== */
const updateRoom = asyncHandler(async (req, res) => {
  const updatedRoom = await roomService.updateRoomService(
    req.params.id,
    req.user, // ✅ correct
    req,
  );

  res.json(updatedRoom);
});

/* ======================================================
   DELETE ROOM
====================================================== */
const deleteRoom = asyncHandler(async (req, res) => {
  const result = await roomService.deleteRoomService(
    req.params.id,
    req.user, // ✅ correct
  );

  res.json(result);
});

/* ======================================================
   GET ALL ROOMS
====================================================== */
const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getAllRoom();
  res.json(rooms);
});

/* ======================================================
   SEARCH ROOMS
====================================================== */
const searchRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.searchRoomsService(req.query);

  res.json(rooms);
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const { status } = req.body;
  console.log("STATUS FROM UI =", req.body.status);

  /* ======================
     VALIDATE INPUT
  ====================== */
  if (!status) {
    res.status(400);
    throw new Error("Room status is required");
  }

  /* ======================
     UPDATE SERVICE
  ====================== */
  const updatedRoom = await roomService.updateRoomStatusService(
    roomId,
    req.user,
    status,
  );

  /* ======================
     REALTIME EVENT
  ====================== */
  getIO().emit("roomStatusUpdated", {
    roomId: updatedRoom._id,
    status: updatedRoom.status,
    listing: updatedRoom.listing,
  });

  /* ======================
     RESPONSE
  ====================== */
  res.status(200).json({
    success: true,
    message: "Room status updated",
    room: updatedRoom,
  });
});
module.exports = {
  createRoom,
  getRoomsByHotel,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAllRooms,
  searchRooms,
  updateRoomStatus,
};
