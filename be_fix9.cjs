const fs = require('fs');
['src/pages/FoodGuide.tsx', 'src/pages/SafetyGuide.tsx', 'src/pages/BestTime.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/onKeyDown=\{\(e\) = rightIcon=\{<GetLocationButton onLocation=\{setDestination\} \/>\} \/> e\.key === \"Enter\" && handleSearch\(\)\}/g, 
    'onKeyDown={(e) => e.key === "Enter" && handleSearch()} rightIcon={<GetLocationButton onLocation={setDestination} />}');
  fs.writeFileSync(file, content);
});
