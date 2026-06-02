import { useState, useEffect } from "react";
import { searchFlights } from "./api/flightsApi";
import {
  CREATOR_NAME,
  DEFAULT_TRIP_ID,
} from "./constants/app";
import RouteMap from "./components/RouteMap/RouteMap";
import SearchForm from "./components/SearchForm/SearchForm";
import ResultsList from "./components/ResultsList/ResultsList";
import StatsBar from "./components/StatsBar/StatsBar";
import TripJournal from "./components/TripJournal/TripJournal";
import { getRecentRoutes, getUniqueRouteCount } from "./utils/routes";
import { readSavedJournal, saveJournal } from "./utils/storage";
import {
  createDefaultTrip,
  createTripId,
  normalizeTrip,
} from "./utils/trips";
import "./App.css";

function App() {
  const [results, setResults] = useState([]);
  const [savedFlights, setSavedFlights] = useState([]);
  const [trips, setTrips] = useState([createDefaultTrip()]);
  const [viewMode, setViewMode] = useState("journal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  function updateTripById(tripId, updater) {
    setTrips((prev) =>
      prev.map((trip) => (trip.id === tripId ? updater(trip) : trip))
    );
  }

  useEffect(() => {
    const savedJournal = readSavedJournal();
    setTrips(savedJournal.trips);
    setSavedFlights(savedJournal.savedFlights);
  }, []);

  useEffect(() => {
    try {
      saveJournal({ savedFlights, trips });
      setStorageError("");
    } catch {
      setStorageError(
        "Storage is full. Remove some trip photos or flights to keep saving new data."
      );
    }
  }, [savedFlights, trips]);

  async function handleSearch(from, to, date) {
    if (from.length !== 3 || to.length !== 3) {
      setError("Use 3-letter IATA airport codes (example: TLV, JFK).");
      setResults([]);
      setHasSearched(true);
      return;
    }

    setError("");
    setIsLoading(true);
    setHasSearched(true);

    try {
      const flights = await searchFlights({ from, to, date });
      setResults(flights);
    } catch (searchError) {
      setResults([]);
      setError(searchError.message || "Something went wrong while searching.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSave(flight, requestedTripId) {
    setSavedFlights((prev) => {
      const isValidTrip = trips.some((trip) => trip.id === requestedTripId);
      const tripId = isValidTrip ? requestedTripId : DEFAULT_TRIP_ID;
      const existingIndex = prev.findIndex((f) => f.id === flight.id);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], tripId };
        return next;
      }

      return [{ ...flight, tripId }, ...prev];
    });
  }

  function handleRemove(id) {
    setSavedFlights((prev) => prev.filter((f) => f.id !== id));
  }

  function handleMoveFlight(flightId, requestedTripId) {
    const isValidTrip = trips.some((trip) => trip.id === requestedTripId);
    const tripId = isValidTrip ? requestedTripId : DEFAULT_TRIP_ID;

    setSavedFlights((prev) =>
      prev.map((flight) =>
        flight.id === flightId ? { ...flight, tripId } : flight
      )
    );
  }

  function handleCreateTrip(tripInput) {
    const id = createTripId();
    const nextTrip = normalizeTrip({ ...tripInput, id, photos: [] }, id);
    if (!nextTrip) return;
    setTrips((prev) => [nextTrip, ...prev]);
  }

  function handleSetTripCover(tripId, coverPhoto) {
    updateTripById(tripId, (trip) => ({ ...trip, coverPhoto }));
  }

  function handleAddTripPhotos(tripId, newPhotos) {
    updateTripById(tripId, (trip) => ({
      ...trip,
      photos: [...trip.photos, ...newPhotos].slice(-18),
    }));
  }

  function handleRemoveTripPhoto(tripId, photoIndex) {
    updateTripById(tripId, (trip) => ({
      ...trip,
      photos: trip.photos.filter((_, index) => index !== photoIndex),
    }));
  }

  const uniqueRouteCount = getUniqueRouteCount(savedFlights);
  const recentRoutes = getRecentRoutes(savedFlights);

  return (
    <div className={`app ${viewMode === "map" ? "app--map-focus" : ""}`}>
      <RouteMap
        key={viewMode}
        flights={savedFlights}
        mode={viewMode === "map" ? "focus" : "ambient"}
      />
      <div className="app__wrap">
        <header className="app__header">
          <p className="app__eyebrow">Personal Flight Journal</p>
          <h1 className="app__title">MileMemo Logbook</h1>
          <p className="app__subtitle">
            Build a visual record of your routes, trips, and miles over time.
          </p>
          <div className="app__view-switch" role="tablist" aria-label="View mode">
            <button
              className={`app__view-btn ${viewMode === "journal" ? "app__view-btn--active" : ""}`}
              type="button"
              onClick={() => setViewMode("journal")}
              role="tab"
              aria-selected={viewMode === "journal"}
            >
              Journal View
            </button>
            <button
              className={`app__view-btn ${viewMode === "map" ? "app__view-btn--active" : ""}`}
              type="button"
              onClick={() => setViewMode("map")}
              role="tab"
              aria-selected={viewMode === "map"}
            >
              Map View
            </button>
          </div>
          {storageError ? (
            <p className="app__storage-warning">{storageError}</p>
          ) : null}
        </header>

        {viewMode === "journal" ? (
          <div className="app__grid">
            <div className="app__panel app__panel--strong">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />

              <h2 className="app__panel-title">Results</h2>
              {error ? (
                <p className="app__empty app__empty--error">{error}</p>
              ) : isLoading ? (
                <p className="app__empty">Searching flights...</p>
              ) : results.length ? (
                <ResultsList flights={results} trips={trips} onSave={handleSave} />
              ) : hasSearched ? (
                <p className="app__empty">No flights found for this route/date.</p>
              ) : (
                <p className="app__empty">Search by route + date to see flights.</p>
              )}
            </div>

            <div className="app__panel">
              <h2 className="app__panel-title">Trip Journal</h2>
              <StatsBar flights={savedFlights} />
              <TripJournal
                trips={trips}
                flights={savedFlights}
                onCreateTrip={handleCreateTrip}
                onSetTripCover={handleSetTripCover}
                onAddTripPhotos={handleAddTripPhotos}
                onRemoveTripPhoto={handleRemoveTripPhoto}
                onRemoveFlight={handleRemove}
                onMoveFlight={handleMoveFlight}
              />
            </div>
          </div>
        ) : (
          <section className="app__map-mode">
            <article className="app__map-card">
              <h2 className="app__panel-title">Live Route Map</h2>
              <p className="app__map-text">
                Pan and zoom the map to inspect your saved routes in detail.
              </p>
              <div className="app__map-kpis">
                <div>
                  <span className="app__map-kpi-label">Saved flights</span>
                  <strong>{savedFlights.length}</strong>
                </div>
                <div>
                  <span className="app__map-kpi-label">Unique routes</span>
                  <strong>{uniqueRouteCount}</strong>
                </div>
              </div>

              {recentRoutes.length ? (
                <ul className="app__map-list">
                  {recentRoutes.map((flight) => (
                    <li key={flight.id} className="app__map-list-item">
                      <span>
                        {flight.from} to {flight.to}
                      </span>
                      <span>{flight.airline || "Unknown airline"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="app__map-text">
                  Save flights in Journal View to populate map routes.
                </p>
              )}
            </article>
          </section>
        )}

        <footer className="app__footer">
          <p className="app__footer-main">Built by {CREATOR_NAME}</p>
          <p className="app__footer-sub">MileMemo - Personal Flight Journal</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
