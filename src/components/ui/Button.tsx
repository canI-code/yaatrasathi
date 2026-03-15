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
    color: "#ffffff",
    border: `1px solid ${colors.accentStrong}`,
  },
  secondary: {
    background: "rgba(164, 216, 225, 0.2)",
    color: colors.textMain,
    border: `1px solid rgba(164, 216, 225, 0.45)`,
  },
  ghost: {
    background: "transparent",
    color: colors.accentStrong,
    border: `1px solid rgba(0, 0, 0, 0.1)`,
  },
  danger: {
    background: "#DC2626",
    color: "#ffffff",
    border: "1px solid #DC2626",
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
      whileHover={isDisabled ? undefined : { y: -1, filter: "brightness(1.06)" }}
      whileTap={isDisabled ? undefined : { y: 1, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
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
        transition: "opacity 0.25s ease, filter 0.25s ease",
        width: fullWidth ? "100%" : "auto",
        boxShadow: "none",
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
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "#ffffff",
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
