const express = require("express");
const router = express.Router();
const Calculation = require("../models/Calculation");
const {
  calculateMonthlyPayment,
  buildAmortizationSchedule,
  compareRates,
} = require("../services/mortgageService");

// POST /api/calculations
// Runs the real math server-side (never trusts a number the frontend
// might send), saves a record, and returns the schedule + comparison
// so the frontend can draw the chart immediately.
router.post("/", async (req, res) => {
  try {
    const {
      username,
      listingId,
      listingTitle,
      homePrice,
      downPayment,
      interestRate,
      loanYears,
    } = req.body;

    const loanAmount = homePrice - downPayment;

    if (loanAmount <= 0) {
      return res.status(400).json({ error: "Down payment must be less than the home price." });
    }

    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanYears);
    const totalPayable = monthlyPayment * loanYears * 12;
    const totalInterest = totalPayable - loanAmount;

    const schedule = buildAmortizationSchedule(loanAmount, interestRate, loanYears);
    const comparison = compareRates(loanAmount, interestRate, loanYears);

    const record = await Calculation.create({
      username: username || "guest",
      listingId: listingId || null,
      listingTitle: listingTitle || null,
      homePrice,
      downPayment,
      interestRate,
      loanYears,
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
    });

    res.json({ success: true, record, schedule, comparison });
  } catch (error) {
    res.status(500).json({ error: "Could not run the calculation." });
  }
});

// GET /api/calculations?username=xyz -- a buyer's saved calculation history
router.get("/", async (req, res) => {
  try {
    const { username } = req.query;
    const filter = username ? { username } : {};
    const calculations = await Calculation.find(filter).sort({ createdAt: -1 });
    res.json(calculations);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch calculations." });
  }
});

module.exports = router;
