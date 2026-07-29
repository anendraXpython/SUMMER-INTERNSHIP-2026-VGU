const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  beds: { type: Number, required: true, min: 0 },
  baths: { type: Number, required: true, min: 0 },
  sqft: { type: Number, required: true, min: 1 },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },

  propertyType: {
    type: String,
    enum: ["House", "Condo", "Apartment", "Villa", "Townhouse"],
    default: "House",
  },
  status: {
    type: String,
    enum: ["For Sale", "Pending", "Sold"],
    default: "For Sale",
  },
  yearBuilt: { type: Number },

  // which agent this listing belongs to (used to enforce plan limits)
  agentUsername: { type: String, required: true },

  // simple analytics: bumped every time a listing's details are opened
  views: { type: Number, default: 0 },

  // usernames of buyers who favorited this listing
  favoritedBy: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", listingSchema);
