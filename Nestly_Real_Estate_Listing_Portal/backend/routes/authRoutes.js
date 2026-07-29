const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/login
// Same "no password, just name + email" approach as the original prototype,
// but now also captures whether the person is a buyer or an agent, since
// agent subscription plans only make sense for agent accounts.
router.post("/", async (req, res) => {
  try {
    const { username, email, role } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    let user = await User.findOne({ username });

    if (user) {
      if (user.email !== email) {
        return res.status(400).json({
          error: "That name is already registered with a different email.",
        });
      }
    } else {
      user = await User.create({
        username,
        email,
        role: role === "agent" ? "agent" : "buyer",
      });
    }

    res.json({
      success: true,
      username: user.username,
      role: user.role,
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while logging in." });
  }
});

module.exports = router;
