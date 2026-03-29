const asyncHandler = require("express-async-handler");
const listingService = require("../service/listingService");
const Notification = require("../models/Notification");
const User = require("../models/User");
/* ======================
   GET ALL LISTINGS (SMART SEARCH)
====================== */
const getListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getListings(req.query);
  res.json(listings);
});

/* ======================
   GET SINGLE LISTING
====================== */
const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error("Listing not found");
  }

  res.json(listing);
});

//  CREATE LISTING

const createListing = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  /* ⭐ create listing */
  const listing = await listingService.createListingService(req, userId);

  /* ⭐ get users only id (fast query) */
  const users = await User.find().select("_id").lean();

  if (users.length > 0) {
    const notifications = users.map((u) => ({
      user: u._id,
      type: "hotel",
      title: "New Hotel Added",
      message: `${listing.title} now available in ${listing.city}`,
      link: `/hotel/${listing._id}/rooms`,
      read: false,
    }));

    /* ⭐ bulk insert (very fast) */
    await Notification.insertMany(notifications);
  }

  /* ⭐ REAL-TIME SOCKET BROADCAST */
  const io = req.app.get("io");

  if (io) {
    users.forEach((u) => {
      io.to(u._id.toString()).emit("newNotification", {
        type: "hotel",
        title: "New Hotel Added",
        message: `${listing.title} now available in ${listing.city}`,
        link: `/hotel/${listing._id}/rooms`,
      });
    });
  }

  /* ⭐ response */
  res.status(201).json(listing);
});


/* ======================
   BULK CREATE
====================== */
const createMultipleListings = asyncHandler(async (req, res) => {
  const createdListings = await listingService.createMultipleListings(
    req.body.listings,
  );

  res.status(201).json(createdListings);
});

/* ======================
   UPDATE LISTING (🔥 FIXED)
====================== */
const updateListing = async (req, res) => {
  try {
    const updatedListing = await listingService.updateListing(
      req.params.id,
      req.user._id,
      req.body,
      req,
    );

    res.json(updatedListing);
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   DELETE LISTING
====================== */
const deleteListing = asyncHandler(async (req, res) => {
  const deleted = await listingService.deleteListing(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error("Listing not found");
  }

  res.json({ message: "Listing deleted successfully" });
});

/* ======================
   HOST LISTINGS
====================== */
const getHostListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getHostListings(req.user._id);
  res.json(listings);
});

const getMyListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getHostListings(req.user._id);
  res.json(listings);
});

/* ======================
   ADMIN: ALL LISTINGS
====================== */
const getAllListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getAllListings();
  res.json(listings);
});

module.exports = {
  getListings,
  getListingById,
  createListing,
  createMultipleListings,
  updateListing,
  deleteListing,
  getHostListings,
  getMyListings,
  getAllListings,
};
