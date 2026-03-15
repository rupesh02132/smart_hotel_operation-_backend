const { calculateDynamicPrice } = require("../service/pricingService");

const getDynamicPrice = async (req, res) => {
  try {
    const { listingId, checkIn } = req.query;

    if (!listingId || !checkIn) {
      return res
        .status(400)
        .json({ message: "listingId and checkIn date required" });
    }

    const priceData = await calculateDynamicPrice(listingId, checkIn);

    res.json(priceData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDynamicPrice };
