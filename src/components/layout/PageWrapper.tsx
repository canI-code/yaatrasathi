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

    // Scroll-triggered fade-in for glass sections
    const sections = wrapperRef.current.querySelectorAll<HTMLElement>("[data-glass-section]");

    sections.forEach((section) => {
      const card = section.querySelector<HTMLElement>("[data-glass-elevated]");
      if (!card) return;

      scroll(
        animate(card, { y: [-12, 0, 4], opacity: [0, 1, 1] }, { duration: 0.9 }),
        { target: section, offset: ["start 90%", "center 55%"] }
      );
    });
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={{
        minHeight: "100vh",
        paddingTop: "88px",
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
