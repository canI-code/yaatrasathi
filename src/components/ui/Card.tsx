import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { colors, glass } from "../../theme";

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
  hoverable = false,
  padding = "24px",
}: CardProps) => {
  return (
    <motion.div
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      className={className}
      style={{
        ...glass.card,
        padding,
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
