import { ReactNode, ElementType, CSSProperties } from "react";

interface GradientTextProps {
  children: ReactNode;
  as?: ElementType;
  gradient?: string;
  style?: CSSProperties;
  className?: string;
}

const GradientText = ({
  children,
  as: Tag = "span",
  style,
  className,
}: GradientTextProps) => {
  return (
    <Tag
      className={className}
      style={{
        color: "#2A9D8F",
        display: "inline-block",
        textShadow: "none",
        fontWeight: 800,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default GradientText;
