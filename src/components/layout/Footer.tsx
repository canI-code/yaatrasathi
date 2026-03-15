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
        padding: "48px 24px 28px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "36px",
            marginBottom: "32px",
            padding: "28px 28px",
            borderRadius: "22px",
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid rgba(164, 216, 225, 0.25)`,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
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
                <PaperAirplaneIcon style={{ width: 18, height: 18, color: "#ffffff" }} />
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
            <p style={{ color: colors.textMuted, fontSize: "0.85rem", lineHeight: 1.7 }}>
              Your AI-powered travel companion. Plan smarter, explore further.
            </p>
          </div>

          {/* Pages column 1 */}
          <div>
            <p style={{ color: colors.accentStrong, fontWeight: 600, marginBottom: "14px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                    transition: "color 0.25s ease",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = colors.accentStrong)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = colors.textMuted)}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Pages column 2 */}
          <div>
            <p style={{ color: colors.accentStrong, fontWeight: 600, marginBottom: "14px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                    transition: "color 0.25s ease",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = colors.accentStrong)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = colors.textMuted)}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div>
            <p style={{ color: colors.accentStrong, fontWeight: 600, marginBottom: "14px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Powered by AI
            </p>
            <p style={{ color: colors.textMuted, fontSize: "0.83rem", lineHeight: 1.7 }}>
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
            gap: "14px",
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
              padding: "14px 0",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.35)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 0, 0, 0.04)",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: colors.textMuted, fontWeight: 600 }}>
               Built for <span style={{ color: colors.accentStrong }}>Cylsys AI Hackathon 2025</span>
            </span>
            <span style={{ color: colors.textSubtle, fontSize: "0.7rem" }}>|</span>
            <span style={{ fontSize: "0.78rem", color: colors.textSubtle }}>
              Powered by{" "}
              <span style={{ color: colors.accentStrong, fontWeight: 600 }}>Groq</span>
              {" "}·{" "}
              <span style={{ color: colors.accentStrong, fontWeight: 600 }}>Mapbox</span>
              {" "}·{" "}
              <span style={{ color: "#0EA5E9", fontWeight: 600 }}>OpenWeather</span>
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
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
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
