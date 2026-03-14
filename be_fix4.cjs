const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(/import Select from "\.\.\/components\/ui\/Select";/, 
  "import Select from \"../components/ui/Select\";\nimport Card from \"../components/ui/Card\";");

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
