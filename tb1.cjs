const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

// Replace everything between const handleCopy = async () => { ... setCopied(true);
let oldBlockMatches = code.match(/const handleCopy = async \(\) => \{[\s\S]*?setCopied\(true\);/);
if(oldBlockMatches) {
  let repl = "const handleCopy = async () => {\n" +
             "    if (!plan) return;\n" +
             "    const text = plan.itinerary.map((d) =>\n" +
             "      Day : \\n\\n\\nMorning: \\nAfternoon: \\nEvening: \\nFood: \n" +
             "    ).join('\\n---\\n');\n" +
             "    await navigator.clipboard.writeText(YatraSathi Trip Plan:  ->  ( days)\\n\\n\\n\\nTips:\\n);\n" +
             "    setCopied(true);";
  code = code.replace(oldBlockMatches[0], repl);
  fs.writeFileSync('src/pages/TripPlanner.tsx', code, 'utf8');
}
