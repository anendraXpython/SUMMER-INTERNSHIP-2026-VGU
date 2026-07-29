import { useState, useEffect, useCallback } from "react";
import { getListings, getListingLocations } from "../api/api";
import ListingCard from "./ListingCard";

function ListingsSection({ user, onSelectForChatOrCalc }) {
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getListings({
        location: location || undefined,
        maxPrice: maxPrice || undefined,
        beds: beds || undefined,
        propertyType: propertyType || undefined,
        sortBy,
        page,
        limit: 6,
      });
      setListings(res.data.listings);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      setListings([]);
    }
    setIsLoading(false);
  }, [location, maxPrice, beds, propertyType, sortBy, page]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    getListingLocations().then((res) => setLocations(res.data));
  }, []);

  // if we're already on page 1, changing the filters won't change `page`,
  // so loadListings() (which already reruns on filter changes via the
  // useEffect above) needs an explicit nudge here too for that case
  const runSearch = () => {
    if (page === 1) {
      loadListings();
    } else {
      setPage(1);
    }
  };

  const handleReset = () => {
    setLocation("");
    setMaxPrice("");
    setBeds("");
    setPropertyType("");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <>
      <section className="hero">
        <h2>Find your next home</h2>
        <p>Search live listings pulled straight from MongoDB, with real filters and sorting.</p>

        <div className="search-box">
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="">Any beds</option>
            <option value="1">1+ bed</option>
            <option value="2">2+ beds</option>
            <option value="3">3+ beds</option>
            <option value="4">4+ beds</option>
          </select>

          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Any type</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button className="btn-primary" onClick={runSearch}>
            Search
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </section>

      <section id="listings">
        <h2>Available Properties</h2>
        <p className="result-text">
          {isLoading ? "Loading listings..." : `${totalCount} properties found`}
        </p>

        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              user={user}
              onSelectForChatOrCalc={onSelectForChatOrCalc}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default ListingsSection;
