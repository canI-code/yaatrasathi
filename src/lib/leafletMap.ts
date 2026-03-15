import L from "leaflet";
import type { MapLocation } from "../types";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: "", shadowUrl: "", iconRetinaUrl: "" });

if (typeof document !== "undefined" && !document.getElementById("yatra-leaflet-style")) {
  const style = document.createElement("style");
  style.id = "yatra-leaflet-style";
  style.textContent = `
    .leaflet-popup-content-wrapper, .leaflet-popup-tip {
      background: transparent !important; box-shadow: none !important;
      padding: 0 !important; border: none !important;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-container { font-family: Inter, sans-serif; }
    .leaflet-control-zoom a {
      background: rgba(255,255,255,0.92) !important; color: #1B2A3B !important;
      border-color: rgba(164,216,225,0.3) !important; font-weight: 700 !important;
    }
    .leaflet-control-zoom a:hover { background: rgba(42,157,143,0.1) !important; }
    .leaflet-control-attribution {
      background: rgba(255,255,255,0.8) !important; color: rgba(27,42,59,0.5) !important;
      font-size: 10px !important; backdrop-filter: blur(8px);
    }
    .leaflet-control-attribution a { color: rgba(42,157,143,0.8) !important; }
    .leaflet-control-layers {
      background: rgba(255,255,255,0.92) !important;
      border: 1px solid rgba(164,216,225,0.3) !important;
      border-radius: 12px !important; backdrop-filter: blur(16px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
    }
    .leaflet-control-scale-line {
      background: rgba(255,255,255,0.85) !important;
      border-color: rgba(42,157,143,0.5) !important;
      color: #1B2A3B !important; font-size: 10px !important;
    }
    .yatra-draw-marker { cursor: crosshair !important; }
    .yatra-measure-tooltip {
      background: rgba(27,42,59,0.85); color: #fff; padding: 4px 10px;
      border-radius: 8px; font-size: 11px; font-family: Inter, sans-serif;
      border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .leaflet-routing-container {
      background: rgba(255,255,255,0.92) !important;
      border: 1px solid rgba(164,216,225,0.3) !important;
      border-radius: 12px !important; backdrop-filter: blur(16px);
      font-family: Inter, sans-serif !important; font-size: 12px !important;
      max-height: 300px; overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
}

// ── State ─────────────────────────────────────────────────────────────────────

let mapInstance: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;  // persistent layer — survives tile switches
let userLayer: L.LayerGroup | null = null;
const touristMarkersMap = new Map<string, L.Marker>();
const touristPopupsMap  = new Map<string, L.Popup>();
const userMarkersMap    = new Map<string, L.Marker>();
const drawnLayers       = new Map<string, L.Layer>();
let measurePolyline: L.Polyline | null = null;
let measurePoints: L.LatLng[] = [];
let measureMarkers: L.Marker[] = [];
let isMeasuring = false;
let routingControl: L.Routing.Control | null = null;
let currentBasemap = "Normal";

// ── Tile layers ───────────────────────────────────────────────────────────────

const TILE_LAYERS: Record<string, L.TileLayer> = {};

function buildTileLayers() {
  return {
    "🗺️ Normal":    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",                                                    { maxZoom: 19, attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>' }),
    "🌙 Dark":      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                          { maxZoom: 19, attribution: '© CARTO' }),
    "☀️ Light":     L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",                                         { maxZoom: 19, attribution: '© CARTO' }),
    "🛰️ Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",           { maxZoom: 19, attribution: '© Esri' }),
    "🏔️ Terrain":   L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                                                       { maxZoom: 17, attribution: '© OpenTopoMap' }),
    "🚴 Cycle":     L.tileLayer("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",                                      { maxZoom: 20, attribution: '© CyclOSM' }),
  };
}

// ── Pin icon ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  attraction: "#2A9D8F",
  hotel:      "#818CF8",
  food:       "#FBBF24",
  transport:  "#34D399",
  custom:     "#F97316",
};

const buildPinIcon = (color: string, label = ""): L.DivIcon => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="50" viewBox="0 0 36 50">
    <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/></filter></defs>
    <circle cx="18" cy="18" r="16" fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="2" filter="url(#s)"/>
    <polygon points="11,30 25,30 18,50" fill="${color}" filter="url(#s)"/>
    <circle cx="18" cy="18" r="5" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return L.divIcon({
    html: `<div class="yatra-pin" style="width:36px;height:50px;cursor:pointer;transition:transform 0.18s;transform-origin:bottom center;" title="${label}">${svg}</div>`,
    className: "", iconSize: [36, 50], iconAnchor: [18, 50], popupAnchor: [0, -50],
  });
};

const buildNumberIcon = (color: string, num: number): L.DivIcon => {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:Inter,sans-serif;">${num}</div>`,
    className: "", iconSize: [28, 28], iconAnchor: [14, 14],
  });
};

