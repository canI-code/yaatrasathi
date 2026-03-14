const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

code = code.replace(
  /<FieldLabel>\s*Number of Days[\\s\\S]*?<\/div>\s*<\/div>/g,
  '<FieldLabel>Number of Days</FieldLabel>\n                  <GlassInput\n                    type=\"number\"\n                    min={1}\n                    max={999}\n                    value={days}\n                    onChange={(e) => setDays(Number(e.target.value))}\n                  />\n                </div>'
);

code = code.replace(
  /<FieldLabel>\s*Travelers[\\s\\S]*?<\/div>\s*<\/div>/g,
  '<FieldLabel>Travelers</FieldLabel>\n                  <GlassInput\n                    type=\"number\"\n                    min={1}\n                    max={999}\n                    value={travelers}\n                    onChange={(e) => setTravelers(Number(e.target.value))}\n                  />\n                </div>'
);

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code, 'utf8');
