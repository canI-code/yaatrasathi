const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(/\{!loading && !budget && \(/g, "{true && (");

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
