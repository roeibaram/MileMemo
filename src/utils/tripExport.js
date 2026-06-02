import { formatMiles, getFlightDistanceMiles } from "./flights";

function sanitizeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function downloadTripSummary(trip) {
  const lines = [
    "MileMemo Trip Summary",
    "",
    `Trip: ${trip.name}`,
    `Location: ${trip.location || "Not set"}`,
    `Dates: ${trip.startDate || "No start"} to ${trip.endDate || "No end"}`,
    `Flights: ${trip.flights.length}`,
    `Miles: ${formatMiles(trip.miles)}`,
    `Photos: ${trip.photos.length}`,
    "",
    "Note:",
    trip.note || "No trip note yet.",
    "",
    "Flights:",
  ];

  if (!trip.flights.length) {
    lines.push("No saved flights in this trip yet.");
  }

  trip.flights.forEach((flight, index) => {
    const miles = getFlightDistanceMiles(flight);

    lines.push(
      "",
      `${String(index + 1).padStart(2, "0")}. ${flight.from} to ${flight.to}`,
      `Airline: ${flight.airline || "Unknown airline"}`,
      `Flight: ${flight.flightNumber || "Not logged"}`,
      `Date: ${flight.date || "Not logged"}`,
      `Distance: ${miles !== null ? formatMiles(miles) : "Unavailable"}`
    );
  });

  const blob = new Blob([`${lines.join("\n")}\n`], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${sanitizeFileName(trip.name) || "milememo-trip"}-summary.txt`;
  link.click();

  URL.revokeObjectURL(url);
}
