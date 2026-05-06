import {
  DEFAULT_TRIP_ID,
  SAVED_FLIGHTS_KEY,
  SAVED_TRIPS_KEY,
} from "../constants/app";
import { createDefaultTrip, normalizeTrips } from "./trips";

export function readSavedJournal() {
  const storedTrips = localStorage.getItem(SAVED_TRIPS_KEY);
  const storedFlights = localStorage.getItem(SAVED_FLIGHTS_KEY);

  let trips = [createDefaultTrip()];

  if (storedTrips) {
    try {
      trips = normalizeTrips(JSON.parse(storedTrips));
    } catch {
      trips = [createDefaultTrip()];
    }
  }

  if (!storedFlights) {
    return { trips, savedFlights: [] };
  }

  try {
    const parsedFlights = JSON.parse(storedFlights);

    if (!Array.isArray(parsedFlights)) {
      return { trips, savedFlights: [] };
    }

    const tripIds = new Set(trips.map((trip) => trip.id));
    const savedFlights = parsedFlights.map((flight) => {
      const tripId = tripIds.has(flight?.tripId)
        ? flight.tripId
        : DEFAULT_TRIP_ID;

      return { ...flight, tripId };
    });

    return { trips, savedFlights };
  } catch {
    localStorage.removeItem(SAVED_FLIGHTS_KEY);
    return { trips, savedFlights: [] };
  }
}

export function saveJournal({ savedFlights, trips }) {
  localStorage.setItem(SAVED_FLIGHTS_KEY, JSON.stringify(savedFlights));
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
}
