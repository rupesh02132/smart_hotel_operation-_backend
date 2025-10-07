const Listing = require("../models/Listing");
const Rating = require("../models/Rating"); 
const listingService = require("../service/listingService");


const createRating = async (reqData, user) => {
  const listing = await Listing.findById(reqData.listingId);
  if (!listing) throw new Error("Listing not found.");

  const rating = new Rating({
    user: user._id,
    listing: listing._id,
    value: reqData.value, 
    createdAt: Date.now(),
  });

  const savedRating = await rating.save();


  await Listing.findByIdAndUpdate(listing._id, {
    $push: { rating: savedRating._id },
  });

  return savedRating;
};


const getAllRatings = async (listingId) => {
    const listing = await Listing.findById(listingId);
    return await Rating.find({ listing: listing._id }).populate("user").exec();
};
module.exports = { createRating, getAllRatings};