const fs = require('fs');
['src/pages/BestTime.tsx', 'src/pages/FoodGuide.tsx', 'src/pages/SafetyGuide.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Inject rightIcon into Input
  content = content.replace(/<(Input[^>]*?placeholder="[^"]+"[^>]*?value=\{destination\}[^>]*?onChange=\{[^\}]+\}[^>]*?)\/?>/g, 
    "<$1 rightIcon={<GetLocationButton onLocation={setDestination} />} />");

  // Keep form alive if it wasn't already (BestTime, etc. usually always have it)
  // Let's add session storage for 'seasons' in BestTime
  if(file.includes('BestTime')) {
    content = content.replace(/const \[seasons\, setSeasons\] = useState<BestTimeInfo\[\]>\(\[\]\);/, 
      `const [seasons, setSeasons] = useState<BestTimeInfo[]>(() => { try { const s = sessionStorage.getItem('ys_besttime'); return s ? JSON.parse(s) : []; } catch { return []; } });`);
    content = content.replace(/setSeasons\(result\);/, 
      "setSeasons(result); sessionStorage.setItem('ys_besttime', JSON.stringify(result));");
  }

  // SafetyGuide uses `guidelines`
  if(file.includes('SafetyGuide')) {
    content = content.replace(/const \[guidelines\, setGuidelines\] = useState<SafetyGuideData \| null>\(null\);/, 
      `const [guidelines, setGuidelines] = useState<SafetyGuideData | null>(() => { try { const s = sessionStorage.getItem('ys_safety'); return s ? JSON.parse(s) : null; } catch { return null; } });`);
    content = content.replace(/setGuidelines\(result\);/, 
      "setGuidelines(result); sessionStorage.setItem('ys_safety', JSON.stringify(result));");
  }
  
  // FoodGuide uses `foodGuide`
  if(file.includes('FoodGuide')) {
    content = content.replace(/const \[foodGuide\, setFoodGuide\] = useState<FoodGuideData \| null>\(null\);/, 
      `const [foodGuide, setFoodGuide] = useState<FoodGuideData | null>(() => { try { const s = sessionStorage.getItem('ys_food'); return s ? JSON.parse(s) : null; } catch { return null; } });`);
    content = content.replace(/setFoodGuide\(result\);/, 
      "setFoodGuide(result); sessionStorage.setItem('ys_food', JSON.stringify(result));");
  }

  fs.writeFileSync(file, content);
});