// ── initMap ───────────────────────────────────────────────────────────────────

export const initMap = (
  container: HTMLDivElement,
  center: [number, number] = [78.9629, 20.5937],
  zoom = 4
): void => {
  if (mapInstance) { mapInstance.remove(); mapInstance = null; markersLayer = null; userLayer = null; }

  const layers = buildTileLayers();
  Object.assign(TILE_LAYERS, layers);

  // Create persistent overlay groups BEFORE map init
  markersLayer = L.layerGroup();
  userLayer    = L.layerGroup();

  mapInstance = L.map(container, {
    center: [center[1], center[0]],
    zoom,
    zoomControl: false,
    attributionControl: true,
    layers: [layers["🗺️ Normal"]],
  });

  // Add persistent marker layers — these are NOT in the layer control
  // so they are never removed when the user switches tile layers
  markersLayer.addTo(mapInstance);
  userLayer.addTo(mapInstance);

  // Zoom control — top right
  L.control.zoom({ position: "topright" }).addTo(mapInstance);

  // Layer switcher (tile layers only — no overlays)
  L.control.layers(layers, undefined, { position: "topright", collapsed: true }).addTo(mapInstance);

  // Scale bar
  L.control.scale({ position: "bottomright", imperial: false }).addTo(mapInstance);

  // Click handler for custom markers / measure
  mapInstance.on("click", (e: L.LeafletMouseEvent) => {
    if (isMeasuring) handleMeasureClick(e.latlng);
  });
};

// ── Geocode ───────────────────────────────────────────────────────────────────

export const flyTo = (center: [number, number], zoom = 13) => {
  if (mapInstance) mapInstance.flyTo([center[1], center[0]], zoom, { duration: 1.4 });
};

