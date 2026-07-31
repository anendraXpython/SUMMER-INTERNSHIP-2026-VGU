const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.get("/", async (req, res) => {
  try {
    const { listingId } = req.query;
    const filter = listingId ? { listingId } : { listingId: null };

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Could not load chat history." });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { listingId } = req.query;
    const filter = listingId ? { listingId } : { listingId: null };

    await Message.deleteMany(filter);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Could not clear chat." });
  }
});

module.exports = router;
