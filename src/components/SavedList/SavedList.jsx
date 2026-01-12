import { useState } from "react";
import { getAirlineLogo } from "../../utils/airlineLogos";
import "./SavedList.css";

function SavedList({ flights, onRemove }) {
  const [activeId, setActiveId] = useState("");

  if (!flights.length) return null;

  function toggle(id) {
    setActiveId((prev) => (prev === id ? "" : id));
  }

  return (
    <ul className="saved">
      {flights.map((flight) => {
        const isActive = activeId === flight.id;
        const logo = getAirlineLogo(flight.airline);

        return (
          <li className="saved__item" key={flight.id}>
            <button
              className="saved__row"
              type="button"
              onClick={() => toggle(flight.id)}
            >
              <span className="saved__title">
                {flight.flightNumber} — {flight.from} → {flight.to}
              </span>
              <span className="saved__airline">{flight.airline}</span>
            </button>

            {isActive ? (
              <div className="saved__details">
                <div className="saved__details-top">
                  {logo ? (
                    <img
                      className="saved__logo"
                      src={logo}
                      alt={flight.airline}
                    />
                  ) : null}
                  <div className="saved__details-text">
                    {flight.date ? <div>Date: {flight.date}</div> : null}
                    {flight.depTime ? <div>Dep: {flight.depTime}</div> : null}
                    {flight.arrTime ? <div>Arr: {flight.arrTime}</div> : null}
                    {flight.aircraft ? (
                      <div>Aircraft: {flight.aircraft}</div>
                    ) : null}
                  </div>
                </div>

                <button
                  className="saved__remove"
                  onClick={() => onRemove(flight.id)}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default SavedList;
