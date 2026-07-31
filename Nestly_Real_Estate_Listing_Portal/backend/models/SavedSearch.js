const mongoose = require("mongoose");

// Stores one buyer's saved search criteria. The alert scheduler (see
// services/alertScheduler.js) re-runs this filter periodically and emails
// the user whenever a listing created after `lastAlertedAt` matches.
const savedSearchSchema = new mongoose.Schema({
  username: { type: String, required: true },
  label: { type: String, default: "My Search" },

  filters: {
    location: { type: String, default: "" },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    beds: { type: Number, default: null },
    propertyType: { type: String, default: "" },
  },

  emailAlerts: { type: Boolean, default: true },
  lastAlertedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SavedSearch", savedSearchSchema);
