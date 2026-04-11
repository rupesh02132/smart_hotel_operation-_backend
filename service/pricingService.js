const Booking = require("../models/Booking");
const Room = require("../models/Room");

/* ======================
   CONFIG
====================== */

const WEEKEND_MULTIPLIER = 1.2;

const SEASONAL_MULTIPLIER = {
  peak: 1.35,   // Dec, Jan, May, Jun
  normal: 1.0,
  low: 0.85,    // Feb, Jul, Aug
};

const FESTIVAL_MULTIPLIER = 1.2;

const CITY_DEMAND = {
  mumbai: 1.4,
  delhi: 1.3,
  bangalore: 1.3,
  chennai: 1.25,
  hyderabad: 1.25,
  pune: 1.2,
  goa: 1.35,
  jaipur: 1.3,
  manali: 1.35,
  shimla: 1.3,
  udaipur: 1.35,
  rishikesh: 1.25,
  varanasi: 1.2,
  kolkata: 1.2,
  chandigarh: 1.2,
  jaipur: 1.3,
  lucknow: 1.2,
  dehradun: 1.2,
  chandigarh: 1.2,
  noida: 1.2,
  patna: 1.2,
  default: 1.1,
};

/* ======================
   HELPERS
====================== */

const calculateSeason = (month) => {
  if ([12, 1, 5, 6].includes(month)) return "peak";
  if ([2, 7, 8].includes(month)) return "low";
  return "normal";
};

const isFestivalSeason = (month) => [10, 11, 12].includes(month);

/* ======================
   MAIN ENGINE
====================== */

const calculateDynamicPrice = async (roomId, checkInDate) => {
  try {
    /* ---------- VALIDATION ---------- */
    if (!roomId || !checkInDate) {
      throw new Error("roomId and checkInDate are required");
    }

    const date = new Date(checkInDate);
    if (isNaN(date)) {
      throw new Error("Invalid checkInDate");
    }

    /* ---------- FETCH ROOM + LISTING ---------- */
    const room = await Room.findById(roomId).populate("listing");
    if (!room) throw new Error("Room not found");
    if (!room.listing) throw new Error("Listing not linked");

    const basePrice = room.basePrice || 1000;

    /* ---------- INIT ---------- */
    let factor = 1;

    /* ======================
       CITY (SAFE)
    ====================== */
    const city = room.listing?.city || "default";
    const cityKey = city.toLowerCase();

    /* ======================
       OCCUPANCY (FIXED)
       - Only this listing's rooms
       - Only overlapping bookings
    ====================== */

    const totalRooms = await Room.countDocuments({
      listing: room.listing._id,
    });

    const bookedRooms = await Booking.countDocuments({
      room: { $exists: true },
      status: { $in: ["Booked", "CheckedIn"] },
      checkInDate: { $lte: date },
      checkOutDate: { $gte: date },
      // optionally restrict to same listing:
      // listing: room.listing._id (if you store it on Booking)
    });

    const occupancyRate = totalRooms
      ? Math.round((bookedRooms / totalRooms) * 100)
      : 0;

    if (occupancyRate > 70) factor *= 1.3;
    else if (occupancyRate > 50) factor *= 1.15;

    /* ======================
       WEEKEND
    ====================== */
    const isWeekend = [0, 6].includes(date.getDay());
    if (isWeekend) factor *= WEEKEND_MULTIPLIER;

    /* ======================
       SEASONAL
    ====================== */
    const month = date.getMonth() + 1;
    const season = calculateSeason(month);
    factor *= SEASONAL_MULTIPLIER[season];

    /* ======================
       FESTIVAL
    ====================== */
    if (isFestivalSeason(month)) {
      factor *= FESTIVAL_MULTIPLIER;
    }

    /* ======================
       CITY DEMAND
    ====================== */
    factor *= CITY_DEMAND[cityKey] || CITY_DEMAND.default;

    /* ======================
       FINAL PRICE
    ====================== */
    const finalPrice = Math.round(basePrice * factor);

    /* ---------- DEBUG ---------- */
    console.log("📊 Dynamic Pricing:", {
      roomId,
      city,
      basePrice,
      finalPrice,
      factor: factor.toFixed(2),
      occupancyRate,
      weekend: isWeekend,
      season,
    });

    return {
      basePrice,
      finalPrice,
      factor: factor.toFixed(2),
      signals: {
        occupancyRate: `${occupancyRate}%`,
        weekend: isWeekend,
        season,
        city,
      },
    };

  } catch (error) {
    console.error("❌ Dynamic Pricing Error:", error.message);
    throw error;
  }
};

module.exports = { calculateDynamicPrice };