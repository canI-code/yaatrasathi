const fs = require('fs');

let tp = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

// 1. imports
tp = tp.replace(/import \{ GetLocationButton \} from \"\.\.\/components\/ui\/Input\";/g, 'import Input, { GetLocationButton } from \"../components/ui/Input\";\\nimport Select from \"../components/ui/Select\";\\nimport Card from \"../components/ui/Card\";');

// 2. remove GlassInput & CustomSelect
tp = tp.replace(/const FieldLabel =.*?\n\);\n\n\/\/ Glassmorphism input[\s\S]*?(?=\r?\n\/\/ Day accordion card)/, '');

// 3. Persist plan
tp = tp.replace(/const \[plan, setPlan\] = useState\<TripPlan \| null>\(null\);/g, 'const [plan, setPlan] = useState<TripPlan | null>(() => { try { const saved = sessionStorage.getItem(\"yatrasathi_trip_plan\"); return saved ? JSON.parse(saved) : null; } catch { return null; } });');

tp = tp.replace(/setPlan\(result\);/g, 'setPlan(result);\\n      sessionStorage.setItem(\"yatrasathi_trip_plan\", JSON.stringify(result));');
tp = tp.replace(/setPlan\(null\);/g, 'setPlan(null);\\n    sessionStorage.removeItem(\"yatrasathi_trip_plan\");');

// 4. Update the form visibility
tp = tp.replace(/\{\!loading && \!plan && \(/g, '{true && (');

// 5. Update form Card
tp = tp.replace(/<div\n\s*style=\{\{\n\s*padding: \"clamp\(24px, 4vw, 40px\)\",\n\s*borderRadius: \"28px\",\n\s*background: \"rgba\(255, 255, 255, 0\.8\)\",[\s\S]*?boxShadow: \"0 2px 8px rgba\(0, 0, 0, 0\.04\)\",\n\s*\}\}\n\s*>/, '<Card padding=\"clamp(24px, 4vw, 40px)\">');

// We have </div> closing this block, we will change it to </Card> later or we can just leave it as div because we just replaced the opening tag. Wait, <Card renders as <motion.div so replacing div with Card means replacing closing </div> with </Card>.
// Alternatively, keep div but give it standard styles. The styles are ALREADY "rgba(255, 255, 255, 0.8)", border: 0.08, shadow: 0.04.
// So let's NOT change the wrapper div to Card. Let's just fix the Inputs.

fs.writeFileSync('src/pages/TripPlanner.tsx', tp);
console.log("Stage 1 done");
