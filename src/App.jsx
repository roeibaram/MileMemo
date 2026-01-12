import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm/SearchForm";
import ResultsList from "./components/ResultsList/ResultsList";
import SavedList from "./components/SavedList/SavedList";
import "./App.css";

const BASE_URL = "https://api.aviationstack.com/v1/flights";

function App() {
  const [results, setResults] = useState([]);
  const [savedFlights, setSavedFlights] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("savedFlights");
    if (stored) setSavedFlights(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("savedFlights", JSON.stringify(savedFlights));
  }, [savedFlights]);

  async function handleSearch(from, to, date) {
    const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY;
    const url = `${BASE_URL}?access_key=${apiKey}&dep_iata=${from}&arr_iata=${to}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      setResults([]);
      return;
    }

    const flights = data.data.map((flight, index) => {
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
        id: `${flightNumber}-${depIata}-${arrIata}-${index}`,
        airline,
        flightNumber,
        from: depIata,
        to: arrIata,
        date: date || "",
        depTime,
        arrTime,
        aircraft,
      };
    });

    setResults(flights);
  }

  function handleSave(flight) {
    setSavedFlights((prev) => {
      const exists = prev.some((f) => f.id === flight.id);
      if (exists) return prev;
      return [flight, ...prev];
    });
  }

  function handleRemove(id) {
    setSavedFlights((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="app">
      <div className="app__wrap">
        <header className="app__header">
          <h1 className="app__title">MileMemo</h1>
          <p className="app__subtitle">
            Save flights. Build your travel history.
          </p>
        </header>

        <div className="app__grid">
          <div className="app__panel app__panel--strong">
            <SearchForm onSearch={handleSearch} />

            <h2 className="app__panel-title">Results</h2>
            {results.length ? (
              <ResultsList flights={results} onSave={handleSave} />
            ) : (
              <p className="app__empty">
                Search by route + date to see flights.
              </p>
            )}
          </div>

          <div className="app__panel">
            <h2 className="app__panel-title">Saved</h2>
            {savedFlights.length ? (
              <SavedList flights={savedFlights} onRemove={handleRemove} />
            ) : (
              <p className="app__empty">Saved flights will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
