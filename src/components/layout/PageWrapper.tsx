import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, scroll } from "motion";
import { colors } from "../../theme";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const PageWrapper = ({ children, className }: PageWrapperProps) => {
  const wrapperRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const sections = wrapperRef.current.querySelectorAll<HTMLElement>("[data-glass-section]");

    sections.forEach((section) => {
      const card = section.querySelector<HTMLElement>("[data-glass-elevated]");
      if (!card) return;

      scroll(
        animate(card, { y: [-8, 0, 8], opacity: [0, 1, 1] }, { duration: 0.8 }),
        { target: section, offset: ["start 85%", "center 60%"] }
      );
    });
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
      style={{
        minHeight: "100vh",
        paddingTop: "80px",
        paddingBottom: "80px",
        paddingLeft: "clamp(16px, 4vw, 48px)",
        paddingRight: "clamp(16px, 4vw, 48px)",
        backgroundColor: colors.background,
        position: "relative",
      }}
      ref={wrapperRef}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>{children}</div>
    </motion.main>
  );
};

export default PageWrapper;
