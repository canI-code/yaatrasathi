const fs = require('fs');
let content = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

const customSelectCode = `
// Custom Select Component
const CustomSelect = ({ value, onChange, options, placeholder = "Select..." }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 50 : 1 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "12px",
          background: "rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          color: "#3D3C3A",
          fontSize: "0.92rem",
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDownIcon style={{ width: 16, height: 16, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.05)",
              zIndex: 50,
              maxHeight: "250px",
              overflowY: "auto",
              padding: "8px 0"
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  background: value === opt.value ? "rgba(42, 157, 143, 0.1)" : "transparent",
                  color: value === opt.value ? "#2A9D8F" : "#3D3C3A",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

content = content.replace(
  /const GlassSelect = \(props:(.+?)\) => \([\s\S]+?<\/select>[\s\S]+?\);/,
  customSelectCode
);

content = content.replace(
  /<GlassSelect value=\{budgetLevel\} onChange=\{\(e\) =>\n?\s*setBudgetLevel\(e\.target\.value\)\}>[\s\S]*?<\/GlassSelect>/g,
  '<CustomSelect value={budgetLevel} onChange={(val) => setBudgetLevel(val)} options={BUDGET_OPTIONS} />'
);

content = content.replace(
  /<GlassSelect value=\{travelStyle\} onChange=\{\(e\) =>\n?\s*setTravelStyle\(e\.target\.value\)\}>[\s\S]*?<\/GlassSelect>/g,
  '<CustomSelect value={travelStyle} onChange={(val) => setTravelStyle(val)} options={STYLE_OPTIONS} />'
);

content = content.replace(
  /<GlassSelect value=\{foodPref\} onChange=\{\(e\) =>\n?\s*setFoodPref\(e\.target\.value\)\}>[\s\S]*?<\/GlassSelect>/g,
  '<CustomSelect value={foodPref} onChange={(val) => setFoodPref(val)} options={FOOD_OPTIONS} />'
);

fs.writeFileSync('src/pages/TripPlanner.tsx', content, 'utf8');
console.log('done');
