const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/metrics", protect, authorize("admin"), async (req, res) => {
  try {

    /* ============================
       ROOM STATUS (CORRECT MODEL)
    ============================ */

    const [occupied, cleaning] = await Promise.all([
      Room.countDocuments({ status: "Occupied" }),
      Room.countDocuments({ status: "Cleaning" }),
    ]);

    /* ============================
       REVENUE TODAY (AGGREGATION)
    ============================ */

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const revenueTodayAgg = await Booking.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const revenueToday =
      revenueTodayAgg[0]?.total || 0;

    /* ============================
       CHECK-INS TODAY
    ============================ */

    const checkInsNow = await Booking.countDocuments({
      createdAt: { $gte: todayStart },
    });

    /* ============================
       CITY HEATMAP (LOOKUP)
    ============================ */

    const cityHeatmap = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $lookup: {
          from: "listings",
          localField: "listing",
          foreignField: "_id",
          pipeline: [{ $project: { city: 1 } }],
          as: "listingData",
        },
      },
      { $unwind: "$listingData" },
      {
        $group: {
          _id: "$listingData.city",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    /* ============================
       LAST 7 DAYS REVENUE (OPTIMIZED)
    ============================ */

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyAgg = await Booking.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const weeklyMap = {};
    weeklyAgg.forEach((d) => {
      weeklyMap[d._id] = d.total;
    });

    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      weeklyRevenue.push(weeklyMap[key] || 0);
    }

    /* ============================
       RESPONSE
    ============================ */

    res.json({
      occupied,
      cleaning,
      revenueToday,
      checkInsNow,
      cityHeatmap,
      weeklyRevenue,
    });

  } catch (err) {
    console.error("ADMIN METRICS ERROR:", err);
    res.status(500).json({
      message: "Failed to load admin metrics",
    });
  }
});

module.exports = router;