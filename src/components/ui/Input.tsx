import { InputHTMLAttributes, ReactNode, useState } from "react";
import { colors } from "../../theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = ({ label, error, hint, leftIcon, rightIcon, style, ...rest }: InputProps) => {
  const [focused, setFocused] = useState(false);

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

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {leftIcon && (
          <div
            style={{
              position: "absolute",
              left: "14px",
              color: focused ? "#2A9D8F" : "rgba(61, 60, 58,0.4)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s ease",
              pointerEvents: "none",
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: leftIcon ? "11px 14px 11px 44px" : "11px 14px",
            paddingRight: rightIcon ? "44px" : "14px",
            backgroundColor: colors.glassLight,
            border: `1px solid ${focused ? colors.accentStrong : colors.glassBorder}`,
            borderRadius: "10px",
            color: colors.textMain,
            fontSize: "0.9rem",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            boxShadow: focused ? "0 0 0 1px rgba(42,157,143,0.18), 0 10px 30px rgba(15,23,42,0.08)" : "0 0 0 1px rgba(148,163,184,0.15)",
            ...style,
          }}
          {...rest}
        />

        {rightIcon && (
          <div
            style={{
              position: "absolute",
              right: "14px",
              color: "rgba(61, 60, 58,0.4)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightIcon}
          </div>
        )}
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


export const GetLocationButton = ({ onLocation }: { onLocation: (loc: string) => void }) => {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
              if (city) onLocation(city);
            } catch (err) {
              console.error(err);
              const loc = window.prompt("Could not fetch location. Please enter manually:");
              if (loc) onLocation(loc);
            }
            setLoading(false);
          },
          (err) => {
            console.error(err);
            setLoading(false);
            const loc = window.prompt("Location access denied/failed. Please enter manually:");
            if (loc) onLocation(loc);
          }
        );
      }}
      title="Use Current Location"
      style={{
        background: "transparent",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        color: loading ? "rgba(42, 157, 143, 0.5)" : "#2A9D8F",
        pointerEvents: "auto",
        transition: "color 0.2s"
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
        {loading ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.818.818m6-6a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </>
        )}
      </svg>
    </button>
  );
};
export default Input;
