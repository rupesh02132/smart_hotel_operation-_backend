const mongoose = require("mongoose");
const { Children } = require("react");

const roomSchema = mongoose.Schema(
  {
    /* ======================
       CONNECT HOTEL
    ====================== */
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
 images: { type: [String], required: true },
    /* ======================
       ROOM INFO
    ====================== */

    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },

    floor: { type: Number },

    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Single", "Double", "Family", "Presidential"],
      default: "Standard",
    },

    /* ======================
       CAPACITY
    ====================== */

    guests: { type: Number, required: true },
    children: { type: Number, default: 0 },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    baths: { type: Number, required: true },

    /* ======================
       PRICING
    ====================== */

    basePrice: { type: Number, default: 0 },
    dynamicPrice: { type: Number, default: 0 },
  

    /* ======================
       ROOM AMENITIES
    ====================== */

    amenities: { type: [String], required: true },

    /* ======================
       HOUSEKEEPING
    ====================== */

    housekeepingAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastCleanedAt: { type: Date },

    /* ======================
       AVAILABILITY
    ====================== */

    blackoutDates: [Date],

    maintenanceBlocks: [
      {
        start: Date,
        end: Date,
        reason: String,
      },
    ],

    /* ======================
       ROOM STATUS
    ====================== */
status: {
  type: String,
  enum: [
    "Vacant",
    "Occupied",
    "Cleaning",
    "Maintenance",
    "Blocked",
    "Ready"
  ],
  default: "Vacant",
},
  },
  { timestamps: true }
);

/* ======================
   VIRTUAL FINAL PRICE
====================== */

roomSchema.virtual("finalPrice").get(function () {
  return this.dynamicPrice > 0 ? this.dynamicPrice : this.basePrice;
});



module.exports = mongoose.model("Room", roomSchema);
