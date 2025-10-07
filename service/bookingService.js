const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

const createBookingService = async ({
  userId,
  listing,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  paymentMethod,
}) => {
  const listingExists = await Listing.findById(listing);
  if (!listingExists) {
    throw new Error("Listing not found");
  }

  const conflictingBookings = await Booking.find({
    listing,
    $or: [
      {
        checkIn: { $lte: new Date(checkOut) },
        checkOut: { $gte: new Date(checkIn) },
      },
    ],
  });

  if (conflictingBookings.length > 0) {
    throw new Error("Listing is not available for the selected dates");
  }

  // Create new booking
  const booking = new Booking({
    user: userId,
    listing,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    paymentMethod,
  });

  console.log("📝 Booking to be created:", booking);

  return await booking.save();
};

module.exports = {
  createBookingService,
};

const getMyBookingsService = async (userId) => {
  return await Booking.find({ user: userId }).populate(
    "listing",
    "title images price city country"
  );
};

const getHostBookingsService = async (userId) => {
  const listings = await Listing.find({ user: userId });
  const listingIds = listings.map((listing) => listing._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate({
      path: "user",
      select: "firstname lastname email",
    })
    .populate({
      path: "listing",
      select: "title images price city country",
    });

  return bookings;
};

const findBookingByListingId = async (listingId) => {
  return await Booking.findOne({ listing: listingId })
    .populate({ path: "user" })
    .populate({ path: "listing" })
    .sort({ createdAt: -1 }); // latest
};

const findBookingByIdOrListing = async (booking_id) => {
  console.log(" booking_id:", booking_id);

  let booking = await Booking.findById(booking_id).populate("user listing");
  if (booking) return booking;

  console.log(" booking_id:", booking_id);

  return booking;
};

const deleteBookingService = async (bookingId) => {
  return await Booking.findByIdAndDelete(bookingId);
};

const getAllBookingsService = async () => {
  return await Booking.find()
    .populate("listing", "title images price city country")
    .populate("user");
};


module.exports = {
  createBookingService,
  getMyBookingsService,
  getHostBookingsService,
  findBookingByListingId,
  deleteBookingService,
  getAllBookingsService,
  findBookingByIdOrListing,
};
