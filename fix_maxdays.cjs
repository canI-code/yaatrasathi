const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/onChange=\{\(e\) \=\> setDays\(Number\(e\.target\.value\)\)\}/g,
  `onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setDays(v); }}`);
code = code.replace(/onChange=\{\(e\) \=\> setTravelers\(Number\(e\.target\.value\)\)\}/g,
  `onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setTravelers(v); }}`);

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
