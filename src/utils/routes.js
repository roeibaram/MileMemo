import { RECENT_ROUTE_LIMIT } from "../constants/app";
import { getAirportCoordinates } from "./airports";

export function buildRouteSegments(flights) {
  return flights
    .map((flight) => {
      const from = getAirportCoordinates(flight.from);
      const to = getAirportCoordinates(flight.to);

      if (!from || !to) {
        return null;
      }

      return {
        id: flight.id,
        from,
        to,
      };
    })
    .filter(Boolean);
}

export function getUniqueRouteCount(flights) {
  return new Set(
    flights.map((flight) => `${flight.from || "UNK"}-${flight.to || "UNK"}`)
  ).size;
}

export function getRecentRoutes(flights, limit = RECENT_ROUTE_LIMIT) {
  return flights.slice(0, limit);
}
