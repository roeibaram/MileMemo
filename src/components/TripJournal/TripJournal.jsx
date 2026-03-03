import { useMemo, useState } from "react";
import { formatMiles, getFlightDistanceMiles } from "../../utils/flightDistance";
import "./TripJournal.css";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

function formatTripDates(startDate, endDate) {
  if (!startDate && !endDate) return "No dates yet";
  if (startDate && endDate) return `${startDate} to ${endDate}`;
  return startDate || endDate;
}

function TripJournal({
  trips,
  flights,
  onCreateTrip,
  onSetTripCover,
  onAddTripPhotos,
  onRemoveTripPhoto,
  onRemoveFlight,
}) {
  const [tripName, setTripName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const groupedFlights = useMemo(() => {
    return trips.map((trip) => {
      const tripFlights = flights.filter((flight) => flight.tripId === trip.id);
      const tripMiles = tripFlights.reduce((total, flight) => {
        const miles = getFlightDistanceMiles(flight);
        return miles === null ? total : total + miles;
      }, 0);

      return {
        ...trip,
        flights: tripFlights,
        miles: tripMiles,
      };
    });
  }, [trips, flights]);

  function handleCreateTrip(event) {
    event.preventDefault();
    if (!tripName.trim()) {
      setFormError("Trip name is required.");
      return;
    }

    onCreateTrip({
      name: tripName,
      location,
      startDate,
      endDate,
      note,
    });

    setTripName("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setNote("");
    setFormError("");
  }

  async function handleCoverUpload(tripId, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imageData = await readFileAsDataUrl(file);
      if (imageData) onSetTripCover(tripId, imageData);
    } catch {
      setFormError("Could not upload that image.");
    }
  }

  async function handlePhotosUpload(tripId, event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    try {
      const photos = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      onAddTripPhotos(
        tripId,
        photos.filter((photo) => Boolean(photo))
      );
    } catch {
      setFormError("Some images could not be uploaded.");
    }
  }

  return (
    <div className="journal">
      <form className="trip-form" onSubmit={handleCreateTrip}>
        <h3 className="trip-form__title">Create a trip</h3>

        <div className="trip-form__grid">
          <input
            className="trip-form__input"
            value={tripName}
            onChange={(event) => setTripName(event.target.value)}
            placeholder="Trip name (example: Winter in New York)"
            required
          />
          <input
            className="trip-form__input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Destination / location"
          />
          <input
            className="trip-form__input"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            className="trip-form__input"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <textarea
          className="trip-form__input trip-form__input--textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Trip note (memory, context, why this trip mattered)"
        />

        {formError ? <p className="trip-form__error">{formError}</p> : null}

        <button className="trip-form__btn" type="submit">
          Add Trip
        </button>
      </form>

      <div className="journal__list">
        {groupedFlights.map((trip, index) => (
          <article
            className="trip-card"
            key={trip.id}
            style={{ animationDelay: `${Math.min(index * 0.08, 0.36)}s` }}
          >
            <div className="trip-card__hero">
              {trip.coverPhoto ? (
                <img className="trip-card__cover" src={trip.coverPhoto} alt={trip.name} />
              ) : (
                <div className="trip-card__cover trip-card__cover--empty">
                  Add a cover photo
                </div>
              )}
              <div className="trip-card__overlay">
                <h3 className="trip-card__name">{trip.name}</h3>
                <p className="trip-card__meta">{trip.location || "No location set"}</p>
              </div>
            </div>

            <div className="trip-card__body">
              <div className="trip-card__chips">
                <span>{formatTripDates(trip.startDate, trip.endDate)}</span>
                <span>{trip.flights.length} flights</span>
                <span>{formatMiles(trip.miles)} miles</span>
              </div>

              {trip.note ? <p className="trip-card__note">{trip.note}</p> : null}

              <div className="trip-card__actions">
                <label className="trip-card__upload">
                  Set Profile Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleCoverUpload(trip.id, event)}
                  />
                </label>
                <label className="trip-card__upload">
                  Add More Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => handlePhotosUpload(trip.id, event)}
                  />
                </label>
              </div>

              {trip.photos.length ? (
                <div className="trip-card__gallery">
                  {trip.photos.map((photo, photoIndex) => (
                    <figure className="trip-card__photo" key={`${trip.id}-${photoIndex}`}>
                      <img src={photo} alt={`${trip.name} memory ${photoIndex + 1}`} />
                      <button
                        className="trip-card__photo-remove"
                        type="button"
                        onClick={() => onRemoveTripPhoto(trip.id, photoIndex)}
                      >
                        Remove
                      </button>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="trip-card__empty">No gallery photos yet.</p>
              )}

              {trip.flights.length ? (
                <ul className="trip-card__flights">
                  {trip.flights.map((flight) => {
                    const miles = getFlightDistanceMiles(flight);
                    return (
                      <li className="trip-card__flight" key={flight.id}>
                        <div>
                          <p className="trip-card__flight-title">
                            {flight.from} to {flight.to} {flight.flightNumber ? `- ${flight.flightNumber}` : ""}
                          </p>
                          <p className="trip-card__flight-meta">
                            {flight.airline || "Unknown airline"}
                            {miles !== null ? ` | ${formatMiles(miles)} miles` : " | miles unavailable"}
                          </p>
                        </div>
                        <button
                          className="trip-card__flight-remove"
                          type="button"
                          onClick={() => onRemoveFlight(flight.id)}
                        >
                          Remove Flight
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="trip-card__empty">No saved flights in this trip yet.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default TripJournal;
