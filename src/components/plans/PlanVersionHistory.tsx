import { useState } from "react";
import { ClockIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { usePlans } from "../../contexts/PlansContext";
import type { PlanVersion, SectionType } from "../../types";
import { colors, glass } from "../../theme";

interface PlanVersionHistoryProps {
  planId: string;
  sectionType: SectionType;
  versions: PlanVersion[];
  onRestored: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlanVersionHistory({
  planId,
  sectionType,
  versions,
  onRestored,
}: PlanVersionHistoryProps) {
  const { restoreVersion } = usePlans();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (versions.length === 0) {
    return (
      <p style={{ fontSize: "0.82rem", color: colors.textSubtle, margin: 0 }}>
        No previous versions yet. Each time you re-save this section a version is created here.
      </p>
    );
  }

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    await restoreVersion(planId, versionId, sectionType);
    setRestoringId(null);
    onRestored();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {versions.map((v, i) => (
        <div
          key={v.id}
          style={{
            ...glass.subtle,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockIcon style={{ width: 13, height: 13, color: colors.textSubtle, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: colors.textMain }}>
                Version {versions.length - i}
              </p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: colors.textSubtle }}>
                {formatDate(v.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRestore(v.id)}
            disabled={restoringId === v.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 8,
              border: `1px solid rgba(42,157,143,0.3)`,
              background: "rgba(42,157,143,0.06)",
              color: colors.accentStrong,
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: restoringId === v.id ? "wait" : "pointer",
              opacity: restoringId === v.id ? 0.6 : 1,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <ArrowUturnLeftIcon style={{ width: 11, height: 11 }} />
            {restoringId === v.id ? "Restoring…" : "Restore"}
          </button>
        </div>
      ))}
    </div>
  );
}
