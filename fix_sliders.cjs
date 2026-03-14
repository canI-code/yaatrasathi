const fs = require('fs');

function fixSliders(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Days Slider
  content = content.replace(
    /<FieldLabel> Number of Days: <span[^>]+>\{days\}<\/span><\/FieldLabel>\s*<input\s*type="range"\s*min=\{1\}\s*max=\{[0-9]+\}\s*value=\{days\}\s*onChange=\{\(e\) => setDays\(Number\(e\.target\.value\)\)\}\s*style=\{\{[\s\S]*?\}\}\s*\/>/g,
    `<FieldLabel> Number of Days</FieldLabel>
                      <GlassInput
                        type="number"
                        min={1}
                        max={999}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        placeholder="e.g. 5"
                      />`
  );

  // Travelers Slider
  content = content.replace(
    /<FieldLabel> Number of Travellers: <span[^>]+>\{travelers\}<\/span><\/FieldLabel>\s*<input\s*type="range"\s*min=\{1\}\s*max=\{[0-9]+\}\s*value=\{travelers\}\s*onChange=\{\(e\) => setTravelers\(Number\(e\.target\.value\)\)\}\s*style=\{\{[\s\S]*?\}\}\s*\/>/g,
    `<FieldLabel> Number of Travellers</FieldLabel>
                      <GlassInput
                        type="number"
                        min={1}
                        max={999}
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        placeholder="e.g. 2"
                      />`
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

fixSliders('src/pages/TripPlanner.tsx');
if (fs.existsSync('src/pages/BudgetEstimator.tsx')) {
  fixSliders('src/pages/BudgetEstimator.tsx');
}
console.log('Sliders fixed');
