const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const PLAN_LIMITS = require("../config/planLimits");
const { getSchoolRatings } = require("../services/schoolRatingsService");
const { getWalkScore } = require("../services/walkScoreService");
const { getComparableSales } = require("../services/comparableSalesService");

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

router.get("/locations", async (req, res) => {
  const locations = await Listing.distinct("location");
  res.json(locations);
});

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

    // school ratings + walk score are clearly-labeled sample data (see the
    // notice at the top of each service file); comparable sales is a real
    // query against our own listings collection.
    const schoolRatings = getSchoolRatings(listing);
    const walkScoreData = getWalkScore(listing);
    const comparableSales = await getComparableSales(listing);

    res.json({
      ...listing.toObject(),
      schoolRatings,
      walkScoreData,
      comparableSales,
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid listing id." });
  }
});

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

// Agents can update a listing's price (and anything else). Because the
// Listing model's pre-save hook watches for `isModified("price")`, saving
// here automatically appends a new, real entry to that listing's price
// history -- which is exactly what powers the Price History chart.
router.put("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    Object.entries(req.body).forEach(([key, value]) => {
      if (key === "_id" || key === "priceHistory" || key === "agentUsername") return;
      listing[key] = value;
    });

    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: "Could not update listing." });
  }
});

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
