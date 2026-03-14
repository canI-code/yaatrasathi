const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/hasError=\{!!errors\.source\}/g, 'error={errors.source}');
code = code.replace(/hasError=\{!!errors\.destination\}/g, 'error={errors.destination}');
// Let's add GetLocationButton
code = code.replace(/<Input\s*placeholder="e\.g\. Delhi, Mumbai, Bangalore"\s*value=\{source\}\s*onChange=\{\(e\) => setSource\(e\.target\.value\)\}\s*error=\{errors\.source\}\s*\/>/,
  `<Input placeholder="e.g. Delhi, Mumbai, Bangalore" value={source} onChange={(e) => setSource(e.target.value)} error={errors.source} rightIcon={<GetLocationButton onLocation={setSource} />} />`);
code = code.replace(/<Input\s*placeholder="e\.g\. Goa, Manali, Kerala"\s*value=\{destination\}\s*onChange=\{\(e\) => setDestination\(e\.target\.value\)\}\s*error=\{errors\.destination\}\s*\/>/,
  `<Input placeholder="e.g. Goa, Manali, Kerala" value={destination} onChange={(e) => setDestination(e.target.value)} error={errors.destination} rightIcon={<GetLocationButton onLocation={setDestination} />} />`);

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
