const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(/const \[budget, setBudget\] = useState<BudgetBreakdown \| null>\(null\);/, 
  `const [budget, setBudget] = useState<BudgetBreakdown | null>(() => { try { const saved = sessionStorage.getItem("yatrasathi_budget"); if (saved) return JSON.parse(saved); } catch { } return null; });`);

code = code.replace(/setBudget\(bk\);/, 
  "setBudget(bk); sessionStorage.setItem('yatrasathi_budget', JSON.stringify(bk));");

code = code.replace(/setBudget\(null\);/g, 
  "setBudget(null); sessionStorage.removeItem('yatrasathi_budget');");

// keep form visible:
// in BudgetEstimator it has { !budget && !loading && ( ... form ... )} ? Let me check.
fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
