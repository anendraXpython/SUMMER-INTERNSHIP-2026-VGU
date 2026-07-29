import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { runCalculation } from "../api/api";

function CalculatorSection({ user, selectedListing }) {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [interestRate, setInterestRate] = useState(7);
  const [loanYears, setLoanYears] = useState(20);

  const [result, setResult] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    setError("");
    try {
      const res = await runCalculation({
        username: user.username,
        listingId: selectedListing ? selectedListing._id : null,
        listingTitle: selectedListing ? selectedListing.title : null,
        homePrice: Number(homePrice),
        downPayment: Number(downPayment),
        interestRate: Number(interestRate),
        loanYears: Number(loanYears),
      });

      setResult(res.data.record);
      setSchedule(res.data.schedule);
      setComparison(res.data.comparison);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not run the calculation.");
      setResult(null);
    }
  };

  return (
    <section id="calculator">
      <h2>Mortgage Calculator</h2>
      <p>
        Enter the home price, down payment, interest rate and loan term. This runs the real
        amortizing-loan formula (not a rough estimate) and saves your calculation to MongoDB.
      </p>

      <div className="calc-box">
        {selectedListing ? (
          <p className="calc-selected-note">
            Calculating for: <strong>{selectedListing.title}</strong>
          </p>
        ) : (
          <p className="calc-selected-note">
            No listing selected — click "View Details" on a property to link this calculation to
            it, or just calculate on its own below.
          </p>
        )}

        <label>Home Price ($)</label>
        <input
          type="number"
          value={homePrice}
          onChange={(e) => setHomePrice(e.target.value)}
        />

        <label>Down Payment ($)</label>
        <input
          type="number"
          value={downPayment}
          onChange={(e) => setDownPayment(e.target.value)}
        />

        <label>Interest Rate (% per year)</label>
        <input
          type="number"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />

        <label>Loan Term (years)</label>
        <input
          type="number"
          value={loanYears}
          onChange={(e) => setLoanYears(e.target.value)}
        />

        <button className="btn-primary" onClick={handleCalculate}>
          Calculate
        </button>

        {error && <p className="message error">{error}</p>}

        {result && (
          <div className="calc-result">
            <p>
              Estimated monthly payment: <strong>${result.monthlyPayment.toLocaleString()}</strong>
            </p>
            <p>
              Total payable over {result.loanYears} years:{" "}
              <strong>${result.totalPayable.toLocaleString()}</strong> (interest: $
              {result.totalInterest.toLocaleString()})
            </p>
            <p className="saved-note">Saved to database.</p>
          </div>
        )}
      </div>

      {schedule.length > 0 && (
        <div className="amortization-chart">
          <h3>Amortization Schedule</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={schedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="remainingBalance"
                name="Remaining Balance"
                stroke="#2F6F5E"
                fill="#2F6F5E"
                fillOpacity={0.25}
              />
              <Area
                type="monotone"
                dataKey="interestPaid"
                name="Interest Paid (that year)"
                stroke="#C9A227"
                fill="#C9A227"
                fillOpacity={0.35}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {comparison.length > 0 && (
        <div className="rate-comparison">
          <h3>How your rate compares</h3>
          <table>
            <thead>
              <tr>
                <th>Rate</th>
                <th>Monthly Payment</th>
                <th>Total Payable</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.rate} className={row.rate === Number(interestRate) ? "current-rate-row" : ""}>
                  <td>{row.rate}%</td>
                  <td>${row.monthlyPayment.toLocaleString()}</td>
                  <td>${row.totalPayable.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default CalculatorSection;
