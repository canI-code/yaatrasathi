const fs = require('fs');
let code = fs.readFileSync('src/lib/leafletMap.ts', 'utf8');

code = code.replace(/export const geocodeCity = async/g, `export const flyTo = (lat: number, lng: number, zoom = 13) => {
  if (mapInstance) mapInstance.flyTo([lat, lng], zoom);
};

export const geocodeCity = async`);

fs.writeFileSync('src/lib/leafletMap.ts', code);
