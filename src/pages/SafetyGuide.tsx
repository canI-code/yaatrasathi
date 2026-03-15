import { useState } from "react";
import { ShieldCheckIcon, SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import { generateSafetyGuide } from "../lib/groq";
import type { SafetyReport, SafetyLevel } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";

// ── Constants ─────────────────────────────────────────────────────────────────

const TRAVELER_OPTIONS = [
  { label: "👤 Solo Male", value: "Solo Male" },
  { label: "👩 Solo Female", value: "Solo Female" },
  { label: "👫 Couple", value: "Couple" },
  { label: "👨‍👩‍👧 Family with Kids", value: "Family with Kids" },
  { label: "👴 Senior Traveler", value: "Senior Traveler" },
  { label: "🎒 Backpacker", value: "Backpacker" },
  { label: "💼 Business Traveler", value: "Business Traveler" },
  { label: "🌍 Foreign Tourist", value: "Foreign Tourist" },
];

const CONCERN_OPTIONS = [
  { label: "🌎 General Safety", value: "general safety" },
  { label: "🌃 Night Safety", value: "night safety" },
  { label: "🚺 Women's Safety", value: "women's safety" },
  { label: "🕵️ Theft & Scams", value: "theft and scams" },
  { label: "🏥 Health & Medical", value: "health and medical" },
  { label: "🚗 Road Safety", value: "road safety" },
  { label: "🌪️ Natural Disasters", value: "natural disasters" },
  { label: "💻 Cyber Safety", value: "cyber safety" },
  { label: "🏊 Water Safety", value: "water and swimming safety" },
  { label: "🦁 Wildlife", value: "wildlife dangers" },
];

const ALL_INDIA_CONTACTS = [
  { emoji: "🚔", service: "Police", number: "100" },
  { emoji: "🚒", service: "Fire Brigade", number: "101" },
  { emoji: "🚑", service: "Ambulance", number: "108" },
  { emoji: "🆘", service: "National Emergency", number: "112" },
  { emoji: "👩", service: "Women's Helpline", number: "1091" },
  { emoji: "👶", service: "Child Helpline", number: "1098" },
  { emoji: "🏦", service: "Cyber Crime", number: "1930" },
  { emoji: "🏨", service: "Tourist Helpline", number: "1800-11-1363" },
  { emoji: "🧠", service: "Mental Health (iCall)", number: "9152987821" },
  { emoji: "🚨", service: "Anti-Poison", number: "1800-116-117" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<SafetyLevel, { color: string; bg: string; border: string; label: string; dot: string }> = {
  safe:     { color: "#059669", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.2)",   label: "🟢 Safe",              dot: "#059669" },
  moderate: { color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.2)",   label: "🟡 Moderate Caution",  dot: "#d97706" },
  high:     { color: "#dc2626", bg: "rgba(220,38,38,0.08)",   border: "rgba(220,38,38,0.2)",   label: "🔴 High Caution",      dot: "#dc2626" },
  avoid:    { color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",  label: "⛔ Avoid",             dot: "#7c3aed" },
};

function LevelBadge({ level }: { level: SafetyLevel }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.moderate;
  return (
    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

const ASPECT_ICONS: Record<string, string> = {
  "General Safety": "🌎", "Night Safety": "🌃", "Women's Safety": "🚺",
  "Theft & Scams": "🕵️", "Health & Medical": "🏥", "Road Safety": "🚗",
  "Natural Disasters": "🌪️", "Cyber Safety": "💻", "Political Stability": "🗳️",
  "Wildlife Dangers": "🦁", "Water & Swimming": "🏊",
};

// ── Main Component ────────────────────────────────────────────────────────────

const SafetyGuide = () => {
  const [destination, setDestination] = useState("");
  const [travelerType, setTravelerType] = useState("Solo Male");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWarning(report !== null);

  function toggleConcern(val: string) {
    setSelectedConcerns((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setReport(null);
    try {
      const result = await generateSafetyGuide({
        destination: destination.trim(),
        travelerType,
        concerns: selectedConcerns.length > 0 ? selectedConcerns : ["all safety aspects"],
      });
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate safety report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center", color: colors.textMain }}>
        <GradientText>Safety</GradientText> Guide
      </h1>
      <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: "40px", fontSize: "0.95rem" }}>
        Location-specific safety intelligence for your trip
      </p>

      {/* ── All-India Emergency Contacts ── */}
      <div style={{ maxWidth: "860px", margin: "0 auto 36px" }}>
        <div style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 20, padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontSize: "0.82rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            🚨 All-India Emergency Numbers — Save before you travel
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
            {ALL_INDIA_CONTACTS.map((c) => (
              <div
                key={c.service}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: 12,
                  border: "1px solid rgba(220,38,38,0.12)",
                }}
              >
                <span style={{ fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 }}>{c.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "#dc2626", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.service}</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: colors.textMain, letterSpacing: "-0.01em" }}>{c.number}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: "0.75rem", color: colors.textSubtle, lineHeight: 1.6 }}>
            💡 <strong>112</strong> works without SIM/signal &nbsp;·&nbsp; <strong>108</strong> ambulance is free &nbsp;·&nbsp; <strong>1930</strong> for cyber fraud — report immediately
          </p>
        </div>
      </div>

      {/* ── Search Form ── */}
      <div style={{ maxWidth: "860px", margin: "0 auto 40px" }}>
        <Card padding="28px">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <Input
              label="🌍 Destination"
              placeholder="e.g. Panjim, Goa"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setError(null); }}
              leftIcon={<ShieldCheckIcon style={{ width: 18, height: 18 }} />}
              error={error ?? undefined}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Select
              label="👤 Traveler Type"
              options={TRAVELER_OPTIONS}
              value={travelerType}
              onChange={(e) => setTravelerType(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 600, color: colors.textMuted }}>
              🔍 Safety Concerns (select all that apply — leave blank for full report)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CONCERN_OPTIONS.map((opt) => {
                const active = selectedConcerns.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleConcern(opt.value)}
                    style={{
                      padding: "6px 13px",
                      borderRadius: 999,
                      border: active ? "1px solid rgba(42,157,143,0.5)" : "1px solid rgba(0,0,0,0.08)",
                      background: active ? "rgba(42,157,143,0.1)" : "transparent",
                      color: active ? colors.accentStrong : colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Button fullWidth size="lg" onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
              Generate Safety Report
            </Button>
          </div>
        </Card>
      </div>

      {loading && <Loader message="🛡️ Analysing safety data for your destination..." />}

      {report && !loading && (
        <>
          <SaveReminderBanner />
          <SafetyReportView report={report} />
        </>
      )}
    </PageWrapper>
  );
};

export default SafetyGuide;

// ── SafetyReportView ──────────────────────────────────────────────────────────

function SafetyReportView({ report }: { report: SafetyReport }) {
  const overallCfg = LEVEL_CONFIG[report.overallLevel] ?? LEVEL_CONFIG.moderate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Save to plan */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveToPlanButton aiOutput={report} sectionType="safety" />
      </div>

      {/* ── Overall Score ── */}
      <div style={{ background: overallCfg.bg, border: `1px solid ${overallCfg.border}`, borderRadius: 20, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 700, color: overallCfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🛡️ Safety Report · AI Generated
            </p>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: colors.textMain }}>
              📍 {report.destination}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: colors.textMuted }}>👤 {report.travelerType}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900, color: overallCfg.color }}>{report.overallScore}/10</p>
            <LevelBadge level={report.overallLevel} />
          </div>
        </div>

        {/* Aspect rating table */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
          {report.aspects?.slice(0, 6).map((a) => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "rgba(255,255,255,0.5)", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: "0.78rem", color: colors.textBody }}>{ASPECT_ICONS[a.name] ?? "🔹"} {a.name}</span>
              <LevelBadge level={a.level} />
            </div>
          ))}
        </div>

        <p style={{ margin: 0, fontSize: "0.88rem", color: colors.textBody, lineHeight: 1.7 }}>{report.summary}</p>
      </div>

      {/* ── Safety Breakdown ── */}
      <div>
        <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>🔍 Safety Breakdown by Concern</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
          {report.aspects?.map((aspect, i) => {
            const cfg = LEVEL_CONFIG[aspect.level] ?? LEVEL_CONFIG.moderate;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card style={{ borderLeft: `3px solid ${cfg.color}`, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>
                      {ASPECT_ICONS[aspect.name] ?? "🔹"} {aspect.name}
                    </h4>
                    <LevelBadge level={aspect.level} />
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: colors.textBody, lineHeight: 1.6 }}>{aspect.situation}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {aspect.tips?.map((tip, j) => (
                      <li key={j} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: "0.8rem", color: colors.textMuted, lineHeight: 1.5 }}>
                        <span style={{ color: cfg.color, flexShrink: 0 }}>•</span>{tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Scams ── */}
      {report.scams?.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>🚨 Common Scams & How to Avoid Them</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {report.scams.map((scam, i) => (
              <Card key={i} style={{ borderLeft: "3px solid #d97706" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>{i + 1}. {scam.title}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  {[
                    { label: "How it works", value: scam.howItWorks, color: colors.textBody },
                    { label: "🚩 Red flags", value: scam.redFlags, color: "#d97706" },
                    { label: "✅ How to avoid", value: scam.howToAvoid, color: "#059669" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p style={{ margin: "0 0 3px", fontSize: "0.68rem", fontWeight: 700, color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: "0.82rem", color, lineHeight: 1.5 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Emergency Contacts ── */}
      {report.emergencyContacts?.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>🏥 Emergency Contacts for {report.destination}</h3>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {report.emergencyContacts.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(220,38,38,0.04)", borderRadius: 10, border: "1px solid rgba(220,38,38,0.1)" }}>
                  <span style={{ fontSize: "0.82rem", color: colors.textBody }}>{c.service}</span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#dc2626" }}>{c.number}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Area Guide ── */}
      {report.areaGuide?.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>📍 Area-wise Safety Guide</h3>
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    {["Area / Locality", "Safety Rating", "Best Time", "Notes"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.areaGuide.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: colors.textMain }}>{row.area}</td>
                      <td style={{ padding: "10px 12px" }}><LevelBadge level={row.rating} /></td>
                      <td style={{ padding: "10px 12px", color: colors.textMuted }}>{row.bestTime}</td>
                      <td style={{ padding: "10px 12px", color: colors.textBody }}>{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Night Safety ── */}
      {report.nightSafety && (
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>🌙 Night Safety in {report.destination}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <Card style={{ borderLeft: "3px solid #059669" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>✅ Safe Areas After Dark</p>
              {report.nightSafety.safeAreas?.map((a, i) => <p key={i} style={{ margin: "0 0 4px", fontSize: "0.82rem", color: colors.textBody }}>• {a}</p>)}
            </Card>
            <Card style={{ borderLeft: "3px solid #dc2626" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase" }}>⚠️ Areas to Avoid at Night</p>
              {report.nightSafety.avoidAreas?.map((a, i) => <p key={i} style={{ margin: "0 0 4px", fontSize: "0.82rem", color: colors.textBody }}>• {a}</p>)}
            </Card>
            <Card style={{ borderLeft: "3px solid #d97706" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>🚗 Night Transport Tips</p>
              {report.nightSafety.transportTips?.map((t, i) => <p key={i} style={{ margin: "0 0 4px", fontSize: "0.82rem", color: colors.textBody }}>• {t}</p>)}
              {report.nightSafety.cautionAfter && (
                <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#d97706", fontWeight: 600 }}>⏰ {report.nightSafety.cautionAfter}</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── Traveler Tips + Dos & Donts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {report.travelerSpecificTips?.length > 0 && (
          <Card>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.88rem", fontWeight: 700, color: colors.textMain }}>👤 Tips for {report.travelerType}</h4>
            {report.travelerSpecificTips.map((t, i) => (
              <p key={i} style={{ margin: "0 0 6px", fontSize: "0.82rem", color: colors.textBody, display: "flex", gap: 8 }}>
                <span style={{ color: colors.accentStrong, flexShrink: 0 }}>•</span>{t}
              </p>
            ))}
          </Card>
        )}

        {(report.dos?.length > 0 || report.donts?.length > 0) && (
          <Card>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.88rem", fontWeight: 700, color: colors.textMain }}>✅ Do&apos;s &amp; ❌ Don&apos;ts</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>✅ Do</p>
                {report.dos?.map((d, i) => <p key={i} style={{ margin: "0 0 5px", fontSize: "0.78rem", color: colors.textBody }}>• {d}</p>)}
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase" }}>❌ Don&apos;t</p>
                {report.donts?.map((d, i) => <p key={i} style={{ margin: "0 0 5px", fontSize: "0.78rem", color: colors.textBody }}>• {d}</p>)}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ── Final Verdict ── */}
      {report.finalVerdict && (
        <div style={{ background: "rgba(42,157,143,0.06)", border: "1px solid rgba(42,157,143,0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <CheckCircleIcon style={{ width: 22, height: 22, color: colors.accentStrong, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "0.75rem", fontWeight: 700, color: colors.accentStrong, textTransform: "uppercase", letterSpacing: "0.06em" }}>🔚 Final Verdict</p>
            <p style={{ margin: 0, fontSize: "0.9rem", color: colors.textBody, lineHeight: 1.7 }}>{report.finalVerdict}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
