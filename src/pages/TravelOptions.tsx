import { useState } from "react";
import { TruckIcon, SparklesIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { generateTransportOptions } from "../lib/groq";
import type { TransportOption } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";
import { useAIQuota } from "../hooks/useAIQuota";
import UpgradeModal from "../components/paywall/UpgradeModal";

const TYPE_EMOJI: Record<string, string> = {
  flight: "✈️",
  train: "🚂",
  bus: "🚌",
  car: "🚗",
  ferry: "⛴️",
  auto: "🛺",
  bike: "🏍️",
};

const TravelOptions = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useUnsavedWarning(options.length > 0);
  const { withQuota, upgradeOpen, setUpgradeOpen, upgradeMsg } = useAIQuota();

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) { setError("Please enter both origin and destination."); return; }
    setError(null);
    setLoading(true);
    setOptions([]);
    try {
      const result = await withQuota(() => generateTransportOptions(from.trim(), to.trim()));
      if (result) setOptions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transport options.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title={upgradeMsg.title} description={upgradeMsg.description} />
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center", color: colors.textMain }}>
        <GradientText>Travel</GradientText> Options
      </h1>
      <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: "40px", fontSize: "0.95rem" }}>
        Compare all ways to get from A to B
      </p>

      <div style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
        <Card padding="28px">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="From"
              placeholder="Origin city / area"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              leftIcon={<TruckIcon style={{ width: 18, height: 18 }} />}
              rightIcon={<GetLocationButton onLocation={setFrom} />}
            />
            <Input
              label="To"
              placeholder="Destination city / area"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {error && (
              <p style={{ gridColumn: "1/-1", color: colors.error, fontSize: "0.82rem", margin: 0 }}>{error}</p>
            )}
            <div style={{ gridColumn: "1/-1" }}>
              <Button fullWidth onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
                Compare Transport Options
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {loading && <Loader message="🚗 Finding all travel options..." />}

      {options.length > 0 && !loading && (
        <>
          <SaveReminderBanner />
          {/* Save all with info tooltip */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <button
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: colors.textSubtle, padding: 2 }}
              >
                <InformationCircleIcon style={{ width: 18, height: 18 }} />
              </button>
              {tooltipVisible && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  width: 230,
                  background: "rgba(27,42,59,0.92)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  padding: "8px 12px",
                  borderRadius: 10,
                  zIndex: 50,
                  pointerEvents: "none",
                }}>
                  Saves all {options.length} transport options to your plan. To save a single option, use the bookmark button on each card.
                </div>
              )}
            </div>
            <SaveToPlanButton aiOutput={options} sectionType="transport" />
          </div>

          {/* Transport cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}
          >
            {options.map((opt, i) => (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Header */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(164,216,225,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      {TYPE_EMOJI[opt.type] ?? "🚀"}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: colors.textMain, margin: 0 }}>{opt.name}</h3>
                      <p style={{ fontSize: "0.78rem", color: colors.textSubtle, margin: 0 }}>{opt.type}</p>
                    </div>
                  </div>

                  {/* Cost & duration */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.82rem", color: colors.accentStrong, fontWeight: 600 }}>💰 {opt.cost}</span>
                    <span style={{ fontSize: "0.82rem", color: colors.textMuted }}>⏱ {opt.duration}</span>
                  </div>

                  {/* Pros / Cons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flex: 1 }}>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 600, marginBottom: "4px" }}>✓ Pros</p>
                      {opt.pros.slice(0, 3).map((p, j) => (
                        <p key={j} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "2px" }}>• {p}</p>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600, marginBottom: "4px" }}>✗ Cons</p>
                      {opt.cons.slice(0, 3).map((c, j) => (
                        <p key={j} style={{ fontSize: "0.75rem", color: colors.textMuted, marginBottom: "2px" }}>• {c}</p>
                      ))}
                    </div>
                  </div>

                  {/* Per-option save */}
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10, marginTop: 12 }}>
                    <SaveToPlanButton aiOutput={[opt]} sectionType="transport" append={true} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </PageWrapper>
  );
};

export default TravelOptions;
