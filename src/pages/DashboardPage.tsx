import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { usePlans } from "../contexts/PlansContext";
import { useAuth } from "../contexts/AuthContext";
import PlanCard from "../components/plans/PlanCard";
import PlanRecommendationPanel from "../components/plans/PlanRecommendationPanel";
import CreatePlanModal from "../components/plans/CreatePlanModal";
import { colors, glass } from "../theme";

export default function DashboardPage() {
  const { user } = useAuth();
  const { plans, loading, fetchPlans } = usePlans();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const greeting = user?.email?.split("@")[0] ?? "Traveller";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        padding: "100px clamp(16px, 5vw, 60px) 60px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 800,
                color: colors.textMain,
                letterSpacing: "-0.03em",
              }}
            >
              Hey, {greeting} 👋
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: colors.textMuted }}>
              {plans.length === 0
                ? "Create your first travel plan to get started."
                : `You have ${plans.length} travel ${plans.length === 1 ? "plan" : "plans"}.`}
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: colors.accentStrong,
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "filter 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            New plan
          </button>
        </motion.div>

        {/* Recommendation panel — only shown when ≥ 2 plans */}
        {plans.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ ...glass.card, padding: "20px 24px", marginBottom: 28 }}
          >
            <PlanRecommendationPanel />
          </motion.div>
        )}

        {/* Plans grid */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
              color: colors.textSubtle,
              fontSize: "0.9rem",
            }}
          >
            Loading plans…
          </div>
        ) : plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              ...glass.card,
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "2rem", margin: "0 0 12px" }}>🗺️</p>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "1rem",
                fontWeight: 700,
                color: colors.textMain,
              }}
            >
              No plans yet
            </p>
            <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: colors.textMuted }}>
              Create a plan to start organising your trips.
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: colors.accentStrong,
                color: "#ffffff",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Create first plan
            </button>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <PlanCard plan={plan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
