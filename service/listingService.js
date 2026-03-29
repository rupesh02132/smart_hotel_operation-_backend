const Listing = require("../models/Listing");

/* ======================
   CLOUDINARY IMAGE NORMALIZER
   Stores Only URL Strings
====================== */
const normalizeImages = (req) => {
  let images = [];

  /* ✅ Case 1: Images Uploaded via Multer (req.files) */
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.path);
  }

  /* ✅ Case 2: Images Sent as URLs in Body (req.body.images) */
  else if (req.body.images && req.body.images.length > 0) {
    images = Array.isArray(req.body.images)
      ? req.body.images
      : req.body.images.split(",").map((img) => img.trim());
  }

  return images;
};


/* ======================
   CREATE HOTEL LISTING
====================== */
const createListingService = async (req, userId) => {
  const images = normalizeImages(req);

  if (!images.length) {
    throw new Error("Upload at least one hotel image");
  }

  /* ✅ SAFE LOCATION PARSE */
  const lng = parseFloat(req.body.longitude);
  const lat = parseFloat(req.body.latitude);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Valid longitude and latitude are required");
  }

  const location = {
    type: "Point",
    coordinates: [lng, lat],
  };

  if (!req.body.title || !req.body.city || !req.body.address) {
    throw new Error("Title, address, and city are required.");
  }

  const listing = await Listing.create({
    user: userId,
    title: req.body.title,
    address: req.body.address,
    hotelcode: req.body.hotelcode,
    city: req.body.city,
    country: req.body.country,
    description: req.body.description,
    images,
    category: req.body.category,
    location,
  });

  return listing;
};

/* ======================
   UPDATE HOTEL LISTING
====================== */
const updateListing = async (id, userId, data, req = null) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new Error("Hotel not found");

  if (listing.user.toString() !== userId.toString()) {
    throw new Error("Not authorized");
  }

  listing.title = data.title ?? listing.title;
  listing.address = data.address ?? listing.address;
  listing.city = data.city ?? listing.city;
  listing.country = data.country ?? listing.country;
  listing.description = data.description ?? listing.description;
  listing.hotelcode = data.hotelcode ?? listing.hotelcode;
  listing.category = data.category ?? listing.category;

  /* ✅ Amenities */
  if (data.hotelAmenities) {
    listing.hotelAmenities = Array.isArray(data.hotelAmenities)
      ? data.hotelAmenities
      : data.hotelAmenities.split(",").map((a) => a.trim());
  }

  /* ✅ Images */
  if (req) {
    const newImages = normalizeImages(req);
    if (newImages.length) {
      listing.images = [...new Set([...listing.images, ...newImages])];
    }
  }

  if (Array.isArray(data.images)) {
    listing.images = data.images;
  }

  /* ✅ SAFE LOCATION UPDATE */
  if (req?.body?.longitude && req?.body?.latitude) {
    const lng = parseFloat(req.body.longitude);
    const lat = parseFloat(req.body.latitude);

    if (!isNaN(lng) && !isNaN(lat)) {
      listing.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }
  }

  return await listing.save();
};

/* ======================
   DELETE HOTEL LISTING
====================== */
const deleteListing = async (id, userId) => {
  const listing = await Listing.findById(id);

  if (!listing) throw new Error("Hotel not found");

  if (listing.user.toString() !== userId.toString()) {
    throw new Error("Not authorized");
  }

  await Listing.findByIdAndDelete(id);

  return { message: "✅ Hotel deleted successfully" };
};



/* ======================
   GET HOTEL BY ID
====================== */
const getListingById = async (id) => {
  return await Listing.findById(id)
    .populate("user", "firstname lastname email")
    .populate("rooms", "roomNumber basePrice status roomType images")
    .populate({
      path: "review",
      populate: { path: "user", select: "firstname lastname" },
    });
};
/* ======================
   HOST HOTEL LISTINGS
====================== */
const getHostListings = async (userId) => {
  return await Listing.find({ user: userId }).sort({ createdAt: -1 });
};

/* ======================
   GET ALL HOTELS
====================== */
const getAllListings = async () => {
  return await Listing.find()
    .populate("user", "firstname lastname")
    .populate({
      path: "rooms",
      select: "roomNumber basePrice status roomType images"
    })
    .sort({ createdAt: -1 });
};
/* ======================
   HOTEL SEARCH (No Room Filters)
====================== */


const getListings = async (queryOptions) => {
  const {
    city,
    country,
    title,
    rating,
    sortBy,

    lat,
    lng,
    radius = 10000,

    skip = 0,
    limit = 15,
  } = queryOptions;

  const query = {};

  /* ============================
     TEXT SEARCH FILTERS
  ============================ */

  if (city) {
    query.city = new RegExp(city, "i");
  }

  if (country) {
    query.country = new RegExp(country, "i");
  }

  if (title) {
    query.title = new RegExp(title, "i");
  }

  if (rating) {
    query.ratingAvg = { $gte: Number(rating) };
  }

  /* ============================
     GEO LOCATION SEARCH
  ============================ */

  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        $maxDistance: Number(radius),
      },
    };
  }

  /* ============================
     SORTING
  ============================ */

  let sort = { createdAt: -1 };

  if (sortBy === "rating") sort = { ratingAvg: -1 };
  if (sortBy === "priceLow") sort = { price: 1 };
  if (sortBy === "priceHigh") sort = { price: -1 };

  /* ============================
     PAGINATION
  ============================ */

  const totalCount = await Listing.countDocuments(query);

  const listings = await Listing.find(query)
    .populate("user", "firstname lastname")
    .skip(Number(skip))
    .limit(Number(limit))
    .sort(sort)
    .lean();

  return { totalCount, listings };
};




/* ======================
   EXPORTS
====================== */
module.exports = {
  getListings,
  getListingById,
  createListingService,
  updateListing,
  deleteListing,
  getHostListings,
  getAllListings,
};
