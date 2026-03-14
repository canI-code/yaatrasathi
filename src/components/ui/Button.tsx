import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { colors } from "../../theme";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    background: colors.accentStrong,
    color: colors.background,
    border: `1px solid ${colors.accentStrong}`,
    boxShadow: "0 10px 30px rgba(42, 157, 143, 0.35)",
  },
  secondary: {
    background: colors.accentSoft,
    color: colors.textMain,
    border: `1px solid ${colors.accentSoft}`,
    boxShadow: "0 8px 24px rgba(148, 163, 184, 0.25)",
  },
  ghost: {
    background: "transparent",
    color: colors.accentStrong,
    border: `1px solid rgba(148, 163, 184, 0.35)`,
    boxShadow: "none",
  },
  danger: {
    background: "#FF6B6B",
    color: colors.background,
    border: "1px solid #D42C2C",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
};

const SIZE_STYLES = {
  sm: { padding: "7px 16px", fontSize: "0.8rem", borderRadius: "10px" },
  md: { padding: "10px 22px", fontSize: "0.9rem", borderRadius: "12px" },
  lg: { padding: "14px 32px", fontSize: "1rem", borderRadius: "14px" },
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { y: -1, filter: "brightness(1.1)" }}
      whileTap={isDisabled ? undefined : { y: 2, scale: 0.98, filter: "brightness(0.9)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8), 0 0 0 rgba(0,0,0,0)" }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      disabled={isDisabled}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: isDisabled ? 0.55 : 1,
        transition: "opacity 0.2s ease, box-shadow 0.2s ease",
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
      {...(rest as Parameters<typeof motion.button>[0])}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid rgba(0, 0, 0, 0.1)",
            borderTopColor: "#3D3C3A",
            borderRadius: "50%",
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
};

export default Button;
