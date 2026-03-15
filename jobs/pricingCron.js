// jobs/pricingCron.js
const cron = require("node-cron");
const Listing = require("../models/Listing");
const { calculateDynamicPrice } = require("../utils/pricingEngine");

cron.schedule("0 2 * * *", async () => {
  const listings = await Listing.find();
  for (let l of listings) {
    const occupancyRate = Math.random(); // replace with real calc
    const cityDemand = 1.1; // replace with AI later

    const newPrice = calculateDynamicPrice({
      basePrice: l.basePrice,
      cityDemand,
      occupancyRate,
      isWeekend: [0, 6].includes(new Date().getDay()),
      isSeasonalPeak: false,
    });

    l.dynamicPrice = newPrice;
    l.price = newPrice;
    await l.save();
  }
  console.log("Dynamic pricing updated.");
});
