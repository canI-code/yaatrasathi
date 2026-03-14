import L from "leaflet";
import type { MapLocation } from "../types";

// Leaflet's default icon images break under Vite — suppress them entirely
// since we use DivIcon for all markers.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: "", shadowUrl: "", iconRetinaUrl: "" });

// Inject popup style overrides once (no CSS file needed)
if (typeof document !== "undefined" && !document.getElementById("yatra-leaflet-style")) {
  const style = document.createElement("style");
  style.id = "yatra-leaflet-style";
  style.textContent = `
    .leaflet-popup-content-wrapper,
    .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; padding: 0 !important; border: none !important; }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-container { font-family: Inter, sans-serif; }
    .leaflet-control-zoom a { background: #1e1e28 !important; color: #f0f0f0 !important; border-color: rgba(0, 0, 0, 0.05) !important; }
    .leaflet-control-zoom a:hover { background: #2a2a38 !important; }
    .leaflet-control-attribution { background: rgba(13,13,15,0.75) !important; color: rgba(61, 60, 58,0.4) !important; }
    .leaflet-control-attribution a { color: rgba(61, 60, 58,0.5) !important; }
  `;
  document.head.appendChild(style);
}

let mapInstance: L.Map | null = null;

const touristMarkersMap = new Map<string, L.Marker>();
const touristPopupsMap  = new Map<string, L.Popup>();

const CATEGORY_COLORS: Record<string, string> = {
  attraction: "#2A9D8F",
  hotel:      "#A4D8E1",
  food:       "#FBBF24",
  transport:  "#16A34A",
};

// ─── Build an SVG pin DivIcon (no external images, no drift) ─────────────────
const buildPinIcon = (color: string): L.DivIcon => {
  // 38 × 52 px  — anchor at bottom-center (19, 52) = tip of the triangle
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="52" viewBox="0 0 38 52">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      <!-- Circle head -->
      <circle cx="19" cy="19" r="17" fill="${color}" stroke="rgba(0, 0, 0, 0.1)" stroke-width="2" filter="url(#shadow)"/>
      <!-- Triangle tail -->
      <polygon points="12,32 26,32 19,52" fill="${color}" filter="url(#shadow)"/>
      <!-- Center dot -->
      <circle cx="19" cy="19" r="5" fill="#F6F9FC" />
    </svg>`;

  return L.divIcon({
    html: `<div class="yatra-pin" style="width:38px;height:52px;cursor:pointer;transition:transform 0.18s ease;transform-origin:bottom center;">${svg}</div>`,
    className: "",          // no extra Leaflet wrapper styling
    iconSize:   [38, 52],
    iconAnchor: [19, 52],   // tip of triangle locked to coordinate
    popupAnchor:[0, -52],   // popup opens above the pin head
  });
};

// ─── Dark tile layer ──────────────────────────────────────────────────────────
const DARK_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// ─── initMap ──────────────────────────────────────────────────────────────────

export const initMap = (
  container: HTMLDivElement,
  center: [number, number] = [78.9629, 20.5937],
  zoom = 4
): void => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  const baseMaps = {
    "Normal": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; OpenStreetMap' }),
    "Dark Mode": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, attribution: '&copy; CARTO' }),
    "Light Mode": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19, attribution: '&copy; CARTO' }),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: '&copy; Esri' })
  };

  mapInstance = L.map(container, {
    center:        [center[1], center[0]],  // Leaflet uses [lat, lng]
    zoom,
    zoomControl:   true,
    attributionControl: true,
    layers: [baseMaps["Normal"]] // Initial layer
  });

  L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(mapInstance);
};


// ─── Geocode via OpenStreetMap Nominatim (no API key needed) ──────────────────
export const flyTo = (center: [number, number], zoom = 13) => {
  if (mapInstance) mapInstance.flyTo([center[1], center[0]], zoom);
};

export const geocodeCity = async (
  query: string
): Promise<{ coordinates: [number, number]; name: string }> => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Geocoding request failed.");
  const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data.length) throw new Error(`"${query}" not found. Try a different city name.`);
  const { lat, lon, display_name } = data[0];
  const name = display_name.split(",")[0];
  return { coordinates: [parseFloat(lon), parseFloat(lat)], name };
};

// ─── clearTouristMarkers ──────────────────────────────────────────────────────
export const clearTouristMarkers = () => {
  touristMarkersMap.forEach((m) => m.remove());
  touristMarkersMap.clear();
  touristPopupsMap.clear();
};

// ─── addTouristMarker ─────────────────────────────────────────────────────────
export const addTouristMarker = (
  location: MapLocation,
  onClick?: (loc: MapLocation) => void
): L.Marker | null => {
  if (!mapInstance) return null;

  const type  = location.type ?? location.category ?? "attraction";
  const color = CATEGORY_COLORS[type] ?? CATEGORY_COLORS.attraction;

  const icon = buildPinIcon(color);

  const marker = L.marker([location.coordinates[1], location.coordinates[0]], { icon })
    .addTo(mapInstance!);

  // Hover: scale the inner .yatra-pin without touching Leaflet's positioning element
  const el = marker.getElement();
  if (el) {
    const pin = el.querySelector<HTMLElement>(".yatra-pin");
    if (pin) {
      el.addEventListener("mouseenter", () => { pin.style.transform = "scale(1.2) translateY(-3px)"; });
      el.addEventListener("mouseleave", () => { pin.style.transform = ""; });
    }
  }

  const ratingStars = location.rating
    ? "★".repeat(Math.round(location.rating)).padEnd(5, "☆")
    : "";

  const popup = L.popup({
    offset: [0, -4],
    className: "yatra-leaflet-popup",
    closeButton: false,
    maxWidth: 260,
  }).setContent(`
    <div style="
      padding:14px 16px;
      background:#18181f;
      border-radius:14px;
      color: #f0f0f0;
      font-family:Inter,sans-serif;
      border:1px solid rgba(0, 0, 0, 0.05);
      min-width:190px;
    ">
      <div style="margin-bottom:6px">
        <strong style="font-size:0.85rem;display:block;line-height:1.3">${location.name}</strong>
        ${ratingStars ? `<span style="font-size:0.7rem;color: #F59E0B">${ratingStars} ${location.rating}</span>` : ""}
      </div>
      <p style="font-size:0.75rem;color: rgba(61, 60, 58,0.55);margin:0 0 8px;line-height:1.5">
        ${location.description}
      </p>
      ${location.tips ? `<p style="font-size:0.72rem;color: rgba(61, 60, 58,0.45);margin:0;font-style:italic">${location.tips}</p>` : ""}
      <span style="
        display:inline-block;margin-top:8px;
        font-size:0.65rem;font-weight:700;text-transform:capitalize;
        padding:2px 8px;border-radius:8px;
        color: ${color};background:${color}22;
      ">${type}</span>
    </div>`);

  marker.bindPopup(popup);

  marker.on("click", () => {
    if (onClick) onClick(location);
  });

  touristMarkersMap.set(location.id, marker);
  touristPopupsMap.set(location.id, popup);

  return marker;
};

// ─── openTouristPopup ─────────────────────────────────────────────────────────
export const openTouristPopup = (id: string) => {
  if (!mapInstance) return;
  const marker = touristMarkersMap.get(id);
  if (!marker) return;
  const latlng = marker.getLatLng();
  mapInstance.flyTo(latlng, 15, { duration: 1.2 });
  marker.openPopup();
};

export const getMapInstance = () => mapInstance;
