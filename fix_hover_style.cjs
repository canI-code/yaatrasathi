const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/\"&\:hover\": \{ background: \"rgba\(42, 157, 143, 0\.02\)\" \},/g, "");

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
