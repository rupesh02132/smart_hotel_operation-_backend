const asyncHandler = require("express-async-handler");
const listingService = require("../service/listingService");

// @desc    Get all listings

const getListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getListings(req.query);
  res.json(listings);
});

// @desc    Get single listing

const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);
 if (listing) {
    res.json(listing);
  } else {
    res.status(404);
    throw new Error("Listing not found");
  }
});

// @desc    Create a listing

const createListing = async (req, res) => {
  try {
    const createdListing = await listingService.createListing(req.user._id, req.body);
    res.status(201).json(createdListing);
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ message: "Failed to create listing" });
  }
};

const createMultipleListings = async (req, res) => {
  try {
    const createdListings = await listingService.createMultipleListings(req.body.listings);
    return res.status(201).json(createdListings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a listing
const updateListing = async (req, res) => {

  try {
    const updatedListing = await listingService.updateListing(req.params.id, req.user._id, req.body);
    
    res.json(updatedListing);
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ message: "Failed to update listing" });
  }
};

// @desc    Delete a listing

const deleteListing = asyncHandler(async (req, res) => {
  const deleted = await listingService.deleteListing(req.params.id);
  if (!deleted) {
    throw new Error("Listing not found");
  } else {
    res.json("Listing deleted successfully");
  }
});

const getHostListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getHostListings(req.user._id);
  res.json(listings);
});

const getMyListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getHostListings(req.user._id);
  res.json(listings);
});

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
