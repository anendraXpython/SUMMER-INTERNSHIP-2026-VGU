const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PLAN_LIMITS = require("../config/planLimits");

// Real Stripe SDK -- only initialized if a secret key is present. Without
// one, the endpoints below respond with a clear 503 explaining exactly what
// to add, instead of pretending to charge a card.
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

router.get("/status", (req, res) => {
  res.json({ configured: Boolean(stripe) });
});

router.post("/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error:
        "Stripe isn't configured yet. Add STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET) to backend/.env to enable real payments.",
    });
  }

  try {
    const { username, plan } = req.body;
    const planInfo = PLAN_LIMITS[plan];

    if (!planInfo || planInfo.monthlyPrice === 0) {
      return res.status(400).json({ error: "Not a paid plan." });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Nestly ${planInfo.label} Plan` },
            unit_amount: planInfo.monthlyPrice * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { username, plan },
      success_url: `${frontendUrl}/?payment=success&plan=${plan}`,
      cancel_url: `${frontendUrl}/?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Could not start checkout: " + error.message });
  }
});

// IMPORTANT: this route needs the *raw* request body to verify Stripe's
// signature, so server.js mounts express.raw() for this exact path BEFORE
// the global express.json() parser runs. See server.js for that ordering.
router.post("/webhook", async (req, res) => {
  if (!stripe) return res.status(503).send("Stripe not configured");

  let event;
  try {
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { username, plan } = session.metadata || {};

    if (username && plan) {
      await User.findOneAndUpdate({ username }, { plan });
      console.log(`Stripe payment confirmed -- upgraded ${username} to ${plan}.`);
    }
  }

  res.json({ received: true });
});

module.exports = router;
