import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm/SearchForm";
import ResultsList from "./components/ResultsList/ResultsList";
import SavedStats from "./components/SavedStats/SavedStats";
import TripJournal from "./components/TripJournal/TripJournal";
import FlightMapBackground from "./components/FlightMapBackground/FlightMapBackground";
import "./App.css";

const BASE_URL = "https://api.aviationstack.com/v1/flights";
const FLIGHTS_STORAGE_KEY = "savedFlights";
const TRIPS_STORAGE_KEY = "savedTrips";
const DEFAULT_TRIP_ID = "trip-open-sky";
const CREATOR_NAME = "Roei Baram";

function createDefaultTrip() {
  return {
    id: DEFAULT_TRIP_ID,
    name: "Open Sky",
    location: "Unassigned Flights",
    startDate: "",
    endDate: "",
    note: "Flights you have not assigned to a trip yet.",
    coverPhoto: "",
    photos: [],
  };
}

function normalizeTrip(rawTrip, fallbackId) {
  if (!rawTrip || typeof rawTrip !== "object") return null;

  const id =
    typeof rawTrip.id === "string" && rawTrip.id.trim()
      ? rawTrip.id.trim()
      : fallbackId;
  const name =
    typeof rawTrip.name === "string" && rawTrip.name.trim()
      ? rawTrip.name.trim()
      : "Untitled Trip";

  return {
    id,
    name,
    location:
      typeof rawTrip.location === "string" ? rawTrip.location.trim() : "",
    startDate:
      typeof rawTrip.startDate === "string" ? rawTrip.startDate : "",
    endDate: typeof rawTrip.endDate === "string" ? rawTrip.endDate : "",
    note: typeof rawTrip.note === "string" ? rawTrip.note.trim() : "",
    coverPhoto:
      typeof rawTrip.coverPhoto === "string" ? rawTrip.coverPhoto : "",
    photos: Array.isArray(rawTrip.photos)
      ? rawTrip.photos.filter((photo) => typeof photo === "string" && photo)
      : [],
  };
}

function normalizeTrips(inputTrips) {
  if (!Array.isArray(inputTrips)) return [createDefaultTrip()];

  const normalized = inputTrips
    .map((trip, index) => normalizeTrip(trip, `trip-${Date.now()}-${index}`))
    .filter((trip) => Boolean(trip));

  if (!normalized.length) return [createDefaultTrip()];
  if (normalized.some((trip) => trip.id === DEFAULT_TRIP_ID)) return normalized;

  return [createDefaultTrip(), ...normalized];
}

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
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    const storedFlights = localStorage.getItem(FLIGHTS_STORAGE_KEY);

    let parsedTrips = [createDefaultTrip()];
    if (storedTrips) {
      try {
        parsedTrips = normalizeTrips(JSON.parse(storedTrips));
      } catch {
        parsedTrips = [createDefaultTrip()];
      }
    }
    setTrips(parsedTrips);

    if (!storedFlights) return;

    try {
      const parsedFlights = JSON.parse(storedFlights);
      if (Array.isArray(parsedFlights)) {
        const tripIds = new Set(parsedTrips.map((trip) => trip.id));
        setSavedFlights(
          parsedFlights.map((flight) => {
            const tripId = tripIds.has(flight?.tripId)
              ? flight.tripId
              : DEFAULT_TRIP_ID;
            return { ...flight, tripId };
          })
        );
      }
    } catch {
      localStorage.removeItem(FLIGHTS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FLIGHTS_STORAGE_KEY, JSON.stringify(savedFlights));
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
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

    const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY;
    if (!apiKey) {
      setError("Missing API key. Add VITE_AVIATIONSTACK_KEY in your .env file.");
      setResults([]);
      setHasSearched(true);
      return;
    }

    const url = `${BASE_URL}?access_key=${apiKey}&dep_iata=${from}&arr_iata=${to}`;

    setError("");
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Search failed. Try again in a moment.");
      }

      const data = await response.json();
      if (!Array.isArray(data.data)) {
        throw new Error("Unexpected API response.");
      }

      const flights = data.data
        .map((flight, index) => {
          const flightNumber = flight.flight?.iata || "";
          const airline = flight.airline?.name || "";
          const depIata = flight.departure?.iata || "";
          const arrIata = flight.arrival?.iata || "";

          const depTime =
            flight.departure?.scheduled || flight.departure?.estimated || "";
          const arrTime =
            flight.arrival?.scheduled || flight.arrival?.estimated || "";

          const aircraft =
            flight.aircraft?.iata ||
            flight.aircraft?.icao ||
            flight.airplane?.iata ||
            flight.airplane?.icao ||
            "";

          return {
            id: `${flightNumber}-${depIata}-${arrIata}-${depTime || date || index}`,
            airline,
            flightNumber,
            from: depIata,
            to: arrIata,
            date: date || "",
            depTime,
            arrTime,
            aircraft,
          };
        })
        .filter((flight) => !date || flight.depTime?.slice(0, 10) === date);

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

  function handleCreateTrip(tripInput) {
    const id = `trip-${Date.now()}`;
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

  const uniqueRouteCount = new Set(
    savedFlights.map((flight) => `${flight.from || "UNK"}-${flight.to || "UNK"}`)
  ).size;
  const recentRoutes = savedFlights.slice(0, 9);

  return (
    <div className={`app ${viewMode === "map" ? "app--map-focus" : ""}`}>
      <FlightMapBackground
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
              <SavedStats flights={savedFlights} />
              <TripJournal
                trips={trips}
                flights={savedFlights}
                onCreateTrip={handleCreateTrip}
                onSetTripCover={handleSetTripCover}
                onAddTripPhotos={handleAddTripPhotos}
                onRemoveTripPhoto={handleRemoveTripPhoto}
                onRemoveFlight={handleRemove}
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
