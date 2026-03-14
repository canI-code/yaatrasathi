import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ fontSize: "6rem", marginBottom: "24px" }}
      >
        
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: 900, marginBottom: "8px" }}
      >
        <GradientText>404</GradientText>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: "1.1rem", color: "rgba(61, 60, 58,0.6)", marginBottom: "8px" }}
      >
        Oops! Looks like this destination doesn't exist.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: "0.9rem", color: "rgba(61, 60, 58,0.35)", marginBottom: "36px" }}
      >
        The page you're looking for has flown away 
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button size="lg" leftIcon={<HomeIcon style={{ width: 20, height: 20 }} />}>
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
