import { useState } from "react";
import { getAirlineLogo } from "../../utils/airlineLogos";
import "./ResultsList.css";

function ResultsList({ flights, trips, onSave }) {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || "");
  const activeTripId = trips.some((trip) => trip.id === selectedTripId)
    ? selectedTripId
    : trips[0]?.id || "";

  if (!flights.length) return null;

  return (
    <div className="results-wrap">
      <div className="results__toolbar">
        <label className="results__toolbar-label" htmlFor="trip-select">
          Save flights to trip
        </label>
        <select
          id="trip-select"
          className="results__toolbar-select"
          value={activeTripId}
          onChange={(event) => setSelectedTripId(event.target.value)}
        >
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="results">
        {flights.map((flight) => {
          const logo = getAirlineLogo(flight.airline);

          return (
            <li className="results__item" key={flight.id}>
              <div className="results__main">
                {logo ? (
                  <img
                    className="results__logo"
                    src={logo}
                    alt={flight.airline}
                  />
                ) : (
                  <div className="results__logo results__logo_placeholder" />
                )}

                <div className="results__text">
                  <div className="results__line">
                    <span className="results__flight">
                      {flight.airline} {flight.flightNumber}
                    </span>
                    <span className="results__route">
                      {flight.from} → {flight.to}
                    </span>
                  </div>

                  <div className="results__meta">
                    {flight.date ? <span>{flight.date}</span> : null}
                    {flight.depTime ? <span>Dep: {flight.depTime}</span> : null}
                    {flight.arrTime ? <span>Arr: {flight.arrTime}</span> : null}
                    {flight.aircraft ? (
                      <span>Aircraft: {flight.aircraft}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                className="results__btn"
                type="button"
                onClick={() => onSave(flight, activeTripId)}
                disabled={!activeTripId}
              >
                Save to Trip
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ResultsList;
