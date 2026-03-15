import { useState } from "react";
import { SunIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { generateBestTimeInfo } from "../lib/groq";
import type { BestTimeInfo } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";

const SEASON_COLORS: Record<string, string> = {
  summer: "#e77d11",
  winter: "#2563eb",
  monsoon: "#059669",
  spring: "#7c3aed",
  autumn: "#d97706",
};

const BestTime = () => {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<BestTimeInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWarning(seasons.length > 0);

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setSeasons([]);
    try {
      const result = await generateBestTimeInfo(destination);
      setSeasons(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch best time info.");
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#d97706" : "rgba(0, 0, 0, 0.1)", fontSize: "14px" }}>★</span>
    ));

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center", color: colors.textMain }}>
        <GradientText>Best Time</GradientText> to Visit
      </h1>
      <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: "40px", fontSize: "0.95rem" }}>
        Find the perfect season for your destination
      </p>

      <div style={{ maxWidth: "600px", margin: "0 auto 40px", display: "flex", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Enter destination (e.g. Ladakh, Jammu & Kashmir)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            leftIcon={<SunIcon style={{ width: 18, height: 18 }} />}
            error={error ?? undefined}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
          Analyze
        </Button>
      </div>

      {loading && <Loader message=" Analyzing seasonal patterns..." />}

      {seasons.length > 0 && !loading && (
        <>
          <SaveReminderBanner />
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <SaveToPlanButton aiOutput={seasons} sectionType="best-time" />
          </div>
          <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}
        >
          {seasons.map((s, i) => {
            const color = SEASON_COLORS[s.season.toLowerCase()] ?? colors.accentStrong;
            return (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>
                <Card style={{ borderTop: `3px solid ${color}`, height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color }}>{s.season}</h3>
                    <div style={{ display: "flex" }}>{renderRating(s.rating)}</div>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: colors.textSubtle, marginBottom: "10px" }}>
                     {s.months.join(", ")}
                  </p>
                  <p style={{ fontSize: "0.83rem", color: colors.textBody, marginBottom: "12px", lineHeight: 1.6 }}>
                    {s.weather}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 600, marginBottom: "4px" }}>✓ Pros</p>
                      {s.pros.slice(0, 3).map((p, j) => <p key={j} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "2px" }}>• {p}</p>)}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600, marginBottom: "4px" }}>✗ Cons</p>
                      {s.cons.slice(0, 3).map((c, j) => <p key={j} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "2px" }}>• {c}</p>)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        </>
      )}
    </PageWrapper>
  );
};

export default BestTime;
