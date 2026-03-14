const fs = require('fs');
let code = fs.readFileSync('src/pages/BudgetEstimator.tsx', 'utf8');

// For the main form (line 284), replace style={glassCard} with standard card styles since we don't have <Card> wrapped yet.
// Wait, I can just use <Card>!
code = code.replace(/<motion\.div\s*initial=\{\{ opacity: 0, y: 24 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: -20 \}\}\s*transition=\{\{ duration: 0\.4 \}\}\s*style=\{glassCard\}\s*>/, 
  "<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>\n<Card>");
code = code.replace(/<\/div>\s*<\/motion\.div>\s*\{\/\* ─── Loading State ─── \*\/\}/, 
  "</div>\n</Card>\n</motion.div>\n\n{/* ─── Loading State ─── */}");

// For glassCard definition, we'll keep it but modify AI-generated cards to use ai-hover-card
code = code.replace(/const glassCard: React\.CSSProperties = \{[\s\S]*?backdropFilter: "blur\(12px\)",\n\};/g, 
  "const glassCard: React.CSSProperties = {\n  background: \"transparent\",\n  border: \"1px solid rgba(0, 0, 0, 0.05)\",\n  borderRadius: \"16px\",\n  padding: \"28px\",\n  backdropFilter: \"blur(12px)\",\n  transition: \"all 0.2s ease\",\n};");

// Add style for hover to the document body or somewhere
let styles = `
      {/* CSS */}
      <style>{\`
        .ai-hover-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          border-radius: 16px;
          transition: all 0.2s ease !important;
        }
        .ai-hover-card:hover {
          background: rgba(42, 157, 143, 0.04) !important;
          border: 1px solid rgba(42, 157, 143, 0.3) !important;
        }
      \`}</style>
    </PageWrapper>
`;
code = code.replace(/<\/PageWrapper>/, styles);

// Replace style={{ ...glassCard }} with className="ai-hover-card" and remove ...glassCard
code = code.replace(/style=\{\{ \.\.\.glassCard,/g, 'className="ai-hover-card" style={{');

fs.writeFileSync('src/pages/BudgetEstimator.tsx', code);
