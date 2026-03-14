const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/await navigator\.clipboard\.writeText\([\s\S]*?const handleShare/, 
  "await navigator.clipboard.writeText(`YatraSathi Trip Plan: ${source} -> ${destination} (${days} days)\\n\\n${text}\\n\\nTips:\\n${plan.tips?.join('\\n')}`);\n    setCopied(true);\n    setTimeout(() => setCopied(false), 2500);\n  };\n\n  const handleShare");

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
