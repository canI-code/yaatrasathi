import { Link } from "react-router-dom";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { colors } from "../../theme";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "transparent",
        padding: "40px 24px 24px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "32px",
            marginBottom: "28px",
            padding: "20px 24px",
            borderRadius: "24px",
            backgroundColor: "rgba(246,249,252,0.9)",
            border: `1px solid ${colors.glassBorder}`,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: colors.accentStrong,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PaperAirplaneIcon style={{ width: 18, height: 18, color: colors.background }} />
              </div>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: colors.textMain,
                }}
              >
                YatraSathi
              </span>
            </div>
            <p style={{ color: colors.textMuted, fontSize: "0.85rem", lineHeight: 1.6 }}>
              Your AI-powered travel companion. Plan smarter, explore further.
            </p>
          </div>

          {/* Pages column 1 */}
          <div>
            <p style={{ color: "#2A9D8F", fontWeight: 600, marginBottom: "12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Features
            </p>
            {[
              { label: "Trip Planner", path: "/planner" },
              { label: "Budget Estimator", path: "/budget" },
              { label: "Hotels", path: "/hotels" },
              { label: "Food Guide", path: "/food" },
              { label: "Transport", path: "/transport" },
            ].map((l) => (
              <div key={l.path} style={{ marginBottom: "8px" }}>
                <Link
                  to={l.path}
                  style={{
                    color: colors.textMuted,
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#2A9D8F")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(61, 60, 58,0.55)")}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Pages column 2 */}
          <div>
            <p style={{ color: "#2A9D8F", fontWeight: 600, marginBottom: "12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Explore
            </p>
            {[
              { label: "Safety Guide", path: "/safety" },
              { label: "Best Time to Visit", path: "/best-time" },
              { label: "Weather", path: "/weather" },
              { label: "Interactive Map", path: "/map" },
            ].map((l) => (
              <div key={l.path} style={{ marginBottom: "8px" }}>
                <Link
                  to={l.path}
                  style={{
                    color: colors.textMuted,
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#2A9D8F")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(61, 60, 58,0.55)")}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div>
            <p style={{ color: "#2A9D8F", fontWeight: 600, marginBottom: "12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Powered by AI
            </p>
            <p style={{ color: colors.textMuted, fontSize: "0.82rem", lineHeight: 1.6 }}>
              Leveraging Groq AI for lightning-fast travel planning, Mapbox for interactive maps, and real-time weather data.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
            paddingTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Hackathon credit */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              padding: "12px 0",
              borderRadius: "12px",
              background: "#F0F4F8",
              border: "1px solid rgba(42, 157, 143,0.1)",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: colors.textMuted, fontWeight: 600 }}>
               Built for <span style={{ color: colors.accentStrong }}>Cylsys AI Hackathon 2025</span>
            </span>
            <span style={{ color: colors.textSubtle, fontSize: "0.7rem" }}>|</span>
            <span style={{ fontSize: "0.78rem", color: colors.textSubtle }}>
              Powered by{" "}
              <span style={{ color: colors.accentSoft, fontWeight: 600 }}>Groq</span>
              {" "}·{" "}
              <span style={{ color: colors.accentSoft, fontWeight: 600 }}>Mapbox</span>
              {" "}·{" "}
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>OpenWeather</span>
            </span>
          </div>

          {/* Copyright row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <p style={{ color: colors.textSubtle, fontSize: "0.78rem" }}>
              © {year} YatraSathi. All rights reserved.
            </p>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: "0.75rem", color: colors.accentStrong }}
            >
               Plan smarter. Travel better.
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
