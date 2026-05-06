import { DEFAULT_TRIP_ID } from "../constants/app";
import { getFlightDistanceMiles } from "./flights";

export function createDefaultTrip() {
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

export function createTripId() {
  return `trip-${Date.now()}`;
}

export function normalizeTrip(rawTrip, fallbackId) {
  if (!rawTrip || typeof rawTrip !== "object") {
    return null;
  }

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
    startDate: typeof rawTrip.startDate === "string" ? rawTrip.startDate : "",
    endDate: typeof rawTrip.endDate === "string" ? rawTrip.endDate : "",
    note: typeof rawTrip.note === "string" ? rawTrip.note.trim() : "",
    coverPhoto: typeof rawTrip.coverPhoto === "string" ? rawTrip.coverPhoto : "",
    photos: Array.isArray(rawTrip.photos)
      ? rawTrip.photos.filter((photo) => typeof photo === "string" && photo)
      : [],
  };
}

export function normalizeTrips(inputTrips) {
  if (!Array.isArray(inputTrips)) {
    return [createDefaultTrip()];
  }

  const trips = inputTrips
    .map((trip, index) => normalizeTrip(trip, `trip-${Date.now()}-${index}`))
    .filter(Boolean);

  if (!trips.length) {
    return [createDefaultTrip()];
  }

  if (trips.some((trip) => trip.id === DEFAULT_TRIP_ID)) {
    return trips;
  }

  return [createDefaultTrip(), ...trips];
}

export function buildTripCards(trips, flights) {
  return trips.map((trip) => {
    const tripFlights = flights.filter((flight) => flight.tripId === trip.id);
    const miles = tripFlights.reduce((total, flight) => {
      const distance = getFlightDistanceMiles(flight);
      return distance === null ? total : total + distance;
    }, 0);

    return {
      ...trip,
      flights: tripFlights,
      miles,
    };
  });
}
