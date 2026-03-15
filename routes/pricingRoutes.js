const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const { dynamicPrice } = require("../utils/dynamicPricing");

router.get("/", async (req, res) => {
  try {
    const { listingId, checkIn } = req.query;

    if (!listingId || !checkIn) {
      return res.status(400).json({
        message: "listingId and checkIn are required",
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const activeBookings = await Booking.countDocuments({
      listing: listingId,
      status: { $in: ["Booked", "CheckedIn"] },
    });

    const occupancyRate = Math.min(
      Math.round((activeBookings / 1) * 100),
      100
    );

    const checkInDate = new Date(checkIn);
    const isWeekend = [0, 6].includes(checkInDate.getDay());

    const month = checkInDate.getMonth() + 1;
    let season = "normal";
    if ([12, 1, 5, 6].includes(month)) season = "peak";
    if ([2, 7, 8].includes(month)) season = "low";

    const pricing = dynamicPrice({
      basePrice: listing.basePrice,
      occupancyRate,
      isWeekend,
      season,
    });

    res.json(pricing);
  } catch (err) {
    console.error("PRICING API ERROR:", err);
    res.status(500).json({ message: "Pricing engine error" });
  }
});

module.exports = router;
