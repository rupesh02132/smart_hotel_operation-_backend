const Listing = require("../models/Listing");
const Room = require("../models/Room");



const normalizeImages = (req) => {
  let images = [];

  /* ================= FILE UPLOADS ================= */
  if (req.files && req.files.length > 0) {
    const uploaded = req.files
      .map((file) => file.path)
      .filter((path) => typeof path === "string");

    images = [...images, ...uploaded];
  }

  /* ================= URL INPUT ================= */
  if (req.body.images) {
    let bodyImages = req.body.images;

    // If frontend sent JSON string
    if (typeof bodyImages === "string") {
      try {
        bodyImages = JSON.parse(bodyImages);
      } catch {
        bodyImages = bodyImages
          .split(",")
          .map((img) => img.trim());
      }
    }

    if (Array.isArray(bodyImages)) {
      const validUrls = bodyImages.filter(
        (img) => typeof img === "string"
      );

      images = [...images, ...validUrls];
    }
  }

  // Remove duplicates
  images = [...new Set(images)];

  return images;
};
/* ======================================================
   CREATE ROOM SERVICE
====================================================== */
const createRoomService = async (req, user) => {
  const images = normalizeImages(req);

  if (!images.length) {
    throw new Error("Upload at least one room image");
  }

  /* ================= HOTEL EXISTS ================= */
  const hotel = await Listing.findById(req.body.listing);
  if (!hotel) throw new Error("Hotel not found");

  /* ================= AUTHORIZATION ================= */
  const isOwner =
    hotel.user.toString() === user._id.toString();

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const isHost = user.role === "host";

  if (!isAdmin && !isManager && !(isHost && isOwner)) {
    throw new Error("Not authorized to add room");
  }

  /* ================= ENUM NORMALIZATION ================= */
  const roomType = req.body.roomType
    ? req.body.roomType.trim()
    : null;

  /* ================= AMENITIES ================= */
  const amenities = req.body.amenities
    ? Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities.split(",").map((a) => a.trim())
    : [];

  /* ================= CREATE ROOM ================= */
  const room = await Room.create({
    listing: req.body.listing,
    roomNumber: req.body.roomNumber,
    floor: req.body.floor,
    roomType, // must match enum exactly
    guests: Number(req.body.guests) || 0,
    bedrooms: Number(req.body.bedrooms) || 0,
    beds: Number(req.body.beds) || 0,
    baths: Number(req.body.baths) || 0,
    basePrice: Number(req.body.basePrice) || 0,
    amenities,
    images,
  });

  return room;
};

/* ======================================================
   GET ROOMS BY HOTEL SERVICE
====================================================== */
const getRoomsByHotelService = async (hotelId) => {
  return await Room.find({ listing: hotelId }).sort({ createdAt: -1 });
};

/* ======================================================
   GET SINGLE ROOM SERVICE
====================================================== */
const getRoomByIdService = async (roomId) => {
  const room = await Room.findById(roomId);

  if (!room) throw new Error("Room not found");

  return room;
};

/* ======================================================
   UPDATE ROOM SERVICE
====================================================== */
const updateRoomService = async (roomId, user, req) => {
  const room = await Room.findById(roomId).populate("listing");

  if (!room) throw new Error("Room not found");

  const isOwner =
    room.listing.user.toString() === user._id.toString();

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const isHost = user.role === "host";

  if (!isAdmin && !isManager && !(isHost && isOwner)) {
    throw new Error("Not authorized");
  }

  /* Update Fields */
  room.roomType = req.body.roomType ?? room.roomType;
  room.basePrice = req.body.basePrice ?? room.basePrice;
  room.guests = req.body.guests ?? room.guests;
  room.beds = req.body.beds ?? room.beds;
  room.baths = req.body.baths ?? room.baths;

  /* Amenities */
  if (req.body.amenities) {
    room.amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities.split(",").map((a) => a.trim());
  }

  /* Images */
  const newImages = normalizeImages(req);
  if (newImages.length) {
    room.images = [...new Set([...room.images, ...newImages])];
  }

  return await room.save();
};