export const geocodeCity = async (query: string): Promise<{ coordinates: [number, number]; name: string }> => {
  // Try progressively broader queries until one returns a result
  const attempts = [
    query,                                          // exact: "pcce, verna, goa"
    query.replace(/,\s*/g, " "),                    // spaces: "pcce verna goa"
    query.split(",").slice(-2).join(",").trim(),     // last 2 parts: "verna, goa"
    query.split(",").slice(-1)[0].trim(),            // last part only: "goa"
  ];

  for (const attempt of attempts) {
    if (!attempt) continue;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(attempt)}&format=json&limit=1&addressdetails=1`;
    try {
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) continue;
      const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (data.length) {
        const { lat, lon, display_name } = data[0];
        const name = display_name.split(",")[0];
        return { coordinates: [parseFloat(lon), parseFloat(lat)], name };
      }
    } catch { continue; }
  }

  throw new Error(`"${query}" not found. Try a different spelling or add more location details.`);
};

// ── Tourist markers ───────────────────────────────────────────────────────────

export const clearTouristMarkers = () => {
  touristMarkersMap.forEach((m) => m.remove());
  touristMarkersMap.clear();
  touristPopupsMap.clear();
};

export const addTouristMarker = (location: MapLocation, onClick?: (loc: MapLocation) => void): L.Marker | null => {
  if (!mapInstance || !markersLayer) return null;
  const type  = location.type ?? location.category ?? "attraction";
  const color = CATEGORY_COLORS[type] ?? CATEGORY_COLORS.attraction;
  const icon  = buildPinIcon(color, location.name);
  const marker = L.marker([location.coordinates[1], location.coordinates[0]], { icon }).addTo(markersLayer);

  const el = marker.getElement();
  if (el) {
    const pin = el.querySelector<HTMLElement>(".yatra-pin");
    if (pin) {
      el.addEventListener("mouseenter", () => { pin.style.transform = "scale(1.2) translateY(-3px)"; });
      el.addEventListener("mouseleave", () => { pin.style.transform = ""; });
    }
  }

  const stars = location.rating ? "★".repeat(Math.round(location.rating)).padEnd(5, "☆") : "";
  const popup = L.popup({ offset: [0, -4], closeButton: true, maxWidth: 260 }).setContent(`
    <div style="padding:14px 16px;background:rgba(255,255,255,0.96);border-radius:14px;color:#1B2A3B;font-family:Inter,sans-serif;border:1px solid rgba(164,216,225,0.3);min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
      <strong style="font-size:0.88rem;display:block;margin-bottom:4px">${location.name}</strong>
      ${stars ? `<span style="font-size:0.72rem;color:#d97706">${stars} ${location.rating}</span>` : ""}
      <p style="font-size:0.78rem;color:rgba(27,42,59,0.65);margin:6px 0 8px;line-height:1.5">${location.description}</p>
      ${location.address ? `<p style="font-size:0.72rem;color:rgba(27,42,59,0.45);margin:0 0 6px">📍 ${location.address}</p>` : ""}
      ${location.tips ? `<p style="font-size:0.72rem;color:rgba(27,42,59,0.5);margin:0;font-style:italic">💡 ${location.tips}</p>` : ""}
      <span style="display:inline-block;margin-top:8px;font-size:0.65rem;font-weight:700;text-transform:capitalize;padding:2px 8px;border-radius:8px;color:${color};background:${color}22">${type}</span>
    </div>`);

  marker.bindPopup(popup);
  marker.on("click", () => { if (onClick) onClick(location); });
  touristMarkersMap.set(location.id, marker);
  touristPopupsMap.set(location.id, popup);
  return marker;
};

export const openTouristPopup = (id: string) => {
  if (!mapInstance) return;
  const marker = touristMarkersMap.get(id);
  if (!marker) return;
  mapInstance.flyTo(marker.getLatLng(), 15, { duration: 1.2 });
  marker.openPopup();
};

// ── Custom user markers ───────────────────────────────────────────────────────

export const addCustomMarker = (latlng: L.LatLng, label: string): string => {
  if (!mapInstance || !userLayer) return "";
  const id = `custom_${Date.now()}`;
  const icon = buildPinIcon(CATEGORY_COLORS.custom, label);
  const marker = L.marker(latlng, { icon, draggable: true }).addTo(userLayer);

  const popup = L.popup({ closeButton: true }).setContent(`
    <div style="padding:10px 14px;background:rgba(255,255,255,0.96);border-radius:12px;font-family:Inter,sans-serif;min-width:160px;border:1px solid rgba(249,115,22,0.2);">
      <strong style="font-size:0.85rem;color:#1B2A3B">${label || "Custom Pin"}</strong>
      <p style="font-size:0.72rem;color:rgba(27,42,59,0.5);margin:4px 0 0">${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</p>
      <button onclick="window._removeCustomMarker('${id}')" style="margin-top:8px;padding:3px 10px;border-radius:8px;border:1px solid rgba(220,38,38,0.3);background:rgba(220,38,38,0.06);color:#dc2626;font-size:0.72rem;cursor:pointer;font-family:Inter,sans-serif;">Remove</button>
    </div>`);
  marker.bindPopup(popup).openPopup();
  userMarkersMap.set(id, marker);

  // Expose remove function globally for popup button
  (window as unknown as Record<string, unknown>)._removeCustomMarker = (mid: string) => removeCustomMarker(mid);

  return id;
};

export const removeCustomMarker = (id: string) => {
  const m = userMarkersMap.get(id);
  if (m) { m.remove(); userMarkersMap.delete(id); }
};

export const clearCustomMarkers = () => {
  userMarkersMap.forEach((m) => m.remove());
  userMarkersMap.clear();
};

// ── Measure distance ──────────────────────────────────────────────────────────

let measureTooltip: L.Tooltip | null = null;

function handleMeasureClick(latlng: L.LatLng) {
  if (!mapInstance) return;
  measurePoints.push(latlng);

  const numIcon = buildNumberIcon("#1B2A3B", measurePoints.length);
  const m = L.marker(latlng, { icon: numIcon }).addTo(userLayer ?? mapInstance);
  measureMarkers.push(m);

  if (measurePoints.length > 1) {
    if (measurePolyline) measurePolyline.remove();
    measurePolyline = L.polyline(measurePoints, { color: "#2A9D8F", weight: 2.5, dashArray: "6 4" }).addTo(userLayer ?? mapInstance);

    let total = 0;
    for (let i = 1; i < measurePoints.length; i++) {
      total += measurePoints[i - 1].distanceTo(measurePoints[i]);
    }
    const dist = total >= 1000 ? `${(total / 1000).toFixed(2)} km` : `${Math.round(total)} m`;

    if (measureTooltip) measureTooltip.remove();
    measureTooltip = L.tooltip({ permanent: true, className: "yatra-measure-tooltip", direction: "top" })
      .setLatLng(latlng)
      .setContent(`${dist}`)
      .addTo(userLayer ?? mapInstance);
  }
}

export const startMeasure = () => {
  isMeasuring = true;
  if (mapInstance) mapInstance.getContainer().style.cursor = "crosshair";
};

export const stopMeasure = () => {
  isMeasuring = false;
  if (mapInstance) mapInstance.getContainer().style.cursor = "";
};

export const clearMeasure = () => {
  stopMeasure();
  measurePoints = [];
  if (measurePolyline) { measurePolyline.remove(); measurePolyline = null; }
  measureMarkers.forEach((m) => m.remove());
  measureMarkers = [];
  if (measureTooltip) { measureTooltip.remove(); measureTooltip = null; }
};

export const isMeasuringActive = () => isMeasuring;

// ── Routing (OSRM — free, no key) ────────────────────────────────────────────

export const getRoute = async (
  from: [number, number],
  to: [number, number]
): Promise<{ distance: number; duration: number; steps: string[] } | null> => {
  if (!mapInstance) return null;

  // Clear previous route
  if (routingControl) {
    try { mapInstance.removeControl(routingControl); } catch { /* ignore */ }
    routingControl = null;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing failed.");
  const data = await res.json() as {
    routes: Array<{
      distance: number; duration: number;
      geometry: { coordinates: [number, number][] };
      legs: Array<{ steps: Array<{ maneuver: { instruction?: string }; name: string }> }>;
    }>;
  };

  if (!data.routes?.length) throw new Error("No route found.");
  const route = data.routes[0];
  const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

  // Draw route on map
  const routeLine = L.polyline(coords, { color: "#2A9D8F", weight: 4, opacity: 0.85 }).addTo(userLayer ?? mapInstance);
  drawnLayers.set("route", routeLine);
  mapInstance.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  // Add start/end markers
  const startIcon = buildNumberIcon("#059669", 1);
  const endIcon   = buildNumberIcon("#dc2626", 2);
  const startM = L.marker([from[1], from[0]], { icon: startIcon }).addTo(userLayer ?? mapInstance);
  const endM   = L.marker([to[1],   to[0]],   { icon: endIcon   }).addTo(userLayer ?? mapInstance);
  drawnLayers.set("route_start", startM);
  drawnLayers.set("route_end",   endM);

  const steps = route.legs[0]?.steps?.map((s) => s.maneuver?.instruction ?? s.name).filter(Boolean) ?? [];
  return { distance: route.distance, duration: route.duration, steps };
};

export const clearRoute = () => {
  ["route", "route_start", "route_end"].forEach((k) => {
    const l = drawnLayers.get(k);
    if (l) { l.remove(); drawnLayers.delete(k); }
  });
};

// ── Locate user ───────────────────────────────────────────────────────────────

export const locateUser = (): Promise<L.LatLng> => {
  return new Promise((resolve, reject) => {
    if (!mapInstance) return reject(new Error("Map not ready"));
    mapInstance.locate({ setView: true, maxZoom: 15 });
    mapInstance.once("locationfound", (e: L.LocationEvent) => {
      const layer = userLayer ?? mapInstance!;
      L.circle(e.latlng, { radius: e.accuracy / 2, color: "#2A9D8F", fillOpacity: 0.1 }).addTo(layer);
      const icon = buildPinIcon("#2A9D8F", "You are here");
      L.marker(e.latlng, { icon }).bindPopup("You are here").openPopup().addTo(layer);
      resolve(e.latlng);
    });
    mapInstance.once("locationerror", (e: L.ErrorEvent) => reject(new Error(e.message)));
  });
};

// ── Draw polygon / circle ─────────────────────────────────────────────────────

let drawingMode: "polygon" | "circle" | null = null;
let polygonPoints: L.LatLng[] = [];
let polygonPreview: L.Polygon | null = null;
let circleCenter: L.LatLng | null = null;
let circlePreview: L.Circle | null = null;
let drawClickHandler: ((e: L.LeafletMouseEvent) => void) | null = null;

export const startDraw = (mode: "polygon" | "circle") => {
  if (!mapInstance) return;
  stopDraw();
  drawingMode = mode;
  polygonPoints = [];
  mapInstance.getContainer().style.cursor = "crosshair";

  drawClickHandler = (e: L.LeafletMouseEvent) => {
    if (mode === "polygon") {
      polygonPoints.push(e.latlng);
      if (polygonPreview) polygonPreview.remove();
      if (polygonPoints.length >= 2) {
        polygonPreview = L.polygon(polygonPoints, { color: "#818CF8", fillOpacity: 0.15, weight: 2 }).addTo(userLayer ?? mapInstance!);
      }
    } else if (mode === "circle") {
      if (!circleCenter) {
        circleCenter = e.latlng;
      } else {
        const radius = circleCenter.distanceTo(e.latlng);
        if (circlePreview) circlePreview.remove();
        circlePreview = L.circle(circleCenter, { radius, color: "#818CF8", fillOpacity: 0.15, weight: 2 }).addTo(userLayer ?? mapInstance!);
        const id = `draw_${Date.now()}`;
        drawnLayers.set(id, circlePreview);
        circleCenter = null;
        stopDraw();
      }
    }
  };

  mapInstance.on("click", drawClickHandler);
};

export const finishPolygon = () => {
  if (!mapInstance || polygonPoints.length < 3) return;
  if (polygonPreview) polygonPreview.remove();
  const poly = L.polygon(polygonPoints, { color: "#818CF8", fillOpacity: 0.15, weight: 2 }).addTo(userLayer ?? mapInstance);
  const id = `draw_${Date.now()}`;
  drawnLayers.set(id, poly);
  polygonPoints = [];
  stopDraw();
};

export const stopDraw = () => {
  drawingMode = null;
  if (mapInstance) {
    mapInstance.getContainer().style.cursor = "";
    if (drawClickHandler) { mapInstance.off("click", drawClickHandler); drawClickHandler = null; }
  }
};

export const clearDrawings = () => {
  drawnLayers.forEach((l) => l.remove());
  drawnLayers.clear();
  if (polygonPreview) { polygonPreview.remove(); polygonPreview = null; }
  if (circlePreview)  { circlePreview.remove();  circlePreview  = null; }
  polygonPoints = [];
  circleCenter  = null;
  stopDraw();
};

export const getDrawingMode = () => drawingMode;

// ── Misc ──────────────────────────────────────────────────────────────────────

export const getMapInstance = () => mapInstance;

export const setBasemap = (name: string) => {
  if (!mapInstance || !TILE_LAYERS[name]) return;
  if (TILE_LAYERS[currentBasemap]) mapInstance.removeLayer(TILE_LAYERS[currentBasemap]);
  TILE_LAYERS[name].addTo(mapInstance);
  currentBasemap = name;
};
