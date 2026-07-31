const mongoose = require("mongoose");

// Every entry here is a real, timestamped snapshot of the price at that
// moment -- pushed automatically by the pre-save hook below, never faked.
const priceHistoryEntrySchema = new mongoose.Schema(
  { price: { type: Number, required: true }, date: { type: Date, default: Date.now } },
  { _id: false }
);

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

  // Matterport / Kuula / any embeddable virtual-tour link. Optional --
  // when empty, the frontend simply doesn't render the virtual tour block.
  virtualTourUrl: { type: String, default: "" },

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

  agentUsername: { type: String, required: true },

  // simple analytics
  views: { type: Number, default: 0 },

  // usernames of buyers who favorited this listing
  favoritedBy: { type: [String], default: [] },

  // real price-history log, not sample data -- populated by the hook below
  priceHistory: { type: [priceHistoryEntrySchema], default: [] },

  createdAt: { type: Date, default: Date.now },
});

// Keeps a genuine audit trail of every price this listing has ever had,
// so the "Price History" chart on the frontend reflects real changes an
// agent makes over time (not a mocked-up curve).
listingSchema.pre("save", function (next) {
  if (this.isNew) {
    this.priceHistory.push({ price: this.price, date: this.createdAt || new Date() });
  } else if (this.isModified("price")) {
    this.priceHistory.push({ price: this.price, date: new Date() });
  }
  next();
});

module.exports = mongoose.model("Listing", listingSchema);
