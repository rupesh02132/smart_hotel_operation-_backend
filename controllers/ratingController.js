const RatingService = require("../service/ratingService");

const createRatingController = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated." });
        }
      const rating = await RatingService.createRating(req.body, req.user);
        res.status(201).json(rating);
    } catch (error) {
        console.error("Error creating rating:", error.message);
        res.status(400).json({ message: error.message });
    }
};

const getAllRatings = async (req, res) => {
    try {
        const { listingId } = req.params;
        const ratings = await RatingService.getAllRatings(listingId);
        res.status(200).json(ratings);
    } catch (error) {
        console.error("Error fetching ratings:", error.message);
        res.status(404).json({ message: error.message });
    }
};

module.exports = { createRatingController, getAllRatings };