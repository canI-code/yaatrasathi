import { Loader } from "@googlemaps/js-api-loader";
import type { MapLocation } from "../types";

let mapInstance: google.maps.Map | null = null;
let geocoderInstance: google.maps.Geocoder | null = null;

const touristMarkersMap = new Map<string, google.maps.Marker>();
const infoWindowsMap = new Map<string, google.maps.InfoWindow>();
let openInfoWindow: google.maps.InfoWindow | null = null;

const CATEGORY_COLORS: Record<string, string> = {
  attraction: "#2A9D8F",
  hotel:      "#A4D8E1",
  food:       "#FBBF24",
  transport:  "#16A34A",
};

// Google Maps "night" dark theme
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",                                                         stylers: [{ color: "#1a1a24" }] },
  { elementType: "labels.text.stroke",                                               stylers: [{ color: "#1a1a24" }] },
  { elementType: "labels.text.fill",                                                 stylers: [{ color: "#8a8a9a" }] },
  { featureType: "administrative.locality",  elementType: "labels.text.fill",        stylers: [{ color: "#c0b090" }] },
  { featureType: "poi",                      elementType: "labels.text.fill",        stylers: [{ color: "#c0a87a" }] },
  { featureType: "poi.park",                 elementType: "geometry",                stylers: [{ color: "#1e2e30" }] },
  { featureType: "poi.park",                 elementType: "labels.text.fill",        stylers: [{ color: "#6b9a76" }] },
  { featureType: "road",                     elementType: "geometry",                stylers: [{ color: "#2a2a3a" }] },
  { featureType: "road",                     elementType: "geometry.stroke",         stylers: [{ color: "#18181f" }] },
  { featureType: "road",                     elementType: "labels.text.fill",        stylers: [{ color: "#7a7a8a" }] },
  { featureType: "road.highway",             elementType: "geometry",                stylers: [{ color: "#3a3040" }] },
  { featureType: "road.highway",             elementType: "geometry.stroke",         stylers: [{ color: "#18181f" }] },
  { featureType: "road.highway",             elementType: "labels.text.fill",        stylers: [{ color: "#d4b880" }] },
  { featureType: "transit",                  elementType: "geometry",                stylers: [{ color: "#22222f" }] },
  { featureType: "transit.station",          elementType: "labels.text.fill",        stylers: [{ color: "#c0a87a" }] },
  { featureType: "water",                    elementType: "geometry",                stylers: [{ color: "#10192a" }] },
  { featureType: "water",                    elementType: "labels.text.fill",        stylers: [{ color: "#3a4a6a" }] },
  { featureType: "water",                    elementType: "labels.text.stroke",      stylers: [{ color: "#10192a" }] },
];

// ─── Canvas-based emoji pin (reliable across all browsers) ─────────────────────
const createEmojiMarkerDataURL = (color: string): string => {
  const W = 38, H = 52;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Drop shadow
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Circle head
  ctx.beginPath();
  ctx.arc(W / 2, 19, 17, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Triangle tail
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 7, 33);
  ctx.lineTo(W / 2 + 7, 33);
  ctx.lineTo(W / 2, H);
  ctx.fillStyle = color;
  ctx.fill();

  return canvas.toDataURL();
};

// ─── Map Init ──────────────────────────────────────────────────────────────────
export const initMap = async (
  container: HTMLDivElement,
  apiKey: string,
  center: [number, number] = [78.9629, 20.5937],
  zoom = 4
): Promise<void> => {
  const loader = new Loader({
    apiKey,
    version: "weekly",
  });

  await loader.load();

  mapInstance = new google.maps.Map(container, {
    center: { lat: center[1], lng: center[0] },
    zoom,
    styles: DARK_STYLE,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    backgroundColor: "#1a1a24",
  });

  geocoderInstance = new google.maps.Geocoder();
};

// ─── Fly To ────────────────────────────────────────────────────────────────────
export const flyTo = (coordinates: [number, number], zoom = 12) => {
  if (!mapInstance) return;
  mapInstance.panTo({ lat: coordinates[1], lng: coordinates[0] });
  mapInstance.setZoom(zoom);
};

// ─── Geocode ───────────────────────────────────────────────────────────────────
export const geocodeCity = async (
  query: string
): Promise<{ coordinates: [number, number]; name: string }> => {
  if (!geocoderInstance) throw new Error("Map not initialized.");
  const result = await geocoderInstance.geocode({ address: query });
  if (!result.results.length) throw new Error(`"${query}" not found. Try a different city name.`);
  const loc = result.results[0].geometry.location;
  const name =
    result.results[0].address_components?.[0]?.long_name ?? query;
  return { coordinates: [loc.lng(), loc.lat()], name };
};

// ─── Tourist Markers ───────────────────────────────────────────────────────────
export const clearTouristMarkers = () => {
  touristMarkersMap.forEach((m) => m.setMap(null));
  touristMarkersMap.clear();
  infoWindowsMap.forEach((w) => w.close());
  infoWindowsMap.clear();
  openInfoWindow = null;
};

export const addTouristMarker = (
  location: MapLocation,
  onClick?: (loc: MapLocation) => void
): google.maps.Marker | null => {
  if (!mapInstance) return null;

  const type = location.type ?? location.category ?? "attraction";
  const color = CATEGORY_COLORS[type] ?? CATEGORY_COLORS.attraction;

  const iconUrl = createEmojiMarkerDataURL(color);

  const marker = new google.maps.Marker({
    position: { lat: location.coordinates[1], lng: location.coordinates[0] },
    map: mapInstance,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(38, 52),
      anchor: new google.maps.Point(19, 52), // tip of pin
    },
    title: location.name,
    optimized: false,
  });

  const ratingStars = location.rating
    ? "★".repeat(Math.round(location.rating)).padEnd(5, "☆")
    : "";

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="
        padding: 14px 16px;
        background: #18181f;
        border-radius: 14px;
        color: #f0f0f0;
        font-family: Inter, sans-serif;
        border: 1px solid rgba(0, 0, 0, 0.05);
        min-width: 200px;
        max-width: 250px;
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
      </div>`,
    disableAutoPan: false,
  });

  marker.addListener("click", () => {
    if (openInfoWindow) openInfoWindow.close();
    infoWindow.open({ map: mapInstance!, anchor: marker });
    openInfoWindow = infoWindow;
    if (onClick) onClick(location);
  });

  touristMarkersMap.set(location.id, marker);
  infoWindowsMap.set(location.id, infoWindow);

  return marker;
};

// ─── Open a specific popup programmatically ────────────────────────────────────
export const openTouristPopup = (id: string) => {
  const marker = touristMarkersMap.get(id);
  const infoWindow = infoWindowsMap.get(id);
  if (!marker || !infoWindow || !mapInstance) return;

  if (openInfoWindow) openInfoWindow.close();

  const pos = marker.getPosition();
  if (pos) {
    mapInstance.panTo(pos);
    mapInstance.setZoom(15);
  }

  infoWindow.open({ map: mapInstance, anchor: marker });
  openInfoWindow = infoWindow;
};

export const getMapInstance = () => mapInstance;
