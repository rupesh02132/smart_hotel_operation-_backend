const cron = require("node-cron");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

const CITY_DEMAND_WEIGHT = {
  delhi: 1.2,
  mumbai: 1.3,
  bangalore: 1.25,
  chennai: 1.15,
  hyderabad: 1.18,
};

const isWeekend = () => {
  const d = new Date().getDay();
  return d === 0 || d === 6;
};

const getOccupancyRate = async (listingId) => {
  const total = await Booking.countDocuments({ listing: listingId });
  const active = await Booking.countDocuments({
    listing: listingId,
    status: { $in: ["Booked", "CheckedIn"] },
  });

  return total === 0 ? 0 : active / total;
};

const calculateSmartPrice = async (listing) => {
  let price = listing.basePrice;

  if (isWeekend()) price *= 1.15;

  const occupancy = await getOccupancyRate(listing._id);
  if (occupancy > 0.7) price *= 1.25;
  else if (occupancy > 0.4) price *= 1.1;

  const month = new Date().getMonth();
  if ([10, 11].includes(month)) price *= 1.3; // Festive season
  if ([5, 6].includes(month)) price *= 1.2; // Summer surge

  const cityWeight = CITY_DEMAND_WEIGHT[listing.city?.toLowerCase()];
  if (cityWeight) price *= cityWeight;

  return Math.round(price);
};

cron.schedule("0 1 * * *", async () => {
  console.log("🔄 Running AI Pricing Scheduler");

  const listings = await Listing.find();

  for (const listing of listings) {
    const newPrice = await calculateSmartPrice(listing);

    listing.dynamicPrice = newPrice;
    listing.price = newPrice;
    await listing.save();
  }

  console.log("✅ AI Pricing Updated");
});
