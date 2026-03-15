import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../theme";

interface NavbarUserMenuProps {
  /** Called when the user clicks the "+" icon — parent mounts CreatePlanModal */
  onCreatePlan?: () => void;
}

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function NavbarUserMenu({ onCreatePlan }: NavbarUserMenuProps) {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate("/", { replace: true });
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: colors.textMuted,
            border: `1px solid rgba(0,0,0,0.08)`,
            backgroundColor: "rgba(255,255,255,0.5)",
            transition: "background-color 0.2s",
          }}
        >
          Login
        </Link>
        <Link
          to="/signup"
          style={{
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: colors.accentStrong,
            transition: "filter 0.2s",
          }}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // ── Authenticated ────────────────────────────────────────────────────────
  const initials = getInitials(user?.email ?? "U");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} ref={menuRef}>
      {/* "+" create plan button */}
      <button
        onClick={onCreatePlan}
        title="Create new plan"
        style={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          border: `1px solid rgba(0,0,0,0.08)`,
          backgroundColor: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: colors.accentStrong,
        }}
      >
        <PlusIcon style={{ width: 16, height: 16 }} />
      </button>

      {/* Avatar / dropdown trigger */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          title={user?.email}
          style={{
            width: 32,
            height: 32,
            borderRadius: "999px",
            border: `2px solid ${colors.accentStrong}`,
            backgroundColor: colors.accentStrong,
            color: "#ffffff",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "0.02em",
          }}
        >
          {initials}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 14,
                border: `1px solid rgba(164,216,225,0.3)`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {/* Email label */}
              <div
                style={{
                  padding: "12px 16px 8px",
                  borderBottom: `1px solid rgba(0,0,0,0.06)`,
                }}
              >
                <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textSubtle }}>
                  Signed in as
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: colors.textMain,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email}
                </p>
              </div>

              {/* Dashboard link */}
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: colors.textMain,
                  textDecoration: "none",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(42,157,143,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                🌍 My Travel Plans
              </Link>

              {/* Profile link */}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: colors.textMain,
                  textDecoration: "none",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(42,157,143,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                ⚙️ Account Settings
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: colors.error,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  borderTop: `1px solid rgba(0,0,0,0.06)`,
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.errorSoft)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
