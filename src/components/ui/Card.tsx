import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { colors, shadows } from "../../theme";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: string;
  gradient?: boolean;
}

const Card = ({
  children,
  style,
  className,
  onClick,
  hoverable = true,
  padding = "24px",
}: CardProps) => {
  return (
    <motion.div
      
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "18px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        padding,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        cursor: onClick ? "pointer" : "default",
        color: colors.textMain,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;


