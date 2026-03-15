const ReviewService = require("../service/reviewService");

const createReview = async (req, res) => {
  try {
    const review = await ReviewService.createReview(req.body, req.user);
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getReviewsByListing = async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByListing(req.params.listingId);
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getAllReviews();
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await ReviewService.deleteReview(req.params.id);
    return res.status(200).json(review);
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

module.exports = {
  createReview,
  getReviewsByListing,
  getAllReviews,
  deleteReview,
  respondToReview,
};
