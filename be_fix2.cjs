const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

// remove them
code = code.replace(/const glassInput: React\.CSSProperties = \{[\s\S]*?boxSizing: "border-box",\n\};\n/g, "");
code = code.replace(/const GlassInput = \(props: React\.InputHTMLAttributes<HTMLInputElement>\) => \([\s\S]*?\n\);\n/g, "");
code = code.replace(/const GlassSelect = \([\s\S]*?<\/select>\n  \);\n\};\n/g, "");

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
