import { useState } from "react";
import { ShieldCheckIcon, SparklesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { generateSafetyGuide } from "../lib/groq";
import type { SafetyTip } from "../types";

const SafetyGuide = () => {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<SafetyTip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setTips([]);
    try {
      const result = await generateSafetyGuide(destination);
      setTips(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch safety guide.");
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_ICONS: Record<string, JSX.Element | null> = {
    general: null,
    health: null,
    transport: null,
    scam: null,
    emergency: <ExclamationTriangleIcon style={{ width: 16, height: 16 }} />,
    women: null,
    nature: null,
    digital: null,
  };

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center" }}>
        <GradientText>Safety</GradientText> Guide
      </h1>
      <p style={{ textAlign: "center", color: "rgba(61, 60, 58,0.55)", marginBottom: "40px", fontSize: "0.95rem" }}>
        Stay informed and travel confidently
      </p>

      <div style={{ maxWidth: "600px", margin: "0 auto 40px", display: "flex", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Enter destination (e.g. Varanasi, UP)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            leftIcon={<ShieldCheckIcon style={{ width: 18, height: 18 }} />}
            error={error ?? undefined}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
          Get Tips
        </Button>
      </div>

      {loading && <Loader message=" Analyzing safety information..." />}

      {tips.length > 0 && !loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}
        >
          {tips.map((tip, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card style={{ height: "100%", borderLeft: "3px solid #2A9D8F" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{CATEGORY_ICONS[tip.category.toLowerCase()] ?? null}</span>
                  {tip.category}
                </h3>
                <ul style={{ paddingLeft: "0px", listStyle: "none" }}>
                  {tip.tips.map((t, j) => (
                    <li key={j} style={{ display: "flex", gap: "8px", marginBottom: "8px", fontSize: "0.83rem", color: "rgba(61, 60, 58,0.7)", lineHeight: 1.5 }}>
                      <span style={{ color: "#2A9D8F", flexShrink: 0, marginTop: "2px" }}>•</span>
                      {t}
                    </li>
                  ))}
                </ul>
                {tip.emergency && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "rgba(239,68,68,0.08)", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ExclamationTriangleIcon style={{ width: 14, height: 14, color: "#f97171" }} />
                    <p style={{ fontSize: "0.78rem", color: "#f87171", margin: 0 }}>Emergency: {tip.emergency}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
};

export default SafetyGuide;
