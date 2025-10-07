const express=require("express");
const router=express.Router();
const authenticate = require('../middleware/authMiddleware');
const {createRatingController,getAllRatings}=require("../controllers/ratingController");
router.post("/createRating",authenticate,createRatingController);
router.get("/getAllRatings/:listingId",authenticate,getAllRatings);
module.exports=router