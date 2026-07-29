const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const PLAN_LIMITS = require("../config/planLimits");

// GET /api/agents/plans -- static pricing table for the "Upgrade Plan" UI
router.get("/plans", (req, res) => {
  res.json(PLAN_LIMITS);
});

// GET /api/agents/:username/dashboard
// Returns the agent's current plan, usage against their limit, and (if
// their plan includes analytics) total views + a per-listing breakdown.
router.get("/:username/dashboard", async (req, res) => {
  try {
    const agent = await User.findOne({ username: req.params.username, role: "agent" });

    if (!agent) {
      return res.status(404).json({ error: "Agent account not found." });
    }

    const listings = await Listing.find({ agentUsername: agent.username }).sort({
      createdAt: -1,
    });

    const planInfo = PLAN_LIMITS[agent.plan];
    const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);

    res.json({
      username: agent.username,
      plan: agent.plan,
      planLabel: planInfo.label,
      listingLimit: planInfo.listingLimit,
      listingsUsed: listings.length,
      analyticsEnabled: planInfo.analytics,
      totalViews: planInfo.analytics ? totalViews : null,
      listings: planInfo.analytics
        ? listings.map((l) => ({ id: l._id, title: l.title, views: l.views }))
        : [],
    });
  } catch (error) {
    res.status(500).json({ error: "Could not load agent dashboard." });
  }
});

// PUT /api/agents/:username/plan -- upgrade or downgrade a plan
// (no real payment here -- Stripe wasn't part of this build's scope --
// this just changes the plan field, which is what actually gates the
// listing limit and analytics elsewhere in the app)
router.put("/:username/plan", async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLAN_LIMITS[plan]) {
      return res.status(400).json({ error: "Not a valid plan." });
    }

    const agent = await User.findOneAndUpdate(
      { username: req.params.username, role: "agent" },
      { plan },
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ error: "Agent account not found." });
    }

    res.json({ success: true, plan: agent.plan });
  } catch (error) {
    res.status(500).json({ error: "Could not update plan." });
  }
});

module.exports = router;
