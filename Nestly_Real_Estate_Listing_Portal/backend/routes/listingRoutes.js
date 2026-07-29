const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const PLAN_LIMITS = require("../config/planLimits");
const { getSchoolRatings } = require("../services/schoolRatingsService");

// GET /api/listings
// Supports: location, minPrice, maxPrice, beds, baths, propertyType, status,
// sortBy (price_asc | price_desc | newest), page, limit
router.get("/", async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      beds,
      baths,
      propertyType,
      status,
      sortBy,
      page = 1,
      limit = 6,
    } = req.query;

    const filter = {};
    if (location) filter.location = { $regex: location, $options: "i" };
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    if (beds) filter.beds = { $gte: Number(beds) };
    if (baths) filter.baths = { $gte: Number(baths) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sort = { createdAt: -1 }; // newest first, default
    if (sortBy === "price_asc") sort = { price: 1 };
    if (sortBy === "price_desc") sort = { price: -1 };

    const pageNum = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);

    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch listings." });
  }
});

// GET /api/listings/locations -- distinct location list for the search dropdown
router.get("/locations", async (req, res) => {
  const locations = await Listing.distinct("location");
  res.json(locations);
});

// GET /api/listings/:id -- also bumps the view counter (basic analytics
// for the agent dashboard) and attaches sample school ratings
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const schoolRatings = getSchoolRatings(listing);
    res.json({ ...listing.toObject(), schoolRatings });
  } catch (error) {
    res.status(400).json({ error: "Invalid listing id." });
  }
});

// POST /api/listings -- create a new listing, but only up to the agent's plan limit
router.post("/", async (req, res) => {
  try {
    const { agentUsername } = req.body;
    const agent = await User.findOne({ username: agentUsername, role: "agent" });

    if (!agent) {
      return res.status(403).json({ error: "Only registered agents can create listings." });
    }

    const limit = PLAN_LIMITS[agent.plan].listingLimit;
    const currentCount = await Listing.countDocuments({ agentUsername });

    if (currentCount >= limit) {
      return res.status(403).json({
        error: `Your ${PLAN_LIMITS[agent.plan].label} plan allows up to ${limit} listings. Upgrade your plan to add more.`,
      });
    }

    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: "Could not create listing. Check the fields you sent." });
  }
});

// PUT /api/listings/:id/favorite -- toggle a buyer's favorite on a listing
router.put("/:id/favorite", async (req, res) => {
  try {
    const { username } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const alreadyFavorited = listing.favoritedBy.includes(username);

    if (alreadyFavorited) {
      listing.favoritedBy = listing.favoritedBy.filter((u) => u !== username);
    } else {
      listing.favoritedBy.push(username);
    }

    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: "Could not update favorite." });
  }
});

module.exports = router;
