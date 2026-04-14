const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const Room = require("../models/Room");



const createBookingService = async ({
  userId,
  listing,
  room,
  guests,
  checkIn,
  checkOut,
  pricePerNight,
  totalPrice,
  lockedPrice,
  priceLockedAt,
}) => {

  if (!userId || !listing || !room || !checkIn || !checkOut) {
    throw new Error("Missing required booking fields");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    throw new Error("Check-out must be after check-in");
  }

  const hotel = await Listing.findById(listing);
  if (!hotel) throw new Error("Hotel not found");

  const roomData = await Room.findById(room);
  if (!roomData) throw new Error("Room not found");


  if (!["Vacant", "Ready"].includes(roomData.status)) {
    throw new Error("Room not available");
  }
  const conflict = await Booking.findOne({
    room: roomData._id,
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
    status: { $ne: "cancelled" },
  });

  if (conflict) {
    throw new Error("Room already booked for selected dates");
  }

  const nights = Math.max(
    Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
    1
  );

  const booking = await Booking.create({
    user: userId,
    listing,
    room,
    guests,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    pricePerNight,
    nights,
    totalPrice,
    lockedPrice,
    priceLockedAt,
    status: "Booked",
    isPaid: false,
    paymentStatus: "pending",
  });
  // roomData.status = "Occupied";
  await roomData.save();

  return booking;
};




  //  GET MY BOOKINGS

const getMyBookingsService = async (userId) => {
  return await Booking.find({ user: userId })
    .populate({
      path: "room",
      populate: {
        path: "listing",
        select: "title city country images",
      },
    })
    .sort({ createdAt: -1 });
};

//  GET HOST BOOKINGS

const getHostBookingsService = async (userId) => {

  // Get host hotels
  const hotels = await Listing.find({ user: userId }).select("_id");

  // Get rooms under those hotels
  const rooms = await Room.find({
    listing: { $in: hotels.map(h => h._id) },
  }).select("_id");

  return await Booking.find({
    room: { $in: rooms.map(r => r._id) },
  })
    .populate("user", "firstname lastname email phone")
    .populate({
      path: "room",
      populate: {
        path: "listing",
        select: "title city country",
      },
    })
    .sort({ createdAt: -1 });
};

  //  FIND BOOKING BY LISTING ID

const findBookingByListingId = async (roomId) => {
  return await Booking.findOne({ room: roomId })
    .populate("user")
    .populate({
      path: "room",
      populate: {
        path: "listing",
      },
    })
    .sort({ createdAt: -1 });
};
/* ============================================================
   FIND BOOKING BY ID OR LISTING
============================================================ */
const findBookingByIdOrListing = async (booking_id) => {

  let booking = await Booking.findById(booking_id)
    .populate("user")
    .populate({
      path: "room",
      populate: { path: "listing" },
    });

  if (booking) return booking;

  // fallback search by room
  booking = await Booking.findOne({ room: booking_id })
    .populate("user")
    .populate({
      path: "room",
      populate: { path: "listing" },
    })
    .sort({ createdAt: -1 });

  return booking;
};

/* ============================================================
   DELETE BOOKING
============================================================ */
const deleteBookingService = async (bookingId) => {

  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  // Only free room if booking was active
  if (["Booked", "checked-in"].includes(booking.status)) {

    const room = await Room.findById(booking.room);

    if (room) {
      room.status = "Vacant";
      await room.save();
    }
  }

  return await Booking.findByIdAndDelete(bookingId);
};

/* ============================================================
   GET ALL BOOKINGS (ADMIN / MANAGER)
============================================================ */
const getAllBookingsService = async () => {
  return await Booking.find()
    .populate("user", "firstname lastname email phone")
    .populate({
      path: "room",
      populate: {
        path: "listing",
        select: "title city country",
      },
    })
    .sort({ createdAt: -1 });
};

/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  createBookingService,
  getMyBookingsService,
  getHostBookingsService,
  findBookingByListingId,
  findBookingByIdOrListing,
  deleteBookingService,
  getAllBookingsService,
};
