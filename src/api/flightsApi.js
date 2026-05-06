import { AVIATION_BASE_URL } from "../constants/app";

function mapFlight(item, date, index) {
  const flightNumber = item.flight?.iata || "";
  const airline = item.airline?.name || "";
  const from = item.departure?.iata || "";
  const to = item.arrival?.iata || "";
  const depTime = item.departure?.scheduled || item.departure?.estimated || "";
  const arrTime = item.arrival?.scheduled || item.arrival?.estimated || "";
  const aircraft =
    item.aircraft?.iata ||
    item.aircraft?.icao ||
    item.airplane?.iata ||
    item.airplane?.icao ||
    "";

  return {
    id: `${flightNumber}-${from}-${to}-${depTime || date || index}`,
    airline,
    flightNumber,
    from,
    to,
    date: date || "",
    depTime,
    arrTime,
    aircraft,
  };
}

export async function searchFlights({ from, to, date }) {
  const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY;

  if (!apiKey) {
    throw new Error("Missing API key. Add VITE_AVIATIONSTACK_KEY in your .env file.");
  }

  const url = `${AVIATION_BASE_URL}?access_key=${apiKey}&dep_iata=${from}&arr_iata=${to}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Search failed. Try again in a moment.");
  }

  const data = await response.json();

  if (!Array.isArray(data.data)) {
    throw new Error("Unexpected API response.");
  }

  return data.data
    .map((item, index) => mapFlight(item, date, index))
    .filter((flight) => !date || flight.depTime?.slice(0, 10) === date);
}
