const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/background: isOpen[\s\S]*?\: "rgba\(0, 0, 0, 0\.05\)",/g, 
  "background: isOpen\n        ? \"rgba(42, 157, 143, 0.04)\"\n        : \"transparent\",\n      \"&:hover\": { background: \"rgba(42, 157, 143, 0.02)\" },");
code = code.replace(/background: active \? "rgba\(42, 157, 143, 0\.1\)" \: "rgba\(0, 0, 0, 0\.05\)",/g, 
  "background: active ? \"rgba(42, 157, 143, 0.1)\" : \"transparent\",");
code = code.replace(/border: isOpen \? "1px solid rgba\(42, 157, 143,0\.3\)" : "1px solid rgba\(0, 0, 0, 0\.05\)",/g, 
  "border: isOpen ? \"1px solid rgba(42, 157, 143,0.3)\" : \"1px solid rgba(0, 0, 0, 0.05)\",");


fs.writeFileSync('src/pages/TripPlanner.tsx', code);
