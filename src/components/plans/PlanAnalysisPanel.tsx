import { useState } from "react";
import { SparklesIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { generatePlanAnalysis } from "../../lib/groq";
import { usePlans } from "../../contexts/PlansContext";
import type { PlanSection, PlanAnalysis } from "../../types";
import Button from "../ui/Button";
import { colors, glass } from "../../theme";

interface PlanAnalysisPanelProps {
  planId: string;
  sections: PlanSection[];
  latestAnalysis?: PlanAnalysis;
  onAnalysisSaved: (analysis: PlanAnalysis) => void;
}

// ── Structured analysis shape ─────────────────────────────────────────────────
interface AnalysisData {
  tripSummary?: {
    from?: string; to?: string; days?: number; travelers?: number;
    style?: string; totalCost?: number; currency?: string;
  };
  budgetBreakdown?: { category: string; amount: number; percentage: number }[];
  budgetWarnings?: string[];
  budgetTips?: string[];
  accommodation?: { name?: string; location?: string; pricePerNight?: number; notes?: string };
  topFoods?: string[];
  safetyLevel?: "safe" | "moderate" | "high";
  safetyWarnings?: string[];
  safetyTips?: string[];
  bestTimeToVisit?: string;
  weatherNotes?: string[];
  topTips?: string[];
  highlights?: string[];
}

const SAFETY_CONFIG = {
  safe:     { color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)",  label: "Safe" },
  moderate: { color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)",  label: "Moderate Caution" },
  high:     { color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)",  label: "High Caution" },
};

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 12, border: "1px solid rgba(164,216,225,0.2)", textAlign: "center" }}>
      <p style={{ margin: "0 0 2px", fontSize: "0.68rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: colors.accentStrong }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "0.68rem", color: colors.textSubtle }}>{sub}</p>}
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <InformationCircleIcon
        style={{ width: 14, height: 14, color: colors.textSubtle, cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span style={{ position: "absolute", bottom: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)", background: "rgba(27,42,59,0.9)", color: "#fff", fontSize: "0.72rem", padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 100, pointerEvents: "none" }}>
          {text}
        </span>
      )}
    </span>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ ...glass.subtle, padding: "16px 18px" }}>
      <p style={{ margin: "0 0 12px", fontSize: "0.78rem", fontWeight: 700, color: colors.textMain, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
        {icon}{title}
      </p>
      {children}
    </div>
  );
}

function AnalysisView({ data }: { data: AnalysisData }) {
  const ts = data.tripSummary;
  const safety = data.safetyLevel ? SAFETY_CONFIG[data.safetyLevel] : SAFETY_CONFIG.moderate;
  const totalBudget = data.budgetBreakdown?.reduce((s, r) => s + r.amount, 0) ?? ts?.totalCost ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Trip stats */}
      {ts && (
        <Section title="Trip Overview" icon="✈️">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
            {ts.from && <Stat label="From" value={ts.from} />}
            {ts.to && <Stat label="To" value={ts.to} />}
            {ts.days != null && <Stat label="Days" value={ts.days} />}
            {ts.travelers != null && <Stat label="Travelers" value={ts.travelers} />}
            {ts.style && <Stat label="Style" value={ts.style} />}
            {totalBudget > 0 && <Stat label="Total Cost" value={`₹${totalBudget.toLocaleString()}`} sub={ts.currency ?? "INR"} />}
          </div>
        </Section>
      )}

      {/* Highlights */}
      {data.highlights && data.highlights.length > 0 && (
        <Section title="Highlights" icon="⭐">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.highlights.map((h, i) => (
              <span key={i} style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(42,157,143,0.08)", border: "1px solid rgba(42,157,143,0.2)", fontSize: "0.8rem", color: colors.accentStrong, fontWeight: 500 }}>{h}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Budget breakdown */}
      {data.budgetBreakdown && data.budgetBreakdown.length > 0 && (
        <Section title="Budget Breakdown" icon="💰">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.budgetBreakdown.map((row, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: "0.82rem", color: colors.textBody }}>{row.category}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: colors.accentStrong }}>
                    ₹{row.amount.toLocaleString()} <span style={{ fontSize: "0.7rem", color: colors.textSubtle }}>({row.percentage}%)</span>
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: "rgba(0,0,0,0.06)" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: colors.accentStrong, width: `${Math.min(row.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {data.budgetWarnings && data.budgetWarnings.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              {data.budgetWarnings.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 10px", background: colors.warningSoft, borderRadius: 8, border: `1px solid rgba(249,115,22,0.2)` }}>
                  <ExclamationTriangleIcon style={{ width: 13, height: 13, color: colors.warning, flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: "0.78rem", color: colors.warning }}>{w}</p>
                </div>
              ))}
            </div>
          )}
          {data.budgetTips && data.budgetTips.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {data.budgetTips.map((t, i) => (
                <p key={i} style={{ margin: 0, fontSize: "0.78rem", color: colors.textMuted, display: "flex", gap: 6 }}>
                  <span style={{ color: colors.accentStrong, flexShrink: 0 }}>💡</span>{t}
                </p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Accommodation */}
      {data.accommodation?.name && (
        <Section title="Accommodation" icon="🏨">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "0.88rem", fontWeight: 700, color: colors.textMain }}>{data.accommodation.name}</p>
              {data.accommodation.location && <p style={{ margin: 0, fontSize: "0.78rem", color: colors.textMuted }}>📍 {data.accommodation.location}</p>}
              {data.accommodation.notes && <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: colors.textBody }}>{data.accommodation.notes}</p>}
            </div>
            {data.accommodation.pricePerNight && (
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: colors.accentStrong }}>₹{data.accommodation.pricePerNight.toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: colors.textSubtle }}>per night</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Food */}
      {data.topFoods && data.topFoods.length > 0 && (
        <Section title="Must-Try Foods" icon="🍽️">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.topFoods.map((f, i) => (
              <span key={i} style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.8rem", color: "#d97706", fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Safety */}
      <Section title="Safety" icon="🛡️">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: data.safetyWarnings?.length ? 10 : 0 }}>
          <span style={{ padding: "4px 14px", borderRadius: 999, background: safety.bg, border: `1px solid ${safety.border}`, fontSize: "0.8rem", fontWeight: 700, color: safety.color }}>{safety.label}</span>
          <InfoTooltip text="Based on your saved plan sections and destination data" />
        </div>
        {data.safetyWarnings && data.safetyWarnings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
            {data.safetyWarnings.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 7, padding: "7px 10px", background: colors.errorSoft, borderRadius: 8, border: "1px solid rgba(220,38,38,0.15)" }}>
                <ExclamationTriangleIcon style={{ width: 13, height: 13, color: colors.error, flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: "0.78rem", color: colors.error }}>{w}</p>
              </div>
            ))}
          </div>
        )}
        {data.safetyTips && data.safetyTips.map((t, i) => (
          <p key={i} style={{ margin: "0 0 4px", fontSize: "0.78rem", color: colors.textMuted, display: "flex", gap: 6 }}>
            <span style={{ color: safety.color, flexShrink: 0 }}>•</span>{t}
          </p>
        ))}
      </Section>

      {/* Weather & timing */}
      {(data.bestTimeToVisit || data.weatherNotes?.length) && (
        <Section title="Best Time & Weather" icon="🌤️">
          {data.bestTimeToVisit && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ padding: "4px 14px", borderRadius: 999, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "0.8rem", fontWeight: 700, color: "#6366f1" }}>
                Best: {data.bestTimeToVisit}
              </span>
            </div>
          )}
          {data.weatherNotes?.map((n, i) => (
            <p key={i} style={{ margin: "0 0 4px", fontSize: "0.78rem", color: colors.textMuted, display: "flex", gap: 6 }}>
              <span style={{ color: "#6366f1", flexShrink: 0 }}>•</span>{n}
            </p>
          ))}
        </Section>
      )}

      {/* Top tips */}
      {data.topTips && data.topTips.length > 0 && (
        <Section title="Top Tips" icon="💡">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.topTips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <CheckCircleIcon style={{ width: 14, height: 14, color: colors.accentStrong, flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textBody }}>{t}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function PlanAnalysisPanel({ planId, sections, latestAnalysis, onAnalysisSaved }: PlanAnalysisPanelProps) {
  const { saveAnalysis } = usePlans();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<PlanAnalysis | undefined>(latestAnalysis);

  if (sections.length === 0) {
    return (
      <div style={{ ...glass.subtle, padding: "16px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <SparklesIcon style={{ width: 16, height: 16, color: colors.textSubtle, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>Save at least one section to your plan before running an analysis.</p>
      </div>
    );
  }

  async function handleAnalyse() {
    setError(null);
    setLoading(true);
    try {
      const content = await generatePlanAnalysis(sections, currentAnalysis?.content);
      const saved = await saveAnalysis(planId, content);
      if (saved) { setCurrentAnalysis(saved); onAnalysisSaved(saved); }
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Try to parse stored content as JSON
  let parsedData: AnalysisData | null = null;
  if (currentAnalysis?.content) {
    try { parsedData = JSON.parse(currentAnalysis.content) as AnalysisData; } catch { /* old prose format */ }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button size="sm" variant="secondary" loading={loading} onClick={handleAnalyse} leftIcon={<SparklesIcon style={{ width: 14, height: 14 }} />}>
          {currentAnalysis ? "Re-analyse" : "Analyse plan"}
        </Button>
        {currentAnalysis && (
          <span style={{ fontSize: "0.72rem", color: colors.textSubtle }}>
            {new Date(currentAnalysis.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {error && <p style={{ margin: 0, fontSize: "0.82rem", color: colors.error, background: colors.errorSoft, borderRadius: 10, padding: "10px 14px" }}>{error}</p>}

      {currentAnalysis && parsedData && <AnalysisView data={parsedData} />}

      {/* Fallback: old prose format */}
      {currentAnalysis && !parsedData && (
        <div style={{ ...glass.subtle, padding: "18px 20px" }}>
          <p style={{ margin: 0, fontSize: "0.88rem", color: colors.textBody, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{currentAnalysis.content}</p>
        </div>
      )}
    </div>
  );
}
