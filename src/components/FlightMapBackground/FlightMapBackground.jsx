import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAirportCoordinates } from "../../utils/airportCoordinates";
import "./FlightMapBackground.css";

function buildRouteSegments(flights) {
  return flights
    .map((flight) => {
      const from = getAirportCoordinates(flight.from);
      const to = getAirportCoordinates(flight.to);

      if (!from || !to) return null;
      return {
        id: flight.id,
        from,
        to,
      };
    })
    .filter((segment) => Boolean(segment));
}

function FlightMapBackground({ flights, mode = "ambient" }) {
  const mapRootRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const routeSegments = useMemo(() => buildRouteSegments(flights), [flights]);
  const isFocusMode = mode === "focus";

  useEffect(() => {
    if (!mapRootRef.current || mapRef.current) return;

    const map = L.map(mapRootRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: isFocusMode,
      scrollWheelZoom: isFocusMode,
      doubleClickZoom: isFocusMode,
      boxZoom: isFocusMode,
      keyboard: isFocusMode,
      touchZoom: isFocusMode,
      zoomSnap: 0.5,
    }).setView([18, 7], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const routeLayer = L.layerGroup().addTo(map);
    if (isFocusMode) L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    routeLayerRef.current = routeLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, [isFocusMode]);

  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    routeSegments.forEach((segment) => {
      if (isFocusMode) {
        L.polyline([segment.from, segment.to], {
          color: "#fff4df",
          weight: 6.4,
          opacity: 0.56,
        }).addTo(routeLayer);
      }

      L.polyline([segment.from, segment.to], {
        color: "#f97316",
        weight: isFocusMode ? 4.2 : 3,
        opacity: isFocusMode ? 0.96 : 0.9,
        dashArray: isFocusMode ? undefined : "9 7",
      }).addTo(routeLayer);

      L.circleMarker(segment.from, {
        radius: isFocusMode ? 6.4 : 5.3,
        weight: 1.2,
        color: "#0369a1",
        fillColor: "#38bdf8",
        fillOpacity: isFocusMode ? 1 : 0.95,
      }).addTo(routeLayer);

      L.circleMarker(segment.to, {
        radius: isFocusMode ? 6.4 : 5.3,
        weight: 1.2,
        color: "#c2410c",
        fillColor: "#fb923c",
        fillOpacity: isFocusMode ? 1 : 0.95,
      }).addTo(routeLayer);
    });

    if (routeSegments.length) {
      const bounds = L.latLngBounds(
        routeSegments.flatMap((segment) => [segment.from, segment.to])
      );
      map.flyToBounds(bounds.pad(0.28), {
        animate: true,
        duration: isFocusMode ? 0.9 : 1.1,
      });
      return;
    }

    map.flyTo([18, 7], 2, { animate: true, duration: isFocusMode ? 0.8 : 1 });
  }, [routeSegments, isFocusMode]);

  return (
    <div
      className={`map-bg map-bg--${isFocusMode ? "focus" : "ambient"}`}
      aria-hidden={isFocusMode ? undefined : true}
    >
      <div className="map-bg__map" ref={mapRootRef} />
      <div className="map-bg__wash" />
      <div className="map-bg__grain" />
    </div>
  );
}

export default FlightMapBackground;
