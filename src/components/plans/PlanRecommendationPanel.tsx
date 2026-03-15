import { useState } from "react";
import { SparklesIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { usePlans } from "../../contexts/PlansContext";
import { buildRecommendationPrompt } from "../../lib/planUtils";
import Button from "../ui/Button";
import { colors, glass } from "../../theme";

interface RankedPlan {
  rank: number;
  planName: string;
  rationale: string;
}

async function callGroqRecommendation(prompt: string): Promise<RankedPlan[]> {
  const Groq = (await import("groq-sdk")).default;
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY is not set.");
  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are YatraSathi, an expert AI travel advisor. Always respond with valid JSON only. No markdown, no explanation outside JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.rankedPlans || parsed;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function PlanRecommendationPanel() {
  const { plans } = usePlans();
  const [result, setResult] = useState<RankedPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirement 8.3: need ≥ 2 plans
  if (plans.length < 2) {
    return (
      <div
        style={{
          ...glass.subtle,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <SparklesIcon style={{ width: 18, height: 18, color: colors.textSubtle, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
          Add at least 2 plans to get an AI recommendation on which trip to take first.
        </p>
      </div>
    );
  }

  async function handleRecommend() {
    setError(null);
    setLoading(true);
    try {
      const prompt = buildRecommendationPrompt(plans);
      if (!prompt) {
        setError("Not enough plans to generate a recommendation.");
        return;
      }
      const ranked = await callGroqRecommendation(prompt);
      setResult(ranked);
    } catch (err: any) {
      console.error("AI Recommendation error:", err);
      setError("Failed to get recommendation: " + (err.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrophyIcon style={{ width: 18, height: 18, color: colors.accentStrong }} />
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: colors.textMain }}>
            AI Trip Recommendation
          </span>
        </div>
        <Button size="sm" variant="secondary" loading={loading} onClick={handleRecommend}>
          {result ? "Re-rank" : "Recommend"}
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

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.map((item) => (
            <div
              key={item.rank}
              style={{
                ...glass.subtle,
                padding: "14px 16px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 }}>
                {RANK_MEDALS[item.rank - 1] ?? `#${item.rank}`}
              </span>
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: colors.textMain,
                  }}
                >
                  {item.planName}
                </p>
                <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textMuted, lineHeight: 1.5 }}>
                  {item.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
