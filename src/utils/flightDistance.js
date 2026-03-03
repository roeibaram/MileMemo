import { getAirportCoordinates } from "./airportCoordinates";

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function getRouteDistanceMiles(fromIata, toIata) {
  const from = getAirportCoordinates(fromIata);
  const to = getAirportCoordinates(toIata);

  if (!from || !to) return null;
  if (fromIata?.toUpperCase() === toIata?.toUpperCase()) return 0;

  const [fromLat, fromLon] = from;
  const [toLat, toLon] = to;

  const deltaLat = toRadians(toLat - fromLat);
  const deltaLon = toRadians(toLon - fromLon);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_MILES * c);
}

export function getFlightDistanceMiles(flight) {
  if (!flight) return null;
  return getRouteDistanceMiles(flight.from, flight.to);
}

export function formatMiles(value) {
  return new Intl.NumberFormat("en-US").format(value);
}
