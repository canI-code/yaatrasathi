const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(/import \{ GetLocationButton \} from \"\.\.\/components\/ui\/Input\";/, 
  "import Input, { GetLocationButton } from \"../components/ui/Input\";\nimport Select from \"../components/ui/Select\";");

code = code.replace(/<GlassInput/g, "<Input");
code = code.replace(/<GlassSelect\n\s*value=\{([^}]+)\}\n\s*onChange=\{\(e\) => set([A-Za-z]+)\(e\.target\.value\)\}\n\s*options=\{([A-Z_]+)\}\n\s*\/>/g, 
  `<Select options={$3} value={$1} onChange={(e) => set$2(e.target.value)} />`);
  
// For single-line or slight variations of GlassSelect:
code = code.replace(/<GlassSelect\s+options=\{([A-Z_]+)\}\s+value=\{([^}]+)\}\s+onChange=\{\(e\) => set([A-Za-z]+)\(e\.target\.value\)\}\s*\/>/g, 
  `<Select options={$1} value={$2} onChange={(e) => set$3(e.target.value)} />`);

// Replace GlassSelect that might be formatted differently
code = code.replace(/<GlassSelect/g, "<Select");

// max limit on inputs
code = code.replace(/onChange=\{\(e\) => setDays\(Number\(e\.target\.value\)\)\}/g,
  `onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setDays(v); }}`);
code = code.replace(/onChange=\{\(e\) => setTravelers\(Number\(e\.target\.value\)\)\}/g,
  `onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setTravelers(v); }}`);

// add GetLocationButton
code = code.replace(/<Input\n\s*placeholder="e\.g\. Delhi, Mumbai"\n\s*value=\{source\}\n\s*onChange=\{\(e\) => setSource\(e\.target\.value\)\}\n\s*\/>/,
  `<Input placeholder="e.g. Delhi, Mumbai" value={source} onChange={(e) => setSource(e.target.value)} rightIcon={<GetLocationButton onLocation={setSource} />} />`);
code = code.replace(/<Input\n\s*placeholder="e\.g\. Goa, Kerala"\n\s*value=\{destination\}\n\s*onChange=\{\(e\) => setDestination\(e\.target\.value\)\}\n\s*\/>/,
  `<Input placeholder="e.g. Goa, Kerala" value={destination} onChange={(e) => setDestination(e.target.value)} rightIcon={<GetLocationButton onLocation={setDestination} />} />`);

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
