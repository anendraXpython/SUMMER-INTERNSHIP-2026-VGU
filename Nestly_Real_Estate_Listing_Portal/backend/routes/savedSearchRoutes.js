const express = require("express");
const router = express.Router();
const SavedSearch = require("../models/SavedSearch");
const { checkSavedSearches } = require("../services/alertScheduler");

router.post("/", async (req, res) => {
  try {
    const { username, label, filters, emailAlerts } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required." });
    }

    const search = await SavedSearch.create({
      username,
      label: label || "My Search",
      filters: filters || {},
      emailAlerts: emailAlerts !== false,
    });

    res.status(201).json(search);
  } catch (error) {
    res.status(400).json({ error: "Could not save this search." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "username is required." });
    }

    const searches = await SavedSearch.find({ username }).sort({ createdAt: -1 });
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: "Could not load saved searches." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { emailAlerts, label } = req.body;
    const update = {};
    if (typeof emailAlerts === "boolean") update.emailAlerts = emailAlerts;
    if (label) update.label = label;

    const search = await SavedSearch.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!search) {
      return res.status(404).json({ error: "Saved search not found." });
    }

    res.json(search);
  } catch (error) {
    res.status(400).json({ error: "Could not update saved search." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await SavedSearch.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Could not delete saved search." });
  }
});

// Lets the frontend trigger an immediate check instead of waiting for the
// next scheduled run -- handy for demoing the alert pipeline live.
router.post("/run-check-now", async (req, res) => {
  try {
    const result = await checkSavedSearches();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: "Could not run the saved-search check." });
  }
});

module.exports = router;
