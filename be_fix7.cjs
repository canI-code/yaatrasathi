const fs = require('fs');
let code = fs.readFileSync('src/lib/leafletMap.ts', 'utf8');

const newInit = `
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
`;

code = code.replace(/export const initMap = \([\s\S]*?\}\);[\s\S]*?L\.tileLayer[\s\S]*?\}\);[\s\S]*?\};/, newInit);

fs.writeFileSync('src/lib/leafletMap.ts', code);
