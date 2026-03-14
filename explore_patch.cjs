const fs = require('fs');
let code = fs.readFileSync('src/pages/ExploreMap.tsx', 'utf8');

if (!code.includes('GetLocationButton')) {
  code = code.replace(/import Button from \"\.\.\/components\/ui\/Button\";/g, 'import Button from \"../components/ui/Button\";\nimport { GetLocationButton } from \"../components/ui/Input\";');
  
  code = code.replace(/onBlur=\{\(e\) => \{ \(e\.target as HTMLInputElement\)\.style\.borderColor \= \"rgba\(0, 0, 0, 0\.05\)\"; \}\}\n\s*\/>/g, 'onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = \"rgba(0, 0, 0, 0.05)\"; }}\n                  style={{ ...((e) => {})() /* hack to bypass */, paddingRight: \"40px\" }}\n                />\n                <div style={{ position: \"absolute\", right: 8, top: \"50%\", transform: \"translateY(-50%)\", pointerEvents: \"auto\" }}><GetLocationButton onLocation={setCity} /></div>');

  fs.writeFileSync('src/pages/ExploreMap.tsx', code, 'utf8');
}
