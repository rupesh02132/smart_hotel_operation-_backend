const roomService = require("../service/roomService");
const asyncHandler = require("express-async-handler");
const { getIO } = require("../utils/socket");
const { calculateDynamicPrice } = require("../utils/dynamicPricing");

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoomService(req, req.user);
  res.status(201).json(room);
});

const getRoomsByHotel = asyncHandler(async (req, res) => {
  const rooms = await roomService.getRoomsByHotelService(req.params.hotelId);
  res.json(rooms);
});

const getRoomById = asyncHandler(async (req, res) => {
  const { checkInDate } = req.query;

  const room = await roomService.getRoomByIdService(req.params.id);

  let pricing = null;
  let dynamicPrice = room.basePrice;

  if (checkInDate) {
    try {
      pricing = await calculateDynamicPrice(room._id, checkInDate);

      if (pricing && pricing.finalPrice > 0) {
        dynamicPrice = pricing.finalPrice;
      }
    } catch (err) {
      console.log("⚠️ Pricing error:", err.message);
    }
  }

  res.json({
    ...room.toObject(),
    dynamicPrice,
    pricing,
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  const updatedRoom = await roomService.updateRoomService(
    req.params.id,
    req.user,
    req
  );
  res.json(updatedRoom);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const result = await roomService.deleteRoomService(
    req.params.id,
    req.user
  );
  res.json(result);
});

const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getAllRoom();
  res.json(rooms);
});

const searchRooms = asyncHandler(async (req, res) => {
  const { checkInDate } = req.query;

  const rooms = await roomService.searchRoomsService(req.query);

  let updatedRooms = rooms;

  if (checkInDate) {
    updatedRooms = await Promise.all(
      rooms.map(async (room) => {
        const pricing = await calculateDynamicPrice(
          room._id,
          checkInDate
        );

        return {
          ...room.toObject(),
          dynamicPrice: pricing.finalPrice,
        };
      })
    );
  }

  res.json(updatedRooms);
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Room status is required");
  }

  const updatedRoom = await roomService.updateRoomStatusService(
    roomId,
    req.user,
    status
  );

  getIO().emit("roomStatusUpdated", {
    roomId: updatedRoom._id,
    status: updatedRoom.status,
    listing: updatedRoom.listing,
  });

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