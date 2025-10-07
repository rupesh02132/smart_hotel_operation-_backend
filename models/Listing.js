const mongoose = require('mongoose');

const listingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], 
        required: true,
        index: '2dsphere' 
      }
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    guests: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    beds: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String],
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    review: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        default: []
      }
    ],
    rating: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
        default: []
      }
    ],
  
    totalCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    // Add virtuals for JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create geospatial index for location field
listingSchema.index({ location: '2dsphere' });


const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

