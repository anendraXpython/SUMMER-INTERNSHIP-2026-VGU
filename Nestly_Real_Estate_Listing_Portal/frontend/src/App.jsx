import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import ListingsSection from "./components/ListingsSection";
import MapSection from "./components/MapSection";
import CalculatorSection from "./components/CalculatorSection";
import ChatSection from "./components/ChatSection";
import AgentDashboardSection from "./components/AgentDashboardSection";
import Footer from "./components/Footer";
import AboutSection from "./components/AboutSection";

function App() {
  const [user, setUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  // check localStorage on first load, same approach as the original prototype
  useEffect(() => {
    const saved = localStorage.getItem("nestlyUser");
    if (saved) {
      setUser(JSON.parse(saved));
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

      <ListingsSection user={user} onSelectForChatOrCalc={setSelectedListing} />

      <MapSection />

      <CalculatorSection user={user} selectedListing={selectedListing} />

      <ChatSection user={user} selectedListing={selectedListing} />

      {user.role === "agent" && <AgentDashboardSection user={user} />}

      <AboutSection />

      <Footer />
    </div>
  );
}

export default App;
