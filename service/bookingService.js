const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const { dynamicPrice } = require("../utils/dynamicPricing");
const Room = require("../models/Room");
/* ============================================================
   CREATE BOOKING (SMART HOTEL VERSION)
============================================================ */
// const createBookingService = async ({
//   userId,
//   listing,
//   checkIn,
//   checkOut,
//   guests,
//   paymentMethod,
// }) => {

//   // ✅ 1. FETCH LISTING (THIS WAS MISSING)
//   const listingExists = await Listing.findById(listing);
//   if (!listingExists) {
//     throw new Error("Listing not found");
//   }

//   // ❌ Prevent booking if room unavailable
//   if (!["Vacant", "Ready"].includes(listingExists.status)) {
//     throw new Error("Room is not available");
//   }

//   // 🔎 Date conflict check
//   const conflictingBookings = await Booking.find({
//     listing,
//     $and: [
//       { checkIn: { $lte: new Date(checkOut) } },
//       { checkOut: { $gte: new Date(checkIn) } },
//     ],
//   });

//   if (conflictingBookings.length > 0) {
//     throw new Error("Room is not available for selected dates");
//   }

//   // 💰 FINAL PRICE (NUMBER ONLY)
//   const nights =
//     Math.ceil(
//       (new Date(checkOut) - new Date(checkIn)) /
//         (1000 * 60 * 60 * 24)
//     ) || 1;

//   const totalPrice = listingExists.price * nights;

//   // 📝 CREATE BOOKING
//   const booking = new Booking({
//     user: userId,
//     listing,
//     checkIn,
//     checkOut,
//     guests,
//     totalPrice,
//     billAmount: totalPrice,
//     paymentMethod,
//     status: "Booked", // ✔ Booking enum
//   });

//   booking.assignedRoomNumber = listingExists.roomNumber;

//   const savedBooking = await booking.save();

//   // 🏨 UPDATE LISTING
//   listingExists.status = "Occupied"; // ✔ Listing enum
//   listingExists.isAvailable = false;
//   await listingExists.save();

//   return savedBooking;
// };




/* ======================================================
   CREATE BOOKING SERVICE (HOTEL SYSTEM)
====================================================== */
const createBookingService = async ({
  userId,
  listing,
  room,
  guests,
  checkIn,
  checkOut,
}) => {

  /* 1️⃣ VALIDATION */
  if (new Date(checkOut) <= new Date(checkIn)) {
    throw new Error("Check-out must be after check-in");
  }

  /* 2️⃣ HOTEL EXISTS */
  const hotel = await Listing.findById(listing);
  if (!hotel) throw new Error("Hotel not found");

  /* 3️⃣ ROOM EXISTS */
  const roomData = await Room.findById(room);
  if (!roomData) throw new Error("Room not found");

  /* 4️⃣ ROOM MUST BE VACANT */
  if (roomData.status !== "Vacant" && roomData.status !== "Ready") {
    throw new Error("Room not available");
  }

  /* 5️⃣ DATE CONFLICT CHECK */
  const conflict = await Booking.findOne({
    room: roomData._id,
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
    status: { $ne: "cancelled" },
  });

  if (conflict) {
    throw new Error("Room already booked");
  }

  /* 6️⃣ CALCULATE NIGHTS */
  const nights =
    Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  /* ✅ 7️⃣ AI PRICE (LATEST) */
  const pricePerNight =
    roomData.dynamicPrice || roomData.basePrice;

  const totalPrice = pricePerNight * nights;

  /* 8️⃣ CREATE BOOKING */
  const booking = await Booking.create({
    user: userId,
    listing,
    room,
    guests,
    checkIn,
    checkOut,
    pricePerNight,
    nights,
    totalPrice,
    status: "Booked",
  });

  /* 9️⃣ UPDATE ROOM STATUS */
  // roomData.status = "Occupied";
  await roomData.save();

  return booking;
};






/* ============================================================
   GET MY BOOKINGS
============================================================ */
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
/* ============================================================
   GET HOST BOOKINGS
============================================================ */
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

/* ============================================================
   FIND BOOKING BY LISTING ID
============================================================ */
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
