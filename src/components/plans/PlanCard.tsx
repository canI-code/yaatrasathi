import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon, MapPinIcon, FolderIcon, ClockIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { usePlans } from "../../contexts/PlansContext";
import type { Plan } from "../../types";
import { colors, glass } from "../../theme";

interface PlanCardProps {
  plan: Plan;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { deletePlan } = usePlans();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sectionCount = plan.sections?.length ?? 0;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await deletePlan(plan.id);
  }

  function handleCardClick() {
    navigate(`/plans/${plan.id}`);
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      style={{
        ...glass.card,
        padding: "20px 22px",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Plan name */}
      <h3
        style={{
          margin: 0,
          fontSize: "1rem",
          fontWeight: 700,
          color: colors.textMain,
          letterSpacing: "-0.01em",
          paddingRight: 32,
        }}
      >
        {plan.name}
      </h3>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px" }}>
        {plan.destination && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.8rem",
              color: colors.accentStrong,
              fontWeight: 500,
            }}
          >
            <MapPinIcon style={{ width: 13, height: 13 }} />
            {plan.destination}
          </span>
        )}

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.8rem",
            color: colors.textMuted,
          }}
        >
          <FolderIcon style={{ width: 13, height: 13 }} />
          {sectionCount} {sectionCount === 1 ? "section" : "sections"}
        </span>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.8rem",
            color: colors.textSubtle,
          }}
        >
          <ClockIcon style={{ width: 13, height: 13 }} />
          {formatDate(plan.updated_at)}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title={confirming ? "Click again to confirm delete" : "Delete plan"}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: confirming ? colors.errorSoft : "transparent",
          border: confirming ? `1px solid ${colors.error}` : "none",
          borderRadius: 8,
          cursor: "pointer",
          color: confirming ? colors.error : colors.textSubtle,
          padding: confirming ? "3px 8px" : 4,
          fontSize: "0.72rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4,
          transition: "all 0.15s",
        }}
        onMouseLeave={() => setConfirming(false)}
      >
        <TrashIcon style={{ width: 14, height: 14 }} />
        {confirming && "Confirm?"}
      </button>
    </motion.div>
  );
}
