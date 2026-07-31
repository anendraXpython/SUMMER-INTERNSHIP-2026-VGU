import { useState, useEffect, useCallback } from "react";
import {
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearchCheckNow,
} from "../api/api";

function describeFilters(filters) {
  const parts = [];
  if (filters.location) parts.push(filters.location);
  if (filters.propertyType) parts.push(filters.propertyType);
  if (filters.beds) parts.push(`${filters.beds}+ beds`);
  if (filters.maxPrice) parts.push(`under $${Number(filters.maxPrice).toLocaleString()}`);
  return parts.length > 0 ? parts.join(" · ") : "All listings";
}

function SavedSearchesSection({ user }) {
  const [searches, setSearches] = useState([]);
  const [checkMessage, setCheckMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const loadSearches = useCallback(() => {
    getSavedSearches(user.username).then((res) => setSearches(res.data));
  }, [user.username]);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleToggleAlerts = async (search) => {
    await updateSavedSearch(search._id, { emailAlerts: !search.emailAlerts });
    loadSearches();
  };

  const handleDelete = async (id) => {
    await deleteSavedSearch(id);
    loadSearches();
  };

  const handleRunCheckNow = async () => {
    setIsChecking(true);
    setCheckMessage("");
    try {
      const res = await runSavedSearchCheckNow();
      setCheckMessage(
        `Checked ${res.data.searchesChecked} saved search(es) — ${res.data.alertsSent} email alert(s) sent.`
      );
    } catch (error) {
      setCheckMessage("Could not run the check right now.");
    }
    setIsChecking(false);
  };

  return (
    <section id="saved-searches">
      <h2>Saved Searches</h2>
      <p>
        Save a search from the listings page above and we'll email you whenever a new property
        matches it. New listings are checked automatically every 10 minutes, or you can trigger a
        check right now below.
      </p>

      <button className="btn-secondary" onClick={handleRunCheckNow} disabled={isChecking}>
        {isChecking ? "Checking..." : "Check for new matches now"}
      </button>
      {checkMessage && <p className="message success">{checkMessage}</p>}

      {searches.length === 0 ? (
        <p className="saved-searches-empty">
          You haven't saved any searches yet. Use the "Save this search" button above the listings
          to create one.
        </p>
      ) : (
        <div className="saved-searches-list">
          {searches.map((search) => (
            <div key={search._id} className="saved-search-card">
              <div>
                <h4>{search.label}</h4>
                <p className="saved-search-filters">{describeFilters(search.filters)}</p>
                <p className="saved-search-meta">
                  Last checked: {new Date(search.lastAlertedAt).toLocaleString()}
                </p>
              </div>
              <div className="saved-search-actions">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={search.emailAlerts}
                    onChange={() => handleToggleAlerts(search)}
                  />
                  Email alerts
                </label>
                <button className="btn-secondary" onClick={() => handleDelete(search._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedSearchesSection;
