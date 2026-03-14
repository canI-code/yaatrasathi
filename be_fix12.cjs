const fs = require('fs');
let code = fs.readFileSync('src/lib/leafletMap.ts', 'utf8');

code = code.replace(/export const flyTo = \(lat: number, lng: number, zoom = 13\) => \{[\s\S]*?\};/, 
  "export const flyTo = (center: [number, number], zoom = 13) => {\n  if (mapInstance) mapInstance.flyTo([center[1], center[0]], zoom);\n};");

fs.writeFileSync('src/lib/leafletMap.ts', code);
