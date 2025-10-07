
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const listingService = require("../service/listingService");


const createReview = async (reqData, user) => {
  const listing = await Listing.findById(reqData.listingId);
  if (!listing) throw new Error("Listing not found.");

  const review = new Review({
    user: user._id,
    listing: listing._id,
    review: reqData.review,
    comment: reqData.comment,
    createdAt: Date.now(),
  });

  const savedReview = await review.save();


  await Listing.findByIdAndUpdate(listing._id, {
    $push: { review: savedReview._id },
  });

  return savedReview;
};



const getReviewbyId = async (id) => {
  console.log("reviewId:",id);
const review= await Review.findById(id).populate("user", "-password"); 
if (!review) {
        throw new Error("Review not found");
      }
    return review;
};

const getAllReviews = async () => {
  const reviews = await Review.find().populate("user", "-password");
  return reviews;
};

const deleteReview = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};



module.exports={
    createReview,
    getReviewbyId,
    getAllReviews,
    deleteReview
}