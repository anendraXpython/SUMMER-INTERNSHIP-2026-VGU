import { useState, useEffect } from "react";
import {
  getPlanOptions,
  getAgentDashboard,
  updateAgentPlan,
  createListing,
  createCheckoutSession,
} from "../api/api";

const EMPTY_LISTING = {
  title: "",
  location: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "House",
  yearBuilt: "",
  lat: "",
  lng: "",
  image: "",
  virtualTourUrl: "",
  description: "",
};

function AgentDashboardSection({ user }) {
  const [plans, setPlans] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");
  const [stripeNotice, setStripeNotice] = useState("");
  const [pendingDemoPlan, setPendingDemoPlan] = useState(null);
  const [newListing, setNewListing] = useState(EMPTY_LISTING);
  const [listingMessage, setListingMessage] = useState("");

  const loadDashboard = () => {
    getAgentDashboard(user.username).then((res) => setDashboard(res.data));
  };

  useEffect(() => {
    getPlanOptions().then((res) => setPlans(res.data));
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.username]);

  // Real Stripe Checkout flow: asks the backend for a checkout session and
  // redirects the browser to Stripe's hosted payment page. The plan is
  // only upgraded after Stripe confirms payment via the webhook in
  // paymentRoutes.js -- not the moment this button is clicked.
  const handleUpgrade = async (planKey) => {
    setMessage("");
    setStripeNotice("");
    setPendingDemoPlan(null);

    try {
      const res = await createCheckoutSession(user.username, planKey);
      window.location.href = res.data.url;
    } catch (error) {
      if (error?.response?.status === 503) {
        setStripeNotice(error.response.data.error);
        setPendingDemoPlan(planKey);
      } else {
        setMessage(error?.response?.data?.error || "Could not start checkout.");
      }
    }
  };

  // Used only when Stripe hasn't been configured with real keys yet, so the
  // plan-switching part of the dashboard is still fully testable.
  const handleDemoSwitch = async (planKey) => {
    await updateAgentPlan(user.username, planKey);
    setMessage(`Plan changed to ${plans[planKey].label} (demo mode — no real payment taken).`);
    setStripeNotice("");
    setPendingDemoPlan(null);
    loadDashboard();
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    setListingMessage("");

    try {
      await createListing({
        ...newListing,
        price: Number(newListing.price),
        beds: Number(newListing.beds),
        baths: Number(newListing.baths),
        sqft: Number(newListing.sqft),
        yearBuilt: Number(newListing.yearBuilt),
        lat: Number(newListing.lat),
        lng: Number(newListing.lng),
        agentUsername: user.username,
      });

      setListingMessage("Listing created successfully.");
      setNewListing(EMPTY_LISTING);
      loadDashboard();
    } catch (error) {
      setListingMessage(error?.response?.data?.error || "Could not create listing.");
    }
  };

  if (!dashboard) return null;

  return (
    <section id="agent-dashboard">
      <h2>Agent Dashboard</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Your Plan: {dashboard.planLabel}</h3>
          <p>
            Listings used: {dashboard.listingsUsed} /{" "}
            {dashboard.listingLimit === Infinity ? "Unlimited" : dashboard.listingLimit}
          </p>

          {dashboard.analyticsEnabled ? (
            <>
              <p>Total views across all your listings: {dashboard.totalViews}</p>
              <ul className="views-breakdown">
                {dashboard.listings.map((l) => (
                  <li key={l.id}>
                    {l.title} — {l.views} views
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="upsell-note">
              Upgrade to Pro or Premium to unlock listing view analytics.
            </p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Subscription Plans</h3>
          {message && <p className="message success">{message}</p>}
          <div className="plans-grid">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={dashboard.plan === key ? "plan-tile active-plan" : "plan-tile"}
              >
                <h4>{plan.label}</h4>
                <p className="plan-price">
                  {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}/mo`}
                </p>
                <ul>
                  <li>
                    {plan.listingLimit === null || plan.listingLimit === Infinity
                      ? "Unlimited listings"
                      : `Up to ${plan.listingLimit} listings`}
                  </li>
                  <li>{plan.analytics ? "View analytics included" : "No analytics"}</li>
                  <li>{plan.featured ? "Featured listing badge" : "Standard listing"}</li>
                </ul>
                {dashboard.plan === key ? (
                  <span className="current-plan-tag">Current plan</span>
                ) : (
                  <button className="btn-secondary" onClick={() => handleUpgrade(key)}>
                    {plan.monthlyPrice === 0 ? `Switch to ${plan.label}` : `Upgrade to ${plan.label}`}
                  </button>
                )}

                {pendingDemoPlan === key && (
                  <div className="stripe-fallback">
                    <p className="stripe-fallback-note">{stripeNotice}</p>
                    <button className="btn-secondary" onClick={() => handleDemoSwitch(key)}>
                      Switch without payment (demo mode)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="plan-disclaimer">
            Paid plans go through real Stripe Checkout (test mode) once STRIPE_SECRET_KEY is set in
            backend/.env — the plan only upgrades after Stripe confirms payment via webhook.
            Without a key, you'll be offered a free demo-mode switch instead so the rest of the
            dashboard stays fully testable.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Add a New Listing</h3>
        <form onSubmit={handleAddListing} className="add-listing-form">
          <input
            placeholder="Title"
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
            required
          />
          <input
            placeholder="Location"
            value={newListing.location}
            onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newListing.price}
            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Beds"
            value={newListing.beds}
            onChange={(e) => setNewListing({ ...newListing, beds: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Baths"
            value={newListing.baths}
            onChange={(e) => setNewListing({ ...newListing, baths: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Sqft"
            value={newListing.sqft}
            onChange={(e) => setNewListing({ ...newListing, sqft: e.target.value })}
            required
          />
          <select
            value={newListing.propertyType}
            onChange={(e) => setNewListing({ ...newListing, propertyType: e.target.value })}
          >
            <option>House</option>
            <option>Condo</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Townhouse</option>
          </select>
          <input
            type="number"
            placeholder="Year built"
            value={newListing.yearBuilt}
            onChange={(e) => setNewListing({ ...newListing, yearBuilt: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            value={newListing.lat}
            onChange={(e) => setNewListing({ ...newListing, lat: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={newListing.lng}
            onChange={(e) => setNewListing({ ...newListing, lng: e.target.value })}
            required
          />
          <input
            placeholder="Image URL"
            value={newListing.image}
            onChange={(e) => setNewListing({ ...newListing, image: e.target.value })}
          />
          <input
            placeholder="Virtual tour URL (Matterport / Kuula, optional)"
            value={newListing.virtualTourUrl}
            onChange={(e) => setNewListing({ ...newListing, virtualTourUrl: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Create Listing
          </button>
        </form>
        {listingMessage && <p className="message">{listingMessage}</p>}
      </div>
    </section>
  );
}

export default AgentDashboardSection;
