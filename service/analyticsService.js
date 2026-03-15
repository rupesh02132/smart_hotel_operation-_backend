const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Room = require("../models/Room");

/* ============================================
   HOTEL ANALYTICS SERVICE (ROOM BASED SYSTEM)
============================================ */

const getHotelAnalytics = async () => {

  /* ============================================
     1️⃣ ROOM OCCUPANCY (ROOM MODEL)
  ============================================ */

  const [
    totalRooms,
    occupiedRooms,
    cleaningRooms
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: "Occupied" }),
    Room.countDocuments({ status: "Cleaning" }),
  ]);

  const occupancyRate =
    totalRooms === 0
      ? 0
      : Math.round((occupiedRooms / totalRooms) * 100);

  /* ============================================
     2️⃣ BOOKING COUNTS
  ============================================ */

  const [
    totalBookings,
    paidBookings,
    cancelledBookings,
    refundedBookings
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ isPaid: true }),
    Booking.countDocuments({ status: "Cancelled" }),
    Booking.countDocuments({ paymentStatus: "refunded" }),
  ]);

  const pendingBookings = totalBookings - paidBookings;

  /* ============================================
     3️⃣ TOTAL REVENUE (PAID ONLY)
  ============================================ */

  const totalRevenueAgg = await Booking.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue =
    totalRevenueAgg[0]?.totalRevenue || 0;

  /* ============================================
     4️⃣ REVENUE TODAY
  ============================================ */

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
        revenueToday: { $sum: "$totalPrice" },
      },
    },
  ]);

  const revenueToday =
    revenueTodayAgg[0]?.revenueToday || 0;

  /* ============================================
     5️⃣ LAST 7 DAYS REVENUE (ACCURATE RANGE)
  ============================================ */

  const weeklyRevenue = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const dayAgg = await Booking.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    weeklyRevenue.push(dayAgg[0]?.revenue || 0);
  }

  /* ============================================
     6️⃣ MONTHLY REVENUE TREND
  ============================================ */

  const monthlyAgg = await Booking.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyRevenue = monthlyAgg.map((m) => ({
    month: `${m._id.month}-${m._id.year}`,
    revenue: m.revenue,
  }));

  /* ============================================
     7️⃣ CITY HEATMAP (DEMAND)
  ============================================ */

  const cityHeatmap = await Booking.aggregate([
    { $match: { isPaid: true } },
    {
      $lookup: {
        from: "listings",
        localField: "listing",
        foreignField: "_id",
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

  /* ============================================
     8️⃣ REFUND TOTAL
  ============================================ */

  const refundAgg = await Booking.aggregate([
    { $match: { paymentStatus: "refunded" } },
    {
      $group: {
        _id: null,
        refundTotal: { $sum: "$refundDetails.amount" },
      },
    },
  ]);

  const totalRefundAmount =
    refundAgg[0]?.refundTotal || 0;

  /* ============================================
     FINAL RESPONSE
  ============================================ */

  return {
    totalRevenue,
    revenueToday,
    weeklyRevenue,
    monthlyRevenue,

    totalBookings,
    paidBookings,
    pendingBookings,

    occupancyRate,
    occupiedRooms,
    cleaningRooms,
    totalRooms,

    cityHeatmap,

    cancelledBookings,
    refundedBookings,
    totalRefundAmount,
  };
};

module.exports = { getHotelAnalytics };