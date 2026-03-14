const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/<div[^>]*?>\s*<FieldLabel> Source City<\/FieldLabel>\s*<GlassInput\s*placeholder=\"e\.g\. Delhi, Mumbai, Bangalore\"\s*value=\{source\}\s*onChange=\{\(e\) => setSource\(e\.target\.value\)\}\s*hasError=\{.*\}\s*\/>\s*<\/div>/, '<Input label="Source City" placeholder="e.g. Delhi, Mumbai, Bangalore" value={source} onChange={(e) => setSource(e.target.value)} error={errors.source} />');

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
console.log('done');
