import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PriceHistoryChart({ priceHistory }) {
  if (!priceHistory || priceHistory.length === 0) {
    return null;
  }

  if (priceHistory.length === 1) {
    return (
      <div className="price-history-chart">
        <h4>Price History</h4>
        <p className="price-history-note">
          Listed at ${priceHistory[0].price.toLocaleString()} on{" "}
          {new Date(priceHistory[0].date).toLocaleDateString()}. No price changes yet.
        </p>
      </div>
    );
  }

  const data = priceHistory.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    price: entry.price,
  }));

  return (
    <div className="price-history-chart">
      <h4>Price History</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Line
            type="stepAfter"
            dataKey="price"
            name="Listing Price"
            stroke="#2F6F5E"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceHistoryChart;
