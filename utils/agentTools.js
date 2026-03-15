const Listing = require("../models/Listing");
const Room = require("../models/Room");

/* =========================
SEARCH ROOMS TOOL
========================= */

const searchRoomsTool = async ({
  city,
  maxPrice,
  guests,
  roomType,
}) => {

  let hotelQuery = {};
  if (city) hotelQuery.city = city;

  const hotels = await Listing.find(hotelQuery);

  if (!hotels.length) return [];

  const hotelIds = hotels.map(h => h._id);

  let roomQuery = {
    listing: { $in: hotelIds },
    status: { $in: ["Ready", "Vacant"] }
  };

  if (maxPrice) roomQuery.basePrice = { $lte: maxPrice };
  if (guests) roomQuery.guests = { $gte: guests };
  if (roomType) roomQuery.roomType = roomType;

  const rooms = await Room.find(roomQuery)
    .populate("listing", "title city hotelcode")
    .sort({ basePrice: 1 })
    .limit(5);

  return rooms;
};

module.exports = {
  searchRoomsTool
};