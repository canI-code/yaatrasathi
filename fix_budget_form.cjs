const fs = require('fs');
let content = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

content = content.replace(
  /const glassCard: React.CSSProperties = {\n\s*background: "rgba\(0, 0, 0, 0\.05\)",\n\s*border: "1px solid rgba\(0, 0, 0, 0\.05\)",\n\s*borderRadius: "16px",\n\s*backdropFilter: "blur\(20px\)",\n\s*WebkitBackdropFilter: "blur\(20px\)",\n\s*boxShadow: "0 8px 32px rgba\(0, 0, 0, 0\.1\)",\n};/g,
  `const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};`
);

content = content.replace(
  /whileHover=\{\{ y: -6, boxShadow: "0 16px 40px rgba\(42, 157, 143,0.18\)" \}\}/g,
  ''
);

fs.writeFileSync('src/pages/BudgetEstimator.tsx', content, 'utf8');
console.log('Budget updated');
