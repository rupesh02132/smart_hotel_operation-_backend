const analyticsService = require("../service/analyticsService");

/* ============================================
   GET HOTEL ANALYTICS CONTROLLER
============================================ */
const getAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getHotelAnalytics();

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};

module.exports = { getAnalytics };
