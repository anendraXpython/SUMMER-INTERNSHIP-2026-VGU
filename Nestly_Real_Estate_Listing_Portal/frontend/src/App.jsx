import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import ListingsSection from "./components/ListingsSection";
import MapSection from "./components/MapSection";
import CalculatorSection from "./components/CalculatorSection";
import SavedSearchesSection from "./components/SavedSearchesSection";
import ChatSection from "./components/ChatSection";
import AgentDashboardSection from "./components/AgentDashboardSection";
import Footer from "./components/Footer";
import AboutSection from "./components/AboutSection";

function App() {
  const [user, setUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [paymentBanner, setPaymentBanner] = useState(null);

  // check localStorage on first load, same approach as the original prototype
  useEffect(() => {
    const saved = localStorage.getItem("nestlyUser");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // Picks up the ?payment=success / ?payment=cancelled redirect Stripe
  // sends the browser back to after Checkout, and shows a friendly banner.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment === "success") {
      const plan = params.get("plan");
      setPaymentBanner({
        type: "success",
        text: `Payment received — your ${plan || ""} plan will be active as soon as Stripe confirms the subscription.`,
      });
    } else if (payment === "cancelled") {
      setPaymentBanner({ type: "cancelled", text: "Checkout was cancelled — no changes were made." });
    }

    if (payment) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleLoggedIn = (userData) => {
    localStorage.setItem("nestlyUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("nestlyUser");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div className="app-shell">
      <Header user={user} onLogout={handleLogout} />

      {paymentBanner && (
        <div className={`payment-banner payment-banner-${paymentBanner.type}`}>
          {paymentBanner.text}
          <button className="payment-banner-close" onClick={() => setPaymentBanner(null)}>
            ×
          </button>
        </div>
      )}

      <ListingsSection user={user} onSelectForChatOrCalc={setSelectedListing} />

      <MapSection />

      <CalculatorSection user={user} selectedListing={selectedListing} />

      <SavedSearchesSection user={user} />

      <ChatSection user={user} selectedListing={selectedListing} />

      {user.role === "agent" && <AgentDashboardSection user={user} />}

      <AboutSection />

      <Footer />
    </div>
  );
}

export default App;
