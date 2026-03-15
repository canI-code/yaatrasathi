export const colors = {
  // Core palette
  accentSoft: "#A4D8E1",
  accentMid: "#B7E4E7",
  accentStrong: "#2A9D8F",
  surface: "#F0F4F8",
  surfaceAlt: "#F6F9FC",
  background: "#f9f1ec",

  // Neutral text tones — high contrast on light bg
  textMain: "#1B2A3B",
  textBody: "#374151",
  textMuted: "#55697B",
  textSubtle: "#8295A5",

  // Status colors
  error: "#DC2626",
  errorSoft: "rgba(220, 38, 38, 0.08)",
  warning: "#F97316",
  warningSoft: "rgba(249, 115, 22, 0.08)",
  success: "#16A34A",
  successSoft: "rgba(22, 163, 74, 0.08)",

  // Glass surfaces
  glassWhite: "rgba(255, 255, 255, 0.55)",
  glassLight: "rgba(255, 255, 255, 0.45)",
  glassSoft: "rgba(255, 255, 255, 0.35)",
  glassBorder: "rgba(164, 216, 225, 0.35)",
  glassBorderSubtle: "rgba(0, 0, 0, 0.06)",
};

export const glass = {
  card: {
    background: colors.glassWhite,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: "20px",
  } as React.CSSProperties,
  subtle: {
    background: colors.glassSoft,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${colors.glassBorderSubtle}`,
    borderRadius: "16px",
  } as React.CSSProperties,
};
