import { useState } from "react";
import { getListingById, toggleFavorite } from "../api/api";
import SchoolRatingBadge from "./SchoolRatingBadge";

function ListingCard({ listing, user, onSelectForChatOrCalc }) {
  const [expanded, setExpanded] = useState(false);
  const [fullDetails, setFullDetails] = useState(null);
  const [isFavorited, setIsFavorited] = useState(
    listing.favoritedBy.includes(user.username)
  );
  const [favoriteCount, setFavoriteCount] = useState(listing.favoritedBy.length);

  const pricePerSqft = Math.round(listing.price / listing.sqft);

  const handleToggleDetails = async () => {
    if (!expanded && !fullDetails) {
      const res = await getListingById(listing._id);
      setFullDetails(res.data);
    }
    setExpanded(!expanded);
    onSelectForChatOrCalc(listing);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    const res = await toggleFavorite(listing._id, user.username);
    setIsFavorited(res.data.favoritedBy.includes(user.username));
    setFavoriteCount(res.data.favoritedBy.length);
  };

  return (
    <div className="listing-card">
      <div className="card-image-wrap">
        <img src={listing.image} alt={listing.title} />
        <span className={`status-badge status-${listing.status.replace(" ", "-").toLowerCase()}`}>
          {listing.status}
        </span>
        <button
          className={isFavorited ? "favorite-btn active" : "favorite-btn"}
          onClick={handleFavoriteClick}
          title="Save to favorites"
        >
          {isFavorited ? "♥" : "♡"} {favoriteCount > 0 && favoriteCount}
        </button>
      </div>

      <div className="card-body">
        <p className="price">
          ${listing.price.toLocaleString()}
          <span className="price-per-sqft"> (${pricePerSqft}/sqft)</span>
        </p>
        <h3>{listing.title}</h3>
        <p className="card-location">{listing.location}</p>
        <p className="card-meta">
          {listing.beds} bd &middot; {listing.baths} ba &middot; {listing.sqft} sqft &middot;{" "}
          {listing.propertyType}
        </p>

        <button className="btn-secondary view-details-btn" onClick={handleToggleDetails}>
          {expanded ? "Hide Details" : "View Details"}
        </button>

        {expanded && (
          <div className="details">
            <p>{listing.description}</p>
            <p className="built-year">Built in {listing.yearBuilt}</p>
            {fullDetails?.schoolRatings && (
              <SchoolRatingBadge schoolRatings={fullDetails.schoolRatings} />
            )}
            <p className="agent-note">Listed by agent: {listing.agentUsername}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingCard;
