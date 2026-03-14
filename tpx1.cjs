const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

const oldBlock = code.match(/const handleCopy = async \(\) => \{[\s\S]*?setCopied\(true\);/)[0];

const newBlock = \const handleCopy = async () => {
    if (!plan) return;
    const text = plan.itinerary.map((d) =>
      \\\Day \: \\\n\\\n\\\nMorning: \\\nAfternoon: \\\nEvening: \\\nFood: \\\\
    ).join("\\n---\\n");
    await navigator.clipboard.writeText(\\\YatraSathi Trip Plan: \ -> \ (\ days)\\n\\n\\\n\\nTips:\\n\\\\);
    setCopied(true);\;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
