const fs = require('fs');
const files = ['BestTime', 'FoodGuide', 'Hotels', 'SafetyGuide', 'TravelOptions'];

files.forEach(f => {
  const p = 'src/pages/' + f + '.tsx';
  let code = fs.readFileSync(p, 'utf8');
  if(!code.includes('GetLocationButton')) {
    code = code.replace(/import Input from \"\.\.\/components\/ui\/Input\";/, 'import Input, { GetLocationButton } from \"../components/ui/Input\";');
    
    code = code.replace(/label=\"Destination\"\s*placeholder=\"[^\"]+\"\s*value=\{destination\}\s*onChange=\{\(e\) => setDestination\(e\.target\.value\)\}/g, 'script.js& rightIcon={<GetLocationButton onLocation={setDestination} />}');
    
    code = code.replace(/label=\"City\"\s*placeholder=\"[^\"]+\"\s*value=\{city\}\s*onChange=\{\(e\) => setCity\(e\.target\.value\)\}/g, 'script.js& rightIcon={<GetLocationButton onLocation={setCity} />}');

    code = code.replace(/label=\"Source City\"\s*placeholder=\"[^\"]+\"\s*value=\{source\}\s*onChange=\{\(e\) => setSource\(e\.target\.value\)\}/g, 'script.js& rightIcon={<GetLocationButton onLocation={setSource} />}');
    
    fs.writeFileSync(p, code, 'utf8');
  }
});
