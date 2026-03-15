import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Input, { GetLocationButton } from "../components/ui/Input";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";
import { useAIQuota } from "../hooks/useAIQuota";
import UpgradeModal from "../components/paywall/UpgradeModal";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import {
  SparklesIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  LightBulbIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { generateBudgetEstimate } from "../lib/groq";
import { exportBudgetPDF } from "../lib/pdf";
import type { BudgetBreakdown } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLE_OPTIONS = [
  { label: " Budget Backpacker", value: "Budget Backpacker" },
  { label: " Comfortable Explorer", value: "Comfortable Explorer" },
  { label: " Luxury Traveler", value: "Luxury Traveler" },
  { label: " Adventure Seeker", value: "Adventure Seeker" },
  { label: " Cultural Enthusiast", value: "Cultural Enthusiast" },
];

const ACCOMMODATION_OPTIONS = [
  { label: " Hostel / Guest House", value: "Hostel/Guest House" },
  { label: " Budget Hotel (1-2 Star)", value: "Budget Hotel" },
  { label: " Standard Hotel (3 Star)", value: "3-Star Hotel" },
  { label: " Premium Hotel (4-5 Star)", value: "4-5 Star Hotel" },
  { label: " Resort / Boutique", value: "Resort" },
];

const TRANSPORT_OPTIONS = [
  { label: " Bus / Local Transport", value: "Bus/Local" },
  { label: " Train", value: "Train" },
  { label: " Cab / Taxi", value: "Cab" },
  { label: " Flight", value: "Flight" },
  { label: " Mix of Transports", value: "Mix" },
];

const LOADING_MESSAGES = [
  " Crunching live cost data for your destination...",
  " Comparing accommodation pricing by style...",
  " Estimating local food costs...",
  " Checking transport fares...",
  " Finding money-saving alternatives...",
  " Building your personalised budget...",
  " Almost done — wrapping up insights...",
];

const BREAKDOWN_ROWS = [
  { key: "accommodation" as const, label: "Accommodation", icon: "", color: "#2A9D8F" },
  { key: "food" as const, label: "Food & Dining", icon: "", color: "#2A9D8F" },
  { key: "transport" as const, label: "Transport", icon: "", color: "#2A9D8F" },
  { key: "activities" as const, label: "Activities & Sightseeing", icon: "", color: "#2A9D8F" },
  { key: "shopping" as const, label: "Shopping", icon: "", color: "#2A9D8F" },
  { key: "miscellaneous" as const, label: "Miscellaneous", icon: "", color: "#2A9D8F" },
];

// ─── Glassmorphism Styles ─────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.5)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  borderRadius: "20px",
  padding: "24px",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  transition: "all 0.2s ease",
};


const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "rgba(27, 42, 59, 0.58)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "8px",
  display: "block",
};

const sliderStyle: React.CSSProperties = {
  width: "100%",
  accentColor: colors.accentStrong,
  cursor: "pointer",
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={labelStyle}>{children}</span>
);



// Animated counter
const AnimatedValue = ({ target, prefix = "₹" }: { target: number; prefix?: string }) => {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1200;
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{displayed.toLocaleString()}</span>;
};

