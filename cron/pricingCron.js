const cron = require("node-cron");

const Room = require("../models/Room");
const Booking = require("../models/Booking");

const { dynamicPrice } = require("../utils/dynamicPricing");

/* ======================================================
   NIGHTLY AI PRICING UPDATE (ROOM BASED)
   Runs Daily at 2 AM
====================================================== */
cron.schedule("0 2 * * *", async () => {
  console.log("⏳ Nightly Room AI pricing update running...");

  try {
    // ✅ Fetch all rooms
    const rooms = await Room.find().populate("listing", "city");

    for (const room of rooms) {
      /* ==============================
         1. TOTAL ROOM INVENTORY
      ============================== */
      const totalRooms = room.totalRooms;

      /* ==============================
         2. COUNT ACTIVE BOOKINGS
      ============================== */
      const bookedCount = await Booking.aggregate([
        {
          $match: {
            room: room._id,
            status: { $in: ["Booked", "checked-in"] },
          },
        },
        {
          $group: {
            _id: null,
            totalBooked: { $sum: "$roomsBooked" },
          },
        },
      ]);

      const bookedRooms = bookedCount[0]?.totalBooked || 0;

      /* ==============================
         3. OCCUPANCY RATE
      ============================== */
      const occupancyRate = Math.round(
        (bookedRooms / totalRooms) * 100
      );

      /* ==============================
         4. WEEKEND + SEASON FACTORS
      ============================== */
      const isWeekend = [0, 6].includes(new Date().getDay());
      const month = new Date().getMonth() + 1;

      let season = "normal";
      if ([12, 1, 5, 6].includes(month)) season = "peak";
      if ([2, 7, 8].includes(month)) season = "low";

      /* ==============================
         5. CITY DEMAND FACTOR
      ============================== */
      let cityDemand = 1;
      const city = room.listing?.city;

      if (["Goa", "Dubai", "Paris"].includes(city)) {
        cityDemand = 1.15;
      }

      /* ==============================
         6. AI DYNAMIC PRICING
      ============================== */
      const { finalPrice, factor } = dynamicPrice({
        basePrice: room.basePrice,
        occupancyRate,
        isWeekend,
        season,
        cityDemand,
      });

      /* ==============================
         7. UPDATE ROOM PRICE
      ============================== */
      room.dynamicPrice = finalPrice;
      room.price = finalPrice;

      await room.save();

      console.log(
        `✅ Updated ${room.type} (${city}) → ₹${finalPrice} (factor ${factor})`
      );
    }

    console.log("🎉 All room prices updated successfully!");
  } catch (error) {
    console.error("❌ Pricing Cron Failed:", error.message);
  }
});
