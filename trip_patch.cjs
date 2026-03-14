const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(
  /<GlassInput\s+placeholder=\"e\.g\. Delhi, Mumbai, Bangalore\"\s+value=\{source\}\s+onChange=\{\(e\) => setSource\(e\.target\.value\)\}\s+hasError=\{error \=\=\= \"Please fill in all fields\" \&\& \!source\}\s+\/>/g,
  '<div style={{ position: \"relative\" }}>\n                      <GlassInput\n                        placeholder=\"e.g. Delhi, Mumbai, Bangalore\"\n                        value={source}\n                        onChange={(e) => setSource(e.target.value)}\n                        hasError={error === \"Please fill in all fields\" && !source}\n                        style={{ paddingRight: \"40px\" }}\n                      />\n                      <div style={{ position: \"absolute\", right: 8, top: \"50%\", transform: \"translateY(-50%)\" }}><GetLocationButton onLocation={setSource} /></div>\n                    </div>'
);

code = code.replace(
  /<GlassInput\s+placeholder=\"e\.g\. Goa, Manali, Kerala\"\s+value=\{destination\}\s+onChange=\{\(e\) => setDestination\(e\.target\.value\)\}\s+hasError=\{error \=\=\= \"Please fill in all fields\" \&\& \!destination\}\s+\/>/g,
  '<div style={{ position: \"relative\" }}>\n                      <GlassInput\n                        placeholder=\"e.g. Goa, Manali, Kerala\"\n                        value={destination}\n                        onChange={(e) => setDestination(e.target.value)}\n                        hasError={error === \"Please fill in all fields\" && !destination}\n                        style={{ paddingRight: \"40px\" }}\n                      />\n                      <div style={{ position: \"absolute\", right: 8, top: \"50%\", transform: \"translateY(-50%)\" }}><GetLocationButton onLocation={setDestination} /></div>\n                    </div>'
);

fs.writeFileSync('src/pages/TripPlanner.tsx', code, 'utf8');
