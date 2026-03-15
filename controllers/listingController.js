const asyncHandler = require("express-async-handler");
const listingService = require("../service/listingService");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

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

/* ======================
   CREATE LISTING
====================== */
const createListing = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const listing = await listingService.createListingService(req, userId);
  res.status(201).json(listing);
});

/* ======================
   BULK CREATE
====================== */
const createMultipleListings = asyncHandler(async (req, res) => {
  const createdListings = await listingService.createMultipleListings(
    req.body.listings
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
      req
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
