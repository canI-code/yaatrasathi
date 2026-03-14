const fs = require('fs');

function fix(file, icon) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(`leftIcon=\\{<${icon} style=\\{\\{ width: 18, height: 18 \\}\\}  rightIcon=\\{<GetLocationButton onLocation=\\{setDestination\\} \\/>\\} \\/>\\}`), `leftIcon={<${icon} style={{ width: 18, height: 18 }} />}`);
  fs.writeFileSync(file, content);
}

fix('src/pages/BestTime.tsx', 'SunIcon');
fix('src/pages/SafetyGuide.tsx', 'ShieldCheckIcon');
// wait, wait! The rightIcon should be on the Input!
