const mongoose = require("mongoose");

const listingSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    title: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    ratingAvg: { type: Number, default: 0 },
    hotelcode: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },

    review: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    rating: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],

    demandScore: { type: Number, default: 1 },
    seasonalMultiplier: { type: Number, default: 1 },
  },
  { timestamps: true }
);

/* ===========================
   VIRTUAL ROOMS
=========================== */
listingSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "listing",
});

/* Enable virtuals */
listingSchema.set("toJSON", { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

/* INDEXES */
listingSchema.index({ location: "2dsphere" });
listingSchema.index({ city: 1 });

module.exports = mongoose.model("Listing", listingSchema);