// Metric card
const MetricCard = ({
  label,
  value,
  sub,
  icon,
  delay,
  isCount = false,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  delay: number;
  isCount?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: "easeOut" }}

    className="ai-hover-card" style={{ padding: "22px 20px", textAlign: "center", cursor: "default" }}
  >
    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{icon}</div>
    <p style={{ fontSize: "0.72rem", color: "rgba(27, 42, 59, 0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
      {label}
    </p>
    <p style={{ fontSize: "1.55rem", fontWeight: 900 }}>
      <GradientText>
        {isCount ? <span>{value}</span> : <AnimatedValue target={value} />}
      </GradientText>
    </p>
    {sub && <p style={{ fontSize: "0.72rem", color: "rgba(27, 42, 59, 0.55)", marginTop: "4px" }}>{sub}</p>}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BudgetEstimator = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState("Comfortable Explorer");
  const [accommodation, setAccommodation] = useState("3-Star Hotel");
  const [transport, setTransport] = useState("Mix");
  const [includeFlights, setIncludeFlights] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useUnsavedWarning(budget !== null);
  const { withQuota, upgradeOpen, setUpgradeOpen, upgradeMsg } = useAIQuota();

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingMsg((p) => (p + 1) % LOADING_MESSAGES.length), 2500);
    return () => clearInterval(id);
  }, [loading]);

  const fillSample = () => {
    setSource("Delhi");
    setDestination("Goa");
    setDays(5);
    setTravelers(2);
    setTravelStyle("Comfortable Explorer");
    setAccommodation("3-Star Hotel");
    setTransport("Flight");
    setIncludeFlights(true);
  };

  const handleEstimate = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setBudget(null);
    setLoadingMsg(0);
    try {
      const result = await withQuota(() => generateBudgetEstimate({
        source: source.trim() || "India",
        destination: destination.trim(),
        days,
        travelers,
        travelStyle,
        accommodation,
        transport,
        includeFlights,
      }));
      if (result) {
        setBudget(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!budget) return;
    const lines = [
      " YatraSathi Budget Estimate",
      ` ${budget.destination} · ${budget.days} days · ${budget.travelers} traveler(s)`,
      ` Style: ${budget.travelStyle}`,
      "",
      `Total: ₹${budget.total.toLocaleString()}`,
      `Per Person: ₹${budget.perPersonTotal.toLocaleString()}`,
      `Per Day: ₹${budget.perDayTotal.toLocaleString()}`,
      "",
      "Breakdown:",
      ...BREAKDOWN_ROWS.map((r) => `  ${r.icon} ${r.label}: ₹${budget[r.key].toLocaleString()}`),
      "",
      `Summary: ${budget.summary}`,
      "",
      "Money-Saving Tips:",
      ...budget.tips.map((t, i) => `  ${i + 1}. ${t}`),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const totalForPercent = budget
    ? BREAKDOWN_ROWS.reduce((s, r) => s + budget[r.key], 0)
    : 1;

  return (
    <PageWrapper>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title={upgradeMsg.title} description={upgradeMsg.description} />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "40px" }}
      >
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "12px" }}>
          <GradientText> Smart Budget Estimator</GradientText>
        </h1>
        <p style={{ color: "rgba(27, 42, 59, 0.58)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
          Get a detailed AI-powered cost breakdown for your trip — accommodation, food, transport & more.
        </p>
      </motion.div>

      {/* Input Form */}
      <AnimatePresence>
        {true && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={glassCard}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "24px", color: "#1B2A3B" }}>
              Trip Details
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {/* Source */}
              <div>
                <FieldLabel>From City</FieldLabel>
                <div style={{ position: "relative" }}>
                  <Input
                    placeholder="e.g. Mumbai, Delhi"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={{ paddingRight: "40px" }}
                  />
                  <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}><GetLocationButton onLocation={setSource} /></div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <FieldLabel>To Destination *</FieldLabel>
                <Input
                  placeholder="e.g. Goa, Manali, Jaipur"
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setError(null); }}
                  style={error ? { borderColor: "#2A9D8F" } : {}}
                />
                {error && (
                  <p style={{ fontSize: "0.78rem", color: "#2A9D8F", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ExclamationTriangleIcon style={{ width: 14, height: 14 }} /> {error}
                  </p>
                )}
              </div>

              {/* Days */}
              <div>
                <FieldLabel>
                  <CalendarIcon style={{ width: 14, height: 14, display: "inline", marginRight: 4 }} />
                  Number of Days
                </FieldLabel>
                <Input type="number" min={1} max={999} value={days}
                  onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if (v <= 999) setDays(v); }} />
              </div>

              {/* Travelers */}
              <div>
                <FieldLabel>
                  <UserGroupIcon style={{ width: 14, height: 14, display: "inline", marginRight: 4 }} />
                  Travelers
                </FieldLabel>
                <Input type="number" min={1} max={999} value={travelers}
                  onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if (v <= 999) setTravelers(v); }} />
              </div>

              {/* Style */}
              <div>
                <FieldLabel>Travel Style</FieldLabel>
                <Select options={STYLE_OPTIONS} value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} />
              </div>

              {/* Accommodation */}
              <div>
                <FieldLabel>Accommodation Type</FieldLabel>
                <Select options={ACCOMMODATION_OPTIONS} value={accommodation} onChange={(e) => setAccommodation(e.target.value)} />
              </div>

              {/* Transport */}
              <div>
                <FieldLabel>Transport Preference</FieldLabel>
                <Select options={TRANSPORT_OPTIONS} value={transport} onChange={(e) => setTransport(e.target.value)} />
              </div>

              {/* Toggle */}
              <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
                <div
                  onClick={() => setIncludeFlights((p) => !p)}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px",
                    background: includeFlights ? "#A4D8E1" : "rgba(0, 0, 0, 0.05)",
                    position: "relative", transition: "background 0.25s", cursor: "pointer",
                    border: "1px solid rgba(0, 0, 0, 0.05)", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                    position: "absolute", top: "2px", left: includeFlights ? "22px" : "2px",
                    transition: "left 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }} />
                </div>
                <span style={{ marginLeft: "12px", fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.78)", cursor: "pointer" }}
                  onClick={() => setIncludeFlights((p) => !p)}>
                  Include inter-city flights / trains in cost
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              <Button size="lg" onClick={handleEstimate} loading={loading}
                leftIcon={<SparklesIcon style={{ width: 20, height: 20 }} />}
                style={{ flex: 1, minWidth: "200px" } as React.CSSProperties}>
                Estimate Budget
              </Button>
              <Button variant="ghost" size="lg" onClick={fillSample}
                leftIcon={<ArrowPathIcon style={{ width: 18, height: 18 }} />}>
                Sample Trip (Delhi → Goa)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loader" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} style={{ marginTop: "60px" }}>
            <Loader message={LOADING_MESSAGES[loadingMsg]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {budget && !loading && (
          <motion.div key="results" ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }} style={{ marginTop: "40px" }}>
            <SaveReminderBanner />

            {/* Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              <MetricCard label="Total Budget" value={budget.total} icon="" delay={0} />
              <MetricCard label="Per Person" value={budget.perPersonTotal} icon="" delay={0.08} />
              <MetricCard label="Per Day" value={budget.perDayTotal} icon="" delay={0.16} />
              <MetricCard label="Travelers" value={budget.travelers} icon="" delay={0.24}
                sub={`${budget.days} days · ${budget.travelStyle}`} isCount />
            </div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }} className="ai-hover-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "10px", color: "#1B2A3B" }}>
                Budget Overview
              </h3>
              <p style={{ color: "rgba(27, 42, 59, 0.68)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {budget.summary}
              </p>
            </motion.div>

            {/* Breakdown Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.45 }} className="ai-hover-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "#1B2A3B" }}>
                Detailed Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {BREAKDOWN_ROWS.map((row) => {
                  const amount = budget[row.key];
                  const pct = Math.round((amount / totalForPercent) * 100);
                  return (
                    <div key={row.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem", color: "rgba(61, 60, 58,0.8)" }}>
                          {row.icon} {row.label}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "0.75rem", color: "rgba(27, 42, 59, 0.55)" }}>{pct}%</span>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: row.color }}>
                            ₹{amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ height: "5px", borderRadius: "4px", background: "rgba(0, 0, 0, 0.05)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: "4px", background: row.color }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.05)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#1B2A3B" }}> Total</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 900 }}>
                    <GradientText>₹{budget.total.toLocaleString()}</GradientText>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.45 }} className="ai-hover-card" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "18px", color: "#1B2A3B", display: "flex", alignItems: "center", gap: "8px" }}>
                <LightBulbIcon style={{ width: 20, height: 20, color: "#2A9D8F" }} />
                Money-Saving Tips
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {budget.tips.map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{
                      minWidth: "22px", height: "22px", borderRadius: "50%",
                      background: "#F0F4F8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700, color: "#1B2A3B", flexShrink: 0,
                    }}>{i + 1}</span>
                    <p style={{ fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.75)", lineHeight: 1.6, margin: 0 }}>{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Cheaper Alternatives */}
            {budget.cheaperAlternatives?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.54, duration: 0.45 }} className="ai-hover-card" style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "18px", color: "#1B2A3B", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ArrowsRightLeftIcon style={{ width: 20, height: 20, color: "#2A9D8F" }} />
                  Cheaper Alternatives
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                  {budget.cheaperAlternatives.map((alt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.07 }}
                      whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(16,185,129,0.15)" }}
                      style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2A9D8F", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {alt.category}
                        </span>
                        <span style={{ background: "rgba(16,185,129,0.15)", color: "#2A9D8F", borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
                          Save ₹{alt.savings.toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "rgba(27, 42, 59, 0.55)", margin: "0 0 6px", textDecoration: "line-through" }}>{alt.original}</p>
                      <p style={{ fontSize: "0.88rem", color: "rgba(27, 42, 59, 0.88)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircleIcon style={{ width: 14, height: 14, color: "#2A9D8F", flexShrink: 0 }} />
                        {alt.cheaper}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button size="md" onClick={() => exportBudgetPDF(budget)}
                leftIcon={<ArrowDownTrayIcon style={{ width: 18, height: 18 }} />}>
                Download PDF
              </Button>
              <Button variant="secondary" size="md" onClick={handleCopy}
                leftIcon={copied ? <CheckCircleIcon style={{ width: 18, height: 18 }} /> : <ClipboardDocumentIcon style={{ width: 18, height: 18 }} />}>
                {copied ? "Copied!" : "Copy Summary"}
              </Button>
              <Button variant="ghost" size="md" onClick={() => { setBudget(null); setError(null); }}
                leftIcon={<ArrowPathIcon style={{ width: 18, height: 18 }} />}>
                Estimate Again
              </Button>
              <SaveToPlanButton aiOutput={budget} sectionType="budget" />
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    
      {/* CSS */ }
  <style>{`
        .ai-hover-card {
          background: rgba(255, 255, 255, 0.55) !important; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          border-radius: 16px;
          transition: all 0.2s ease !important;
        }
        .ai-hover-card:hover {
          background: rgba(42, 157, 143, 0.04) !important;
          border: 1px solid rgba(42, 157, 143, 0.3) !important;
        }
      `}</style>
    </PageWrapper >

  );
};

export default BudgetEstimator;
