import mapboxgl from "mapbox-gl";
import type { MapLocation } from "../types";

let mapInstance: mapboxgl.Map | null = null;

// Track tourist place markers so they can be cleared and programmatically opened
const touristMarkersMap = new Map<string, mapboxgl.Marker>();

const CATEGORY_COLORS: Record<string, { bg: string; glow: string; solid: string }> = {
  attraction: { bg: "#2A9D8F", glow: "rgba(42,157,143,0.45)", solid: "#2A9D8F" },
  hotel:      { bg: "#A4D8E1", glow: "rgba(164,216,225,0.45)", solid: "#A4D8E1" },
  food:       { bg: "#FBBF24", glow: "rgba(251,191,36,0.45)", solid: "#FBBF24" },
  transport:  { bg: "#16A34A", glow: "rgba(22,163,74,0.45)", solid: "#16A34A" },
};

export const initMap = (
  container: HTMLDivElement,
  token: string,
  center: [number, number] = [78.9629, 20.5937],
  zoom = 4
): Promise<mapboxgl.Map> => {
  return new Promise((resolve, reject) => {
    try {
      mapboxgl.accessToken = token;

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      map.on("load", () => {
        mapInstance = map;
        resolve(map);
      });

      map.on("error", (e) => {
        reject(new Error(e.error?.message ?? "Mapbox map failed to load."));
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Failed to initialize Mapbox."));
    }
  });
};

export const flyTo = (coordinates: [number, number], zoom = 10) => {
  if (!mapInstance) return;
  mapInstance.flyTo({ center: coordinates, zoom, duration: 1800, essential: true });
};

export const addMarker = (
  location: MapLocation,
  onClick?: (loc: MapLocation) => void
): mapboxgl.Marker | null => {
  if (!mapInstance) return null;

  // Outer el: static anchor for Mapbox — no transform ever applied here
  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px;
    height: 44px;
    cursor: pointer;
    position: relative;
  `;

  // Inner wrapper: transform applied here so Mapbox anchor stays locked
  const pinWrapper = document.createElement("div");
  pinWrapper.style.cssText = `
    width: 32px;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: bottom center;
    transition: transform 0.18s ease;
  `;

  const head = document.createElement("div");
  head.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #2A9D8F;
    border: 2px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  `;
  head.textContent = "";

  const tail = document.createElement("div");
  tail.style.cssText = `
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 13px solid #FF4B4B;
    margin-top: -2px;
    flex-shrink: 0;
  `;

  pinWrapper.appendChild(head);
  pinWrapper.appendChild(tail);
  el.appendChild(pinWrapper);

  el.addEventListener("mouseenter", () => (pinWrapper.style.transform = "scale(1.2)"));
  el.addEventListener("mouseleave", () => (pinWrapper.style.transform = "scale(1)"));

  const popup = new mapboxgl.Popup({ offset: 20, className: "yatra-popup" })
    .setHTML(
      `<div style="padding:10px;background:#1c1c22;border-radius:10px;color: #f0f0f0;font-family:Inter,sans-serif">
        <strong style="font-size:0.9rem">${location.name}</strong>
        <p style="font-size:0.78rem;color: rgba(61, 60, 58,0.6);margin-top:4px">${location.description}</p>
        <span style="font-size:0.7rem;color: #FF4B4B;background:rgba(255,75,75,0.1);padding:2px 8px;border-radius:6px">${location.category}</span>
       </div>`
    );

  const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
    .setLngLat(location.coordinates)
    .setPopup(popup)
    .addTo(mapInstance);

  if (onClick) el.addEventListener("click", () => onClick(location));

  return marker;
};

export const searchLocation = async (query: string): Promise<MapLocation> => {
  const token = import.meta.env.VITE_MAPBOX_API_KEY as string;
  if (!token) throw new Error("Mapbox API key is not configured.");

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed.");

  const json = await res.json() as {
    features: Array<{
      id: string;
      place_name: string;
      center: [number, number];
      place_type: string[];
    }>;
  };

  if (!json.features.length) throw new Error(`No location found for "${query}".`);

  const feature = json.features[0];
  const location: MapLocation = {
    id: feature.id,
    name: feature.place_name.split(",")[0],
    coordinates: feature.center,
    description: feature.place_name,
    category: feature.place_type[0] ?? "place",
  };

  flyTo(location.coordinates, 10);
  addMarker(location);
  return location;
};

export const getMapInstance = () => mapInstance;

// ─── Tourist Place Marker System ──────────────────────────────────────────────

export const clearTouristMarkers = () => {
  touristMarkersMap.forEach((m) => m.remove());
  touristMarkersMap.clear();
};

export const addTouristMarker = (
  location: MapLocation,
  onClick?: (loc: MapLocation) => void
): mapboxgl.Marker | null => {
  if (!mapInstance) return null;

  const type = location.type ?? location.category ?? "attraction";
  const theme = CATEGORY_COLORS[type] ?? CATEGORY_COLORS.attraction;

  // Outer el: static anchor for Mapbox — no transform ever applied here
  const el = document.createElement("div");
  el.style.cssText = `
    width: 34px;
    height: 46px;
    cursor: pointer;
    position: relative;
  `;
  el.title = location.name;

  // Inner wrapper: transform applied here so Mapbox anchor stays locked
  const pinWrapper = document.createElement("div");
  pinWrapper.style.cssText = `
    width: 34px;
    height: 46px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: bottom center;
    transition: transform 0.18s ease;
  `;

  // Pin head (circle)
  const head = document.createElement("div");
  head.style.cssText = `
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: ${theme.bg};
    border: 2px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  `;
  head.textContent = "";

  // Pin tail (triangle pointing down)
  const tail = document.createElement("div");
  tail.style.cssText = `
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 14px solid ${theme.solid};
    margin-top: -2px;
    flex-shrink: 0;
  `;

  pinWrapper.appendChild(head);
  pinWrapper.appendChild(tail);
  el.appendChild(pinWrapper);

  el.addEventListener("mouseenter", () => (pinWrapper.style.transform = "scale(1.2)"));
  el.addEventListener("mouseleave", () => (pinWrapper.style.transform = "scale(1)"));

  const ratingStars = location.rating
    ? "★".repeat(Math.round(location.rating)).padEnd(5, "☆")
    : "";

  const popup = new mapboxgl.Popup({
    offset: 22,
    closeButton: false,
    maxWidth: "260px",
    className: "yatra-tourist-popup",
  }).setHTML(
    `<div style="padding:14px 16px;background:#18181f;border-radius:14px;color: #f0f0f0;font-family:Inter,sans-serif;border:1px solid rgba(0, 0, 0, 0.05)">
      <div style="margin-bottom:6px">
        <strong style="font-size:0.88rem;display:block;line-height:1.25">${location.name}</strong>
        ${ratingStars ? `<span style="font-size:0.7rem;color: #F59E0B;letter-spacing:1px">${ratingStars}</span>` : ""}
      </div>
      <p style="font-size:0.78rem;color: rgba(61, 60, 58,0.65);margin:0 0 8px;line-height:1.5">${location.description}</p>
      ${location.address ? `<p style="font-size:0.72rem;color: rgba(61, 60, 58,0.4);margin:0 0 6px">${location.address}</p>` : ""}
      ${location.tips ? `<p style="font-size:0.72rem;color: #34D399;margin:0;line-height:1.4">${location.tips}</p>` : ""}
      <span style="display:inline-block;margin-top:8px;font-size:0.68rem;color: rgba(61, 60, 58,0.9);background:${theme.bg};padding:2px 10px;border-radius:10px;text-transform:capitalize">${type}</span>
     </div>`
  );

  const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
    .setLngLat(location.coordinates)
    .setPopup(popup)
    .addTo(mapInstance);

  if (onClick) el.addEventListener("click", () => onClick(location));

  touristMarkersMap.set(location.id, marker);
  return marker;
};

export const openTouristPopup = (id: string) => {
  const marker = touristMarkersMap.get(id);
  if (!marker || !mapInstance) return;
  // Close all other popups first
  touristMarkersMap.forEach((m, k) => {
    if (k !== id && m.getPopup().isOpen()) m.togglePopup();
  });
  if (!marker.getPopup().isOpen()) marker.togglePopup();
  flyTo(marker.getLngLat().toArray() as [number, number], 15);
};
