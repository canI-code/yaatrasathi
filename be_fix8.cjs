const fs = require('fs');
let code = fs.readFileSync('src/pages/FoodGuide.tsx', 'utf8');
code = code.replace(/<Input[^>]*?rightIcon=.*?handleSearch\(\)\}/g, 
  "<Input\n  placeholder=\"Enter a city (e.g., Delhi, Mumbai, Paris)\"\n  value={destination}\n  onChange={(e) => setDestination(e.target.value)}\n  onKeyDown={(e) => e.key === \"Enter\" && handleSearch()}\n  rightIcon={<GetLocationButton onLocation={setDestination} />}");
fs.writeFileSync('src/pages/FoodGuide.tsx', code);
// check safety guide
code = fs.readFileSync('src/pages/SafetyGuide.tsx', 'utf8');
code = code.replace(/<Input[^>]*?rightIcon=.*?handleSearch\(\)\}/g, 
  "<Input\n  placeholder=\"Enter a city or place (e.g. Rio de Janeiro)\"\n  value={destination}\n  onChange={(e) => setDestination(e.target.value)}\n  onKeyDown={(e) => e.key === \"Enter\" && handleSearch()}\n  rightIcon={<GetLocationButton onLocation={setDestination} />}");
fs.writeFileSync('src/pages/SafetyGuide.tsx', code);
// check best time
code = fs.readFileSync('src/pages/BestTime.tsx', 'utf8');
code = code.replace(/<Input[^>]*?rightIcon=.*?handleSearch\(\)\}/g, 
  "<Input\n  placeholder=\"Enter destination (e.g. Ladakh, Jammu & Kashmir)\"\n  value={destination}\n  onChange={(e) => setDestination(e.target.value)}\n  onKeyDown={(e) => e.key === \"Enter\" && handleSearch()}\n  rightIcon={<GetLocationButton onLocation={setDestination} />}");
fs.writeFileSync('src/pages/BestTime.tsx', code);
