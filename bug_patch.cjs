const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(
  /<GlassInput\s+placeholder=\"e\.g\. Mumbai, Delhi\"\s+value=\{source\}\s+onChange=\{\(e\) => setSource\(e\.target\.value\)\}\s+\/>/g,
  '<div style={{ position: \"relative\" }}>\n                      <GlassInput\n                        placeholder=\"e.g. Mumbai, Delhi\"\n                        value={source}\n                        onChange={(e) => setSource(e.target.value)}\n                        style={{ paddingRight: \"40px\" }}\n                      />\n                      <div style={{ position: \"absolute\", right: 8, top: \"50%\", transform: \"translateY(-50%)\" }}><GetLocationButton onLocation={setSource} /></div>\n                    </div>'
);

code = code.replace(
  /<GlassInput\s+placeholder=\"e\.g\. Goa, Manali, Jaipur\"\s+value=\{destination\}\s+onChange=\{\(e\) => setDestination\(e\.target\.value\)\}\s+hasError=\{error \=\=\= \"Please enter a destination\" \&\& \!destination\}\s+\/>/g,
  '<div style={{ position: \"relative\" }}>\n                      <GlassInput\n                        placeholder=\"e.g. Goa, Manali, Jaipur\"\n                        value={destination}\n                        onChange={(e) => setDestination(e.target.value)}\n                        hasError={error === \"Please enter a destination\" && !destination}\n                        style={{ paddingRight: \"40px\" }}\n                      />\n                      <div style={{ position: \"absolute\", right: 8, top: \"50%\", transform: \"translateY(-50%)\" }}><GetLocationButton onLocation={setDestination} /></div>\n                    </div>'
);

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code, 'utf8');
