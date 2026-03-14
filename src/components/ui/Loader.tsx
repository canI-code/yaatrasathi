import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PaperAirplaneIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const MESSAGES = [
  "Exploring destinations...",
  "Scanning flight routes...",
  "AI is crafting your trip...",
  "Mapping your adventure...",
  "Finding the best hotels...",
  "Discovering local flavors...",
  "Calculating the best deals...",
  "Checking weather patterns...",
];

interface LoaderProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  message?: string;
}

const Loader = ({ fullScreen = false, size = "md", message }: LoaderProps) => {
  const [currentMessage, setCurrentMessage] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const iconSize = size === "sm" ? 20 : size === "md" ? 32 : 44;
  const orbitSize = size === "sm" ? 60 : size === "md" ? 100 : 140;

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      {/* Orbit animation */}
      <div style={{ position: "relative", width: orbitSize, height: orbitSize }}>
        {/* Orbit ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px dashed rgba(164, 216, 225, 0.3)", // A7A8D9 softer tone
          }}
        />

        {/* Airplane orbiting */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <motion.div
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: "50%",
              backgroundColor: "#2A9D8F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(42, 157, 143, 0.4)",
              marginTop: "-1px",
            }}
          >
            <PaperAirplaneIcon
              style={{ width: iconSize * 0.55, height: iconSize * 0.55, color: "#3D3C3A" }}
            />
          </motion.div>
        </motion.div>

        {/* Center globe pulse */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#A4D8E1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlobeAltIcon style={{ width: size === "sm" ? 24 : size === "md" ? 36 : 48, height: size === "sm" ? 24 : size === "md" ? 36 : 48 }} />
        </motion.div>
      </div>

      {size !== "sm" && (
        <motion.p
          key={message ?? currentMessage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{
            color: "#3D3C3A",
            fontSize: size === "md" ? "0.9rem" : "1rem",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: "260px",
          }}
        >
          {message ?? currentMessage}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#F6F9FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        width: "100%",
      }}
    >
      {content}
    </div>
  );
};

export default Loader;
