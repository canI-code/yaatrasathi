import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
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

export default function PlanAnalysisPanel({
  planId,
  sections,
  latestAnalysis,
  onAnalysisSaved,
}: PlanAnalysisPanelProps) {
  const { saveAnalysis } = usePlans();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<PlanAnalysis | undefined>(latestAnalysis);

  // Requirement 5.4: no sections → show informational message
  if (sections.length === 0) {
    return (
      <div
        style={{
          ...glass.subtle,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <SparklesIcon style={{ width: 16, height: 16, color: colors.textSubtle, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
          Save at least one section to your plan before running an analysis.
        </p>
      </div>
    );
  }

  async function handleAnalyse() {
    setError(null);
    setLoading(true);
    try {
      // Requirement 5.3: pass prior analysis as context if it exists
      const content = await generatePlanAnalysis(
        sections,
        currentAnalysis?.content
      );
      // Requirement 5.2: persist to DB
      const saved = await saveAnalysis(planId, content);
      if (saved) {
        setCurrentAnalysis(saved);
        onAnalysisSaved(saved);
      }
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button
          size="sm"
          variant="secondary"
          loading={loading}
          onClick={handleAnalyse}
          leftIcon={<SparklesIcon style={{ width: 14, height: 14 }} />}
        >
          {currentAnalysis ? "Re-analyse" : "Analyse plan"}
        </Button>
      </div>

      {error && (
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: colors.error,
            background: colors.errorSoft,
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          {error}
        </p>
      )}

      {currentAnalysis && (
        <div
          style={{
            ...glass.subtle,
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: colors.textSubtle,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {new Date(currentAnalysis.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: colors.textBody,
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {currentAnalysis.content}
          </p>
        </div>
      )}
    </div>
  );
}