/* ======================================================
   DELETE ROOM SERVICE
====================================================== */
const deleteRoomService = async (roomId, user) => {
  const room = await Room.findById(roomId).populate("listing");

  if (!room) throw new Error("Room not found");

  const isOwner =
    room.listing.user.toString() === user._id.toString();

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const isHost = user.role === "host";

  if (!isAdmin && !isManager && !(isHost && isOwner)) {
    throw new Error("Not authorized");
  }

  await Room.findByIdAndDelete(roomId);

  return { message: "Room deleted successfully" };
};

const getAllRoom = async () => {
  return await Room.find()
    .populate("listing", "title city country images") 
    .populate("housekeepingAssignedTo", "firstname lastname email phone")
    .sort({ createdAt: -1 });
};


/* =========================================
   SEARCH ROOMS INSIDE A HOTEL
========================================= */
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

  /* ✅ Rooms of Particular Hotel */
  if (hotelId) query.listing = hotelId;

  /* ✅ Room Number Filter (make it regex search) */
  if (roomNumber) {
    query.roomNumber = { $regex: roomNumber, $options: "i" };
  }

  /* ✅ Room Type Filter */
  if (roomType) query.roomType = roomType;

  /* ✅ Price Filter */
 /* ✅ Price Filter */
if (minPrice || maxPrice) {
  query.basePrice = {};

  if (minPrice) query.basePrice.$gte = Number(minPrice);
  if (maxPrice) query.basePrice.$lte = Number(maxPrice);
}

 if (onlyAvailable === "true") {
  query.status = { $in: ["Vacant", "Ready"] };
}

  /* ✅ Amenities Filter */
  if (amenities) {
    const amenityArray = Array.isArray(amenities)
      ? amenities
      : [amenities];

    query.amenities = { $all: amenityArray };
  }

  /* ✅ Fetch Rooms */
  let rooms = await Room.find(query).sort({ createdAt: -1 });

  /* =========================================
     DATE AVAILABILITY CHECK (Booking Conflict)
  ========================================= */
  if (checkIn && checkOut) {
    const bookedRoomIds = await Booking.find({
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
      status: { $ne: "cancelled" },
    }).distinct("room");

    rooms = rooms.filter(
      (room) => !bookedRoomIds.includes(room._id.toString())
    );
  }

  return rooms;
};
/* ======================================================
   UPDATE ROOM STATUS (STATE MACHINE)
====================================================== */
const updateRoomStatusService = async (roomId, user, newStatus) => {
  const room = await Room.findById(roomId).populate("listing");
  if (!room) throw new Error("Room not found");

  /* ------------------------------
     AUTHORIZATION
  ------------------------------ */
  const isOwner =
    room.listing.user.toString() === user._id.toString();

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const isHost = user.role === "host";

  if (!isAdmin && !isManager && !(isHost && isOwner)) {
    throw new Error("Not authorized");
  }

  /* ------------------------------
     VALID STATUS ENUM
  ------------------------------ */
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

  /* ------------------------------
     STATE TRANSITION RULES
  ------------------------------ */
  const validTransitions = {
    Available: ["Maintenance", "Blocked"],
    Occupied: ["Cleaning", "Maintenance"],
    Cleaning: ["Vacant", "Maintenance"],
    Maintenance: ["Vacant"],
    Blocked: ["Vacant"],
  };

  const currentStatus = room.status;

  if (
    validTransitions[currentStatus] &&
    !validTransitions[currentStatus].includes(newStatus)
  ) {
    throw new Error(
      `Cannot change status from ${currentStatus} to ${newStatus}`
    );
  }

  /* ------------------------------
     APPLY STATUS
  ------------------------------ */
  room.status = newStatus;

  if (newStatus === "Vacant") {
    room.lastCleanedAt = new Date();
  }

  await room.save();

  return room;
};

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


