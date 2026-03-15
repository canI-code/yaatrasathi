import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlans } from "../contexts/PlansContext";
import type { Plan, PlanAnalysis, PlanSection, PlanVersion, SectionType } from "../types";
import PlanVersionHistory from "../components/plans/PlanVersionHistory";
import WeatherSnapshotCard from "../components/plans/WeatherSnapshotCard";
import PlanAnalysisPanel from "../components/plans/PlanAnalysisPanel";
import PlanChatPanel from "../components/plans/PlanChatPanel";
import SectionFullView from "../components/plans/SectionFullView";
import { colors, glass } from "../theme";

// ── Constants ────────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; emoji: string }> = {
  planner:    { label: "Trip Planner",        emoji: "✈️" },
  budget:     { label: "Budget",              emoji: "💰" },
  hotels:     { label: "Hotels",              emoji: "🏨" },
  food:       { label: "Food Guide",          emoji: "🍽️" },
  transport:  { label: "Transport",           emoji: "🚗" },
  safety:     { label: "Safety",              emoji: "🛡️" },
  "best-time":{ label: "Best Time",           emoji: "📅" },
  weather:    { label: "Weather",             emoji: "🌤️" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Render section data as a readable summary */
function SectionDataView({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;

  // Arrays (hotels, food, transport, safety, best-time)
  if (Array.isArray(data)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(data as Record<string, unknown>[]).slice(0, 6).map((item, i) => (
          <div
            key={i}
            style={{
              ...glass.subtle,
              padding: "10px 14px",
              fontSize: "0.82rem",
              color: colors.textBody,
              lineHeight: 1.5,
            }}
          >
            {Object.entries(item)
              .filter(([, v]) => typeof v === "string" || typeof v === "number")
              .slice(0, 4)
              .map(([k, v]) => (
                <span key={k} style={{ marginRight: 12 }}>
                  <span style={{ color: colors.textSubtle, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}: </span>
                  {String(v)}
                </span>
              ))}
          </div>
        ))}
        {(data as unknown[]).length > 6 && (
          <p style={{ margin: 0, fontSize: "0.78rem", color: colors.textSubtle }}>
            +{(data as unknown[]).length - 6} more items
          </p>
        )}
      </div>
    );
  }

  // Object (planner, budget, weather)
  const obj = data as Record<string, unknown>;
  const topFields = Object.entries(obj)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .slice(0, 8);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
      {topFields.map(([k, v]) => (
        <div key={k}>
          <span style={{ fontSize: "0.72rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}: </span>
          <span style={{ fontSize: "0.85rem", color: colors.textBody, fontWeight: 500 }}>{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Section tab content (extracted to avoid IIFE in JSX) ────────────────────

function SectionTab({
  planId,
  type,
  section,
  versions,
  onRestored,
}: {
  planId: string;
  type: SectionType;
  section: PlanSection | undefined;
  versions: PlanVersion[];
  onRestored: () => void;
}) {
  const meta = SECTION_META[type];

  if (!section) {
    return (
      <div style={{ ...glass.card, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.88rem", color: colors.textSubtle }}>
          No data saved for {meta?.label} yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...glass.card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>
            {meta?.emoji} {meta?.label}
          </h2>
          <span style={{ fontSize: "0.75rem", color: colors.textSubtle }}>
            Saved {formatDate(section.saved_at)}
          </span>
        </div>
        <SectionDataView data={section.data} />
      </div>

      {/* Full rich output — same as the original planning page */}
      <div style={{ ...glass.card, padding: "20px 24px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>
          Full Details
        </h2>
        <SectionFullView type={type} data={section.data} />
      </div>

      <div style={{ ...glass.card, padding: "20px 24px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>
          Version History ({versions.length}/4)
        </h2>
        <PlanVersionHistory
          planId={planId}
          sectionType={type}
          versions={versions}
          onRestored={onRestored}
        />
      </div>
    </div>
  );
}

type TabId = SectionType | "overview";

// ── Main component ───────────────────────────────────────────────────────────

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const { fetchPlan } = usePlans();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [latestAnalysis, setLatestAnalysis] = useState<PlanAnalysis | undefined>();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const load = useCallback(async () => {
    if (!planId) return;
    const result = await fetchPlan(planId);
    setPlan(result);
    setLatestAnalysis(result?.latestAnalysis);
  }, [planId, fetchPlan]);

  useEffect(() => { load(); }, [load]);

  // ── Loading ──
  if (plan === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: colors.textSubtle, fontSize: "0.9rem" }}>
        Loading plan…
      </div>
    );
  }

  // ── Not found ──
  if (plan === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "80px 16px" }}>
        <p style={{ fontSize: "2rem", margin: 0 }}>🗺️</p>
        <p style={{ fontSize: "1.1rem", fontWeight: 700, color: colors.textMain, margin: 0 }}>Plan not found</p>
        <p style={{ fontSize: "0.88rem", color: colors.textMuted, margin: 0 }}>This plan doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const sections = plan.sections ?? [];
  const allVersions = plan.versions ?? [];

  // Build tab list: Overview always first, then one tab per saved section type
  const savedTypes = sections.map((s) => s.section_type);
  const tabs: TabId[] = ["overview", ...savedTypes];

  // Helpers to get section/versions for a given type
  function getSectionByType(type: SectionType): PlanSection | undefined {
    return sections.find((s) => s.section_type === type);
  }
  function getVersionsByType(type: SectionType): PlanVersion[] {
    return allVersions.filter((v) => v.section_type === type);
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.background, padding: "100px clamp(16px, 5vw, 60px) 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: colors.textMain, letterSpacing: "-0.03em" }}>
            {plan.name}
          </h1>
          {plan.destination && (
            <p style={{ margin: 0, fontSize: "0.88rem", color: colors.accentStrong, fontWeight: 500 }}>
              📍 {plan.destination}
            </p>
          )}
          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: colors.textSubtle }}>
            {sections.length === 0
              ? "No sections saved yet — use Save to Plan on any planning page."
              : `${sections.length} section${sections.length !== 1 ? "s" : ""} saved`}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            marginBottom: 20,
            padding: "6px",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 16,
            border: `1px solid rgba(164,216,225,0.25)`,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const meta = tab === "overview" ? null : SECTION_META[tab as SectionType];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: isActive ? colors.accentStrong : "transparent",
                  color: isActive ? "#ffffff" : colors.textMuted,
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {tab === "overview" ? "🗂️ Overview" : `${meta?.emoji} ${meta?.label}`}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Overview tab ── */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Saved sections summary */}
                <div style={{ ...glass.card, padding: "20px 24px" }}>
                  <h2 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>Saved Sections</h2>
                  {sections.length === 0 ? (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textSubtle }}>
                      Nothing saved yet. Use "Save to Plan" on any planning page.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sections.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveTab(s.section_type)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 999,
                            background: "rgba(42,157,143,0.08)",
                            border: `1px solid rgba(42,157,143,0.2)`,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: colors.accentStrong,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {SECTION_META[s.section_type]?.emoji} {SECTION_META[s.section_type]?.label}
                          <span style={{ marginLeft: 6, fontSize: "0.7rem", color: colors.textSubtle }}>
                            {formatDate(s.saved_at)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weather snapshot */}
                {plan.weatherSnapshot && (
                  <div style={{ ...glass.card, padding: "20px 24px" }}>
                    <h2 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>Weather Snapshot</h2>
                    <WeatherSnapshotCard snapshot={plan.weatherSnapshot} />
                  </div>
                )}

                {/* AI Analysis */}
                <div style={{ ...glass.card, padding: "20px 24px" }}>
                  <h2 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>AI Plan Analysis</h2>
                  <PlanAnalysisPanel
                    planId={plan.id}
                    sections={sections}
                    latestAnalysis={latestAnalysis}
                    onAnalysisSaved={(a) => setLatestAnalysis(a)}
                  />
                </div>

                {/* AI Chat */}
                <div style={{ ...glass.card, padding: "20px 24px" }}>
                  <h2 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>Plan Chat</h2>
                  <PlanChatPanel sections={sections} />
                </div>
              </div>
            )}

            {/* ── Section tabs ── */}
            {activeTab !== "overview" && (
              <SectionTab
                planId={plan.id}
                type={activeTab as SectionType}
                section={getSectionByType(activeTab as SectionType)}
                versions={getVersionsByType(activeTab as SectionType)}
                onRestored={load}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
