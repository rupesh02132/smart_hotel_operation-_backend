const Review = require("../models/Review");
const Listing = require("../models/Listing");

/* ============================================================
   CREATE REVIEW
============================================================ */
const createReview = async (reqData, user) => {
  const listing = await Listing.findById(reqData.listingId);
  if (!listing) throw new Error("Listing not found.");

  const review = new Review({
    user: user._id,
    listing: listing._id,
    rating: reqData.rating || reqData.review, // backward compatible
    comment: reqData.comment,
    serviceType: reqData.serviceType || "Overall",
    createdAt: Date.now(),
  });

  const savedReview = await review.save();

  // Attach review to listing
  await Listing.findByIdAndUpdate(listing._id, {
    $push: { review: savedReview._id },
  });

  return savedReview;
};

/* ============================================================
   GET REVIEWS BY LISTING (PUBLIC)
============================================================ */
const getReviewsByListing = async (listingId) => {
  const reviews = await Review.find({ listing: listingId })
    .populate("user", "firstname lastname")
    .sort({ createdAt: -1 });

  return reviews;
};

/* ============================================================
   GET ALL REVIEWS (ADMIN / MANAGER)
============================================================ */
const getAllReviews = async () => {
  return await Review.find()
    .populate("user", "firstname lastname email")
    .populate("listing", "title roomNumber")
    .sort({ createdAt: -1 });
};

/* ============================================================
   DELETE REVIEW (ADMIN)
============================================================ */
const deleteReview = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new Error("Review not found");
  }

  // Remove review from listing
  await Listing.findByIdAndUpdate(review.listing, {
    $pull: { review: review._id },
  });

  return review;
};

/* ============================================================
   HOTEL RESPONSE TO REVIEW (ADMIN / MANAGER)
============================================================ */
const respondToReview = async (id, response) => {
  const review = await Review.findById(id);
  if (!review) throw new Error("Review not found");

  review.response = response;
  review.respondedAt = new Date();

  return await review.save();
};

/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  createReview,
  getReviewsByListing,
  getAllReviews,
  deleteReview,
  respondToReview,
};
