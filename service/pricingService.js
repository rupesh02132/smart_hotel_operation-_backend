const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

/* ======================
   AI PRICING ENGINE
====================== */

const WEEKEND_MULTIPLIER = 1.2;

const SEASONAL_MULTIPLIER = {
  peak: 1.35,     // Dec, Jan, May, Jun
  normal: 1.0,
  low: 0.85,      // Feb, Jul, Aug
};

const CITY_DEMAND = {
  Goa: 1.3,
  Dubai: 1.45,
  Paris: 1.4,
  London: 1.35,
  Bali: 1.25,
  Default: 1.1,
};

const calculateSeason = (month) => {
  if ([12, 1, 5, 6].includes(month)) return "peak";
  if ([2, 7, 8].includes(month)) return "low";
  return "normal";
};

const calculateDynamicPrice = async (listingId, checkInDate) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new Error("Listing not found");

  const basePrice = listing.basePrice || listing.price;
  const date = new Date(checkInDate);

  /* ======================
     OCCUPANCY SURGE
  ====================== */

  const totalRooms = await Listing.countDocuments({ city: listing.city });
  const bookedRooms = await Booking.countDocuments({
    listing: listingId,
    status: { $in: ["Booked", "CheckedIn"] },
  });

  const occupancyRate = totalRooms
    ? Math.round((bookedRooms / totalRooms) * 100)
    : 0;

  let factor = 1;

  if (occupancyRate > 70) factor *= 1.3;
  else if (occupancyRate > 50) factor *= 1.15;

  /* ======================
     WEEKEND SURGE
  ====================== */

  const isWeekend = [0, 6].includes(date.getDay());
  if (isWeekend) factor *= WEEKEND_MULTIPLIER;

  /* ======================
     SEASONAL PRICING
  ====================== */

  const month = date.getMonth() + 1;
  const season = calculateSeason(month);
  factor *= SEASONAL_MULTIPLIER[season];

  /* ======================
     CITY DEMAND
  ====================== */

  factor *= CITY_DEMAND[listing.city] || CITY_DEMAND.Default;

  /* ======================
     FINAL PRICE
  ====================== */

  const finalPrice = Math.round(basePrice * factor);

  return {
    basePrice,
    finalPrice,
    factor: factor.toFixed(2),
    signals: {
      occupancyRate: `${occupancyRate}%`,
      weekend: isWeekend,
      season,
      city: listing.city,
    },
  };
};

module.exports = { calculateDynamicPrice };
