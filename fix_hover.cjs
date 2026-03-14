const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/const DayAccordion = \(\{ day, index, isOpen, onToggle \}: \{/g, 
  "const DayAccordion = ({ day, index, isOpen, onToggle }: {");
code = code.replace(/<motion\.div\s*initial=\{\{ opacity: 0, y: 16 \}\}/g, 
  "<motion.div\n    className=\"ai-hover-card\"\n    initial={{ opacity: 0, y: 16 }}");

let styles = `
      {/* Range slider thumb style */}
      <style>{\`
        .ai-hover-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s ease !important;
        }
        .ai-hover-card:hover {
          background: rgba(42, 157, 143, 0.04) !important;
          border: 1px solid rgba(42, 157, 143, 0.3) !important;
        }
`;
code = code.replace(/\{\/\* Range slider thumb style \*\/\}\s*<style>\{\`/g, styles);

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
