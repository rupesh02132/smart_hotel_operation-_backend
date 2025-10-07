const Listing = require("../models/Listing");

const getListingById = async (id) => {
  return await Listing.findById(id)
    .populate("user")
    .populate({
      path: "review",
      populate: { path: "user", select: "firstname lastname" },
    });
};

const createListing = async (userId, data) => {
  const {
    title,
    address,
    city,
    country,
    description,
    price,
    guests,
    bedrooms,
    beds,
    baths,
    amenities,
    category,
    images,
    location,
  } = data;

  const listing = new Listing({
    user: userId,
    title,
    address,
    city,
    country,
    description,
    price,
    guests,
    bedrooms,
    beds,
    baths,
    amenities: Array.isArray(amenities)
      ? amenities
      : amenities?.split(",") || [],
    images: Array.isArray(images) ? images : [],
    category,
    location: location || { type: "Point", coordinates: [0, 0] },
  });

  return await listing.save();
};

const createMultipleListings = async (listings) => {
  if (!Array.isArray(listings) || listings.length === 0) {
    throw new Error("Listings array is required");
  }

  const createdListings = [];
  for (const listing of listings) {
    const newListing = new Listing(listing);
    await newListing.save();
    createdListings.push(newListing);
  }

  return createdListings;
};

const updateListing = async (id, userId, data) => {
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.user.toString() !== userId.toString()) {
    throw new Error("Not authorized to update this listing");
  }

  listing.title = data.title || listing.title;
  listing.address = data.address || listing.address;
  listing.city = data.city || listing.city;
  listing.country = data.country || listing.country;
  listing.description = data.description || listing.description;
  listing.price = data.price || listing.price;
  listing.guests = data.guests || listing.guests;
  listing.bedrooms = data.bedrooms || listing.bedrooms;
  listing.beds = data.beds || listing.beds;
  listing.baths = data.baths || listing.baths;

  if (data.amenities) {
    listing.amenities = Array.isArray(data.amenities)
      ? data.amenities
      : data.amenities.split(",");
  }

  listing.category = data.category || listing.category;

  if (data.images && Array.isArray(data.images)) {
    listing.images = data.images;
  }

  if (
    data.location &&
    data.location.type === "Point" &&
    Array.isArray(data.location.coordinates) &&
    data.location.coordinates.length === 2
  ) {
    listing.location = {
      type: "Point",
      coordinates: data.location.coordinates.map(Number),
    };
  }

  return await listing.save();
};

const deleteListing = async (id) => {
  return await Listing.findByIdAndDelete(id);
};

const getHostListings = async (userId) => {
  return await Listing.find({ user: userId });
};

const getAllListings = async () => {
  return await Listing.find();
};

const getListings = async (queryOptions) => {
  const { city, skip = 0, limit = 15 } = queryOptions;

  const skipNum = parseInt(skip);
  const limitNum = parseInt(limit);

  const query = {};
  if (city) query.city = new RegExp(city, "i");

  const totalCount = await Listing.countDocuments(query);

  const listings = await Listing.find(query)
    .populate("user")
    .skip(skipNum)
    .limit(limitNum)
    .sort({ createdAt: -1 })
    .lean();

  return {
    totalCount,
    listings,
  };
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  createMultipleListings,
  updateListing,
  deleteListing,
  getHostListings,
  getAllListings,
};
