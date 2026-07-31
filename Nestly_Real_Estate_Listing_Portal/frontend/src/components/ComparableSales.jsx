function ComparableSales({ comparables }) {
  if (!comparables || comparables.length === 0) {
    return (
      <div className="comparable-sales">
        <h4>Comparable Listings</h4>
        <p className="comparables-note">No comparable listings found nearby yet.</p>
      </div>
    );
  }

  return (
    <div className="comparable-sales">
      <h4>Comparable Listings Nearby</h4>
      <div className="comparables-grid">
        {comparables.map((c) => (
          <div key={c.id} className="comparable-card">
            <img src={c.image} alt={c.title} />
            <div className="comparable-card-body">
              <p className="comp-price">
                ${c.price.toLocaleString()} <span>(${c.pricePerSqft}/sqft)</span>
              </p>
              <p className="comp-title">{c.title}</p>
              <p className="comp-meta">
                {c.beds} bd &middot; {c.baths} ba &middot; {c.sqft} sqft
              </p>
              <span
                className={`status-badge status-${c.status.replace(" ", "-").toLowerCase()}`}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparableSales;
