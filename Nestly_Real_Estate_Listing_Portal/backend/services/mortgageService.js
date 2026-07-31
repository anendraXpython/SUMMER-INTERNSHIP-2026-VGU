// Standard amortizing loan formula. This is the same formula every real
// mortgage calculator uses (not a rough estimate like the old prototype,
// which just did price * rate * years -- that overstates interest since it
// never accounts for the loan balance shrinking each month).
function calculateMonthlyPayment(loanAmount, annualRatePercent, years) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = years * 12;

  if (monthlyRate === 0) {
    return loanAmount / totalMonths;
  }

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

// Builds a year-by-year summary (not month-by-month, which would be 240+
// rows for a 20 year loan and too dense for a chart) of remaining balance,
// principal paid, and interest paid -- exactly what an amortization chart needs.
function buildAmortizationSchedule(loanAmount, annualRatePercent, years) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRatePercent, years);

  let balance = loanAmount;
  const yearlySchedule = [];

  for (let year = 1; year <= years; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;

      balance -= principalPortion;
      yearlyPrincipal += principalPortion;
      yearlyInterest += interestPortion;
    }

    yearlySchedule.push({
      year,
      principalPaid: Number(yearlyPrincipal.toFixed(2)),
      interestPaid: Number(yearlyInterest.toFixed(2)),
      remainingBalance: Number(Math.max(balance, 0).toFixed(2)),
    });
  }

  return yearlySchedule;
}

// Compares the same loan at a few different rates side by side, e.g. the
// buyer's quoted rate vs. -0.5% and +0.5%, to show how much a rate shift
// would change their monthly payment.
function compareRates(loanAmount, baseRatePercent, years) {
  const ratesToCompare = [
    baseRatePercent - 0.5,
    baseRatePercent,
    baseRatePercent + 0.5,
    baseRatePercent + 1,
  ].filter((rate) => rate > 0);

  return ratesToCompare.map((rate) => {
    const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, years);
    return {
      rate: Number(rate.toFixed(2)),
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayable: Number((monthlyPayment * years * 12).toFixed(2)),
    };
  });
}

module.exports = { calculateMonthlyPayment, buildAmortizationSchedule, compareRates };
