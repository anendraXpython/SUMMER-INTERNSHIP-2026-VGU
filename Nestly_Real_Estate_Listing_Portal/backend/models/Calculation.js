const mongoose = require("mongoose");

const calculationSchema = new mongoose.Schema({
  username: { type: String, default: "guest" },
  listingId: { type: String, default: null },
  listingTitle: { type: String, default: null },

  homePrice: { type: Number, required: true },
  downPayment: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  loanYears: { type: Number, required: true },

  monthlyPayment: { type: Number, required: true },
  totalPayable: { type: Number, required: true },
  totalInterest: { type: Number, required: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Calculation", calculationSchema);
