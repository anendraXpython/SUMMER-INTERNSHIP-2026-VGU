const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  listingId: { type: String, default: null },
  name: { type: String, required: true },
  role: { type: String, enum: ["buyer", "agent"], default: "buyer" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
