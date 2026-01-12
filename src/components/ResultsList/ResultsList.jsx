import { getAirlineLogo } from "../../utils/airlineLogos";
import "./ResultsList.css";

function ResultsList({ flights, onSave }) {
  if (!flights.length) return null;

  return (
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

            <button className="results__btn" onClick={() => onSave(flight)}>
              Save
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ResultsList;
