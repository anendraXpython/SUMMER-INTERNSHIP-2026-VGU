import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet-draw";
import "leaflet.heat";
import { getListings } from "../api/api";

// Standard ray-casting point-in-polygon check. `point` is [lat, lng] and
// `polygon` is an array of [lat, lng] pairs forming the drawn shape.
function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersects =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersects) inside = !inside;
  }

  return inside;
}

function MapSection() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const drawnItemsRef = useRef(null);

  const [allListings, setAllListings] = useState([]);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [drawResults, setDrawResults] = useState(null);

  // fetch every listing (not just the current page of the Listings section)
  // so the map always shows the full inventory
  useEffect(() => {
    getListings({ limit: 200 }).then((res) => setAllListings(res.data.listings));
  }, []);

  // set up the map once
  useEffect(() => {
    const map = L.map(mapContainerRef.current).setView([26.92, 75.79], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup();
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    // draw-to-search setup: a layer to hold whatever polygon the user draws,
    // plus the Leaflet.draw toolbar restricted to polygons only
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        marker: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        polyline: false,
      },
      edit: { featureGroup: drawnItems, remove: true },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(event.layer);

      const polygonPoints = event.layer
        .getLatLngs()[0]
        .map((latlng) => [latlng.lat, latlng.lng]);

      // this reads the LATEST listings via a value stashed on the map
      // instance itself, kept up to date by the effect below
      const listingsNow = map._nestlyListings || [];
      const matches = listingsNow.filter((listing) =>
        isPointInPolygon([listing.lat, listing.lng], polygonPoints)
      );
      setDrawResults(matches);
    });

    map.on(L.Draw.Event.DELETED, () => {
      setDrawResults(null);
    });

    return () => {
      map.remove();
    };
  }, []);

  // whenever listings load/change, redraw markers + keep a live reference
  // for the draw-to-search handler above to read from
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    mapRef.current._nestlyListings = allListings;
    clusterGroupRef.current.clearLayers();

    allListings.forEach((listing) => {
      const marker = L.marker([listing.lat, listing.lng]);
      marker.bindPopup(
        `<b>${listing.title}</b><br>$${listing.price.toLocaleString()}<br>${listing.location}`
      );
      clusterGroupRef.current.addLayer(marker);
    });
  }, [allListings]);

  // heatmap toggle -- weight each point by its price so expensive areas glow hotter
  useEffect(() => {
    if (!mapRef.current) return;

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (heatmapOn && allListings.length > 0) {
      const maxPrice = Math.max(...allListings.map((l) => l.price));
      const heatPoints = allListings.map((listing) => [
        listing.lat,
        listing.lng,
        listing.price / maxPrice,
      ]);
      heatLayerRef.current = L.heatLayer(heatPoints, { radius: 35, blur: 25 });
      heatLayerRef.current.addTo(mapRef.current);
    }
  }, [heatmapOn, allListings]);

  const clearDrawing = () => {
    if (drawnItemsRef.current) drawnItemsRef.current.clearLayers();
    setDrawResults(null);
  };

  return (
    <section id="map">
      <h2>Map Search</h2>
      <p>
        Real map, plotted from each listing's stored latitude/longitude. Markers cluster as you
        zoom out, use the polygon tool (top-right of the map) to draw-to-search an area, and
        toggle the price heatmap below.
      </p>

      <div className="map-toolbar">
        <button className="btn-secondary" onClick={() => setHeatmapOn(!heatmapOn)}>
          {heatmapOn ? "Hide" : "Show"} price heatmap
        </button>
        {drawResults && (
          <button className="btn-secondary" onClick={clearDrawing}>
            Clear drawn area
          </button>
        )}
      </div>

      <div id="mapContainer" ref={mapContainerRef} className="map-container"></div>

      {drawResults && (
        <div className="draw-results">
          <h4>{drawResults.length} properties inside your drawn area</h4>
          <ul>
            {drawResults.map((listing) => (
              <li key={listing._id}>
                {listing.title} — ${listing.price.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default MapSection;
