const Listing = require("../models/Listing");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

/* ================= NORMALIZE IMAGES ================= */

const normalizeImages = (req) => {
  let images = [];

  if (req.files && req.files.length > 0) {
    const uploaded = req.files
      .map((file) => file.path)
      .filter((path) => typeof path === "string");

    images = [...images, ...uploaded];
  }

  if (req.body.images) {
    let bodyImages = req.body.images;

    if (typeof bodyImages === "string") {
      try {
        bodyImages = JSON.parse(bodyImages);
      } catch {
        bodyImages = bodyImages.split(",").map((img) => img.trim());
      }
    }

    if (Array.isArray(bodyImages)) {
      const validUrls = bodyImages.filter(
        (img) => typeof img === "string"
      );

      images = [...images, ...validUrls];
    }
  }

  return [...new Set(images)];
};

/* ================= CREATE ROOM ================= */

const createRoomService = async (req, user) => {
  const images = normalizeImages(req);

  if (!images.length) throw new Error("Upload at least one room image");

  const hotel = await Listing.findById(req.body.listing);
  if (!hotel) throw new Error("Hotel not found");

  const isOwner = hotel.user.toString() === user._id.toString();

  if (
    user.role !== "admin" &&
    user.role !== "manager" &&
    !(user.role === "host" && isOwner)
  ) {
    throw new Error("Not authorized");
  }

  const room = await Room.create({
    listing: req.body.listing,
    roomNumber: req.body.roomNumber,
    floor: req.body.floor,
    roomType: req.body.roomType?.trim(),
    guests: Number(req.body.guests) || 0,
    children: Number(req.body.children) || 0,
    bedrooms: Number(req.body.bedrooms) || 0,
    beds: Number(req.body.beds) || 0,
    baths: Number(req.body.baths) || 0,
    basePrice: Number(req.body.basePrice) || 0,
    amenities: Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities?.split(",").map((a) => a.trim()) || [],
    images,
  });

  return room;
};

/* ================= GET ROOMS ================= */

const getRoomsByHotelService = async (hotelId) => {
  return await Room.find({ listing: hotelId }).sort({ createdAt: -1 });
};

const getRoomByIdService = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");
  return room;
};

/* ================= UPDATE ROOM ================= */

const updateRoomService = async (roomId, user, req) => {
  const room = await Room.findById(roomId).populate("listing");
  if (!room) throw new Error("Room not found");

  const isOwner =
    room.listing.user.toString() === user._id.toString();

  if (
    user.role !== "admin" &&
    user.role !== "manager" &&
    !(user.role === "host" && isOwner)
  ) {
    throw new Error("Not authorized");
  }

  Object.assign(room, {
    roomType: req.body.roomType ?? room.roomType,
    basePrice: req.body.basePrice ?? room.basePrice,
    guests: req.body.guests ?? room.guests,
    children: req.body.children ?? room.children,
    beds: req.body.beds ?? room.beds,
    baths: req.body.baths ?? room.baths,
  });

  if (req.body.amenities) {
    room.amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities.split(",").map((a) => a.trim());
  }

  const newImages = normalizeImages(req);
  if (newImages.length) {
    room.images = [...new Set([...room.images, ...newImages])];
  }

  return await room.save();
};

/* ================= DELETE ROOM ================= */

const deleteRoomService = async (roomId, user) => {
  const room = await Room.findById(roomId).populate("listing");
  if (!room) throw new Error("Room not found");

  const isOwner =
    room.listing.user.toString() === user._id.toString();

  if (
    user.role !== "admin" &&
    user.role !== "manager" &&
    !(user.role === "host" && isOwner)
  ) {
    throw new Error("Not authorized");
  }

  await Room.findByIdAndDelete(roomId);

  return { message: "Room deleted successfully" };
};

/* ================= GET ALL ROOMS ================= */

const getAllRoom = async () => {
  return await Room.find()
    .populate("listing", "title city country images")
    .populate("housekeepingAssignedTo", "firstname lastname email phone")
    .sort({ createdAt: -1 });
};

/* ================= SEARCH ROOMS ================= */

const searchRoomsService = async (filters = {}) => {
  const {
    hotelId,
    roomType,
    roomNumber,
    minPrice,
    maxPrice,
    onlyAvailable,
    checkIn,
    checkOut,
    amenities,
  } = filters;

  const query = {};

  if (hotelId) query.listing = hotelId;

  if (roomNumber) {
    query.roomNumber = { $regex: roomNumber, $options: "i" };
  }

  if (roomType) query.roomType = roomType;

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  if (onlyAvailable === "true") {
    query.status = { $in: ["Vacant", "Ready"] };
  }

  if (amenities) {
    const arr = Array.isArray(amenities) ? amenities : [amenities];
    query.amenities = { $all: arr };
  }

  let rooms = await Room.find(query).sort({ createdAt: -1 });

  if (checkIn && checkOut) {
    const bookedRoomIds = await Booking.find({
      checkInDate: { $lt: new Date(checkOut) },
      checkOutDate: { $gt: new Date(checkIn) },
      status: { $ne: "Cancelled" },
    }).distinct("room");

    rooms = rooms.filter(
      (room) => !bookedRoomIds.includes(room._id.toString())
    );
  }

  return rooms;
};

/* ================= UPDATE STATUS ================= */

const updateRoomStatusService = async (roomId, user, newStatus) => {
  const room = await Room.findById(roomId).populate("listing");
  if (!room) throw new Error("Room not found");

  const isOwner =
    room.listing.user.toString() === user._id.toString();

  if (
    user.role !== "admin" &&
    user.role !== "manager" &&
    !(user.role === "host" && isOwner)
  ) {
    throw new Error("Not authorized");
  }

  const allowedStatuses = [
    "Vacant",
    "Occupied",
    "Cleaning",
    "Maintenance",
    "Blocked",
    "Ready",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid room status");
  }

  const transitions = {
    Vacant: ["Occupied", "Maintenance", "Blocked", "Ready"],
    Ready: ["Occupied", "Maintenance", "Blocked"],
    Occupied: ["Cleaning", "Maintenance"],
    Cleaning: ["Vacant", "Maintenance"],
    Maintenance: ["Vacant"],
    Blocked: ["Vacant"],
  };

  if (
    transitions[room.status] &&
    !transitions[room.status].includes(newStatus)
  ) {
    throw new Error("Invalid status transition");
  }

  room.status = newStatus;

  if (newStatus === "Vacant") {
    room.lastCleanedAt = new Date();
  }

  return await room.save();
};

/* ================= EXPORT ================= */

module.exports = {
  createRoomService,
  getRoomsByHotelService,
  getRoomByIdService,
  updateRoomService,
  deleteRoomService,
  getAllRoom,
  searchRoomsService,
  updateRoomStatusService,
};