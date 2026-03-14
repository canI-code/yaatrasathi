const fs = require('fs');
let content = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

// The main form container in TripPlanner has:
// background: "rgba(0, 0, 0, 0.05)",
// backdropFilter: "blur(24px)",
// border: "1px solid rgba(0, 0, 0, 0.05)",
// boxShadow: "0 16px 64px rgba(0,0,0,0.35)",

content = content.replace(
  /background: "rgba\(0, 0, 0, 0\.05\)",\s*backdropFilter: "blur\(24px\)",\s*WebkitBackdropFilter: "blur\(24px\)",\s*border: "1px solid rgba\(0, 0, 0, 0\.05\)",\s*boxShadow: "0 16px 64px rgba\(0,0,0,0\.35\)",/g,
  `background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",`
);

// Look for Day accordion styles if they have heavy shadows
content = content.replace(
  /boxShadow: isOpen \? "0 12px 48px rgba\(42, 157, 143,0.1\)" : "0 4px 20px rgba\(0,0,0,0.2\)",/g,
  `boxShadow: isOpen ? "0 2px 8px rgba(42, 157, 143, 0.1)" : "0 2px 8px rgba(0, 0, 0, 0.04)",`
);

fs.writeFileSync('src/pages/TripPlanner.tsx', content, 'utf8');
