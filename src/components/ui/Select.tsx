
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
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1px solid ${isOpen ? "rgba(42, 157, 143, 0.45)" : (error ? colors.error : "rgba(0, 0, 0, 0.08)")}`,
            borderRadius: "12px",
            color: colors.textMain,
            fontSize: "0.9rem",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            transition: "border-color 0.25s ease",
            boxShadow: "none",
            boxSizing: "border-box" as const,
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
              color: colors.textSubtle,
              pointerEvents: "none",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.25s ease" 
            }} 
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "14px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                zIndex: 50,
                maxHeight: "250px",
                overflowY: "auto",
                padding: "6px 0"
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
                    color: colors.textSubtle,
                    fontStyle: "italic",
                    transition: "background 0.2s ease",
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
                    background: value === opt.value ? "rgba(42, 157, 143, 0.08)" : "transparent",
                    color: value === opt.value ? colors.accentStrong : colors.textMain,
                    transition: "background 0.2s ease",
                    borderRadius: "8px",
                    margin: "0 4px",
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
