import { useMemo } from "react";
import { formatMiles, getFlightDistanceMiles } from "../../utils/flightDistance";
import "./SavedStats.css";

function SavedStats({ flights }) {
  const stats = useMemo(() => {
    const totalFlights = flights.length;
    const uniqueAirlines = new Set(
      flights
        .map((flight) => flight.airline?.trim())
        .filter((airline) => Boolean(airline))
    ).size;

    let knownDistanceFlights = 0;
    let totalMiles = 0;

    flights.forEach((flight) => {
      const distance = getFlightDistanceMiles(flight);
      if (distance === null) return;
      knownDistanceFlights += 1;
      totalMiles += distance;
    });

    return {
      totalFlights,
      uniqueAirlines,
      knownDistanceFlights,
      unknownDistanceFlights: totalFlights - knownDistanceFlights,
      totalMiles,
    };
  }, [flights]);

  return (
    <section className="stats" aria-label="Saved flight totals">
      <div className="stats__cards">
        <article className="stats__card">
          <h3 className="stats__label">Total flights</h3>
          <p className="stats__value">{stats.totalFlights}</p>
        </article>

        <article className="stats__card">
          <h3 className="stats__label">Estimated miles</h3>
          <p className="stats__value">{formatMiles(stats.totalMiles)}</p>
        </article>

        <article className="stats__card">
          <h3 className="stats__label">Airlines flown</h3>
          <p className="stats__value">{stats.uniqueAirlines}</p>
        </article>
      </div>

      {stats.unknownDistanceFlights ? (
        <p className="stats__note">
          Mileage is currently available for {stats.knownDistanceFlights} of{" "}
          {stats.totalFlights} saved flights.
        </p>
      ) : null}
    </section>
  );
}

export default SavedStats;
