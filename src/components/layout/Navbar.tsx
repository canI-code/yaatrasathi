import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import type { NavLink } from "../../types";
import { colors, shadows } from "../../theme";

const NAV_LINKS: NavLink[] = [
  { label: "Home", path: "/" },
  { label: "Planner", path: "/planner" },
  { label: "Budget", path: "/budget" },
  { label: "Hotels", path: "/hotels" },
  { label: "Food", path: "/food" },
  { label: "Transport", path: "/transport" },
  { label: "Safety", path: "/safety" },
  { label: "Time", path: "/best-time" },
  { label: "Weather", path: "/weather" },
  { label: "Map", path: "/map" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "14px clamp(16px, 4vw, 40px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              backgroundColor: colors.glassSoft,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              borderRadius: "999px",
              border: `1px solid ${colors.glassBorder}`,
              boxShadow: shadows.soft,
              padding: "10px 16px",
              pointerEvents: "auto",
            }}
          >
            {/* Brand */}
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "12px",
                  backgroundColor: colors.accentStrong,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(42,157,143,0.45)",
                }}
              >
                <PaperAirplaneIcon
                  style={{
                    width: 18,
                    height: 18,
                    color: colors.background,
                    transform: "rotate(-30deg)",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: colors.textMain,
                  }}
                >
                  YatraSathi
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: colors.textSubtle,
                  }}
                >
                  AI travel companion
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {NAV_LINKS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        display: "none",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: active ? colors.background : colors.textMuted,
                        backgroundColor: active ? colors.accentStrong : "transparent",
                        transition: "background-color 0.18s ease, color 0.18s ease",
                      }}
                      className="nav-pill-desktop"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

            </nav>

            {/* Right: primary CTA + mobile menu */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Link
                to="/planner"
                style={{
                  textDecoration: "none",
                  display: "none",
                }}
                className="nav-cta-desktop"
              >
                <button
                  style={{
                    borderRadius: "999px",
                    border: "none",
                    padding: "8px 16px",
                    backgroundColor: colors.accentStrong,
                    color: colors.background,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 10px 30px rgba(42,157,143,0.4)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Plan a trip
                </button>
              </Link>

              <button
                onClick={() => setOpen((v) => !v)}
                style={{
                  borderRadius: "999px",
                  border: `1px solid ${colors.glassBorder}`,
                  backgroundColor: "rgba(246,249,252,0.9)",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                className="nav-menu-toggle"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 10, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                  >
                    {open ? (
                      <XMarkIcon style={{ width: 18, height: 18, color: colors.textMain }} />
                    ) : (
                      <Bars3Icon style={{ width: 18, height: 18, color: colors.textMain }} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile / overlay nav */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "#020617",
                zIndex: 35,
              }}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                top: 70,
                left: 0,
                right: 0,
                zIndex: 45,
              }}
            >
              <div
                style={{
                  maxWidth: "480px",
                  margin: "0 auto",
                  padding: "0 clamp(16px, 4vw, 40px)",
                }}
              >
                <div
                  style={{
                    backgroundColor: colors.glassLight,
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    borderRadius: "24px",
                    border: `1px solid ${colors.glassBorder}`,
                    boxShadow: shadows.medium,
                    padding: "16px 16px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {NAV_LINKS.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        style={{
                          textDecoration: "none",
                          padding: "10px 10px",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          color: active ? colors.accentStrong : colors.textMain,
                          backgroundColor: active ? "rgba(164,216,225,0.4)" : "transparent",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <span>{item.label}</span>
                        {active && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "999px",
                              backgroundColor: colors.accentStrong,
                            }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 900px) {
          .nav-pill-desktop {
            display: inline-flex !important;
          }
          .nav-cta-desktop {
            display: block !important;
          }
          .nav-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
