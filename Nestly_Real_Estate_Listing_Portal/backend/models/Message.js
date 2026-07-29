const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  // null/omitted = general "Live Chat with an Agent" room.
  // If set, the message is scoped to a specific listing's chat thread.
  listingId: { type: String, default: null },
  name: { type: String, required: true },
  role: { type: String, enum: ["buyer", "agent"], default: "buyer" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
