const ReviewService = require("../service/reviewService");
const Review = require("../models/Review");
const Listing = require("../models/Listing");




const getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getAllReviews();
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



const respondToReview = async (req, res) => {
  try {
    const updated = await ReviewService.respondToReview(
      req.params.id,
      req.body.response
    );
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




/* ⭐ CREATE REVIEW */

const createReview = async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      user: req.user._id,
    });

    /* ⭐ Recalculate Hotel Rating */
    const stats = await Review.aggregate([
      {
        $match: {
          listing: review.listing,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: "$listing",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Listing.findByIdAndUpdate(review.listing, {
      ratingAvg: stats[0]?.avgRating || 0,
      ratingCount: stats[0]?.count || 0,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ⭐ GET LISTING REVIEWS */

getListingReviews = async (req, res) => {
  try {
    const data = await Review.find({
      listing: req.params.id,
      isApproved: true,
    })
      .populate("user", "firstname lastname")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ⭐ DELETE REVIEW */

deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review)
      return res.status(404).json({ message: "Not found" });

    await review.deleteOne();

    res.json({ message: "Review removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createReview,
  getListingReviews,
  getAllReviews,
  deleteReview,
  respondToReview,
};
