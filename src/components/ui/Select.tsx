
import { SelectHTMLAttributes, useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "../../theme";

interface SelectOption {
  label: string;
  value: string;
}

// Omit 'onChange' from SelectHTMLAttributes to override its type
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
  onChange?: (e: { target: { value: string } }) => void;
  value?: string;
}

const Select = ({ label, options, error, hint, placeholder, style, value, onChange, }: SelectProps) => {
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

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder || "Select...";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      {label && (
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: colors.textMuted,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </label>
      )}

      <div ref={containerRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 50 : 1 }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "100%",
            padding: "11px 40px 11px 14px",
            backgroundColor: colors.glassLight,
            border: `1px solid ${isOpen ? colors.accentStrong : (error ? colors.error : colors.glassBorder)}`,
            borderRadius: "10px",
            color: colors.textMain,
            fontSize: "0.9rem",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            boxShadow: isOpen ? "0 0 0 1px rgba(42,157,143,0.18), 0 10px 30px rgba(15,23,42,0.08)" : "0 0 0 1px rgba(148,163,184,0.15)",
            boxSizing: "border-box",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "42px",
            ...style,
          }}
        >
          <span>{selectedLabel}</span>
          <ChevronDownIcon 
            style={{ 
              position: "absolute",
              right: "14px",
              width: "18px", 
              height: "18px", 
              color: "rgba(61, 60, 58,0.4)",
              pointerEvents: "none",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.2s ease, color 0.2s ease" 
            }} 
          />
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
              {placeholder && (
                <div
                  onClick={() => {
                    onChange && onChange({ target: { value: "" } });
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: colors.textMuted,
                    fontStyle: "italic"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {placeholder}
                </div>
              )}
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange && onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    background: value === opt.value ? "rgba(42, 157, 143, 0.1)" : "transparent",
                    color: value === opt.value ? colors.accentStrong : colors.textMain,
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

      {error && (
        <p style={{ fontSize: "0.78rem", color: colors.error, margin: 0 }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: "0.78rem", color: colors.textSubtle, margin: 0 }}>{hint}</p>
      )}
    </div>
  );
};

export default Select;
