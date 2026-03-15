import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { usePlans } from "../../contexts/PlansContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { UPGRADE_MESSAGES } from "../../lib/planLimits";
import UpgradeModal from "../paywall/UpgradeModal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { colors } from "../../theme";

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePlanModal({ open, onClose }: CreatePlanModalProps) {
  const { createPlan, plans } = usePlans();
  const { canCreatePlan } = useSubscription();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const upgradeMsg = UPGRADE_MESSAGES['maxPlans'];
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Plan name cannot be empty."); return; }

    // Check plan limit before attempting creation
    if (!canCreatePlan(plans.length)) {
      setUpgradeOpen(true);
      return;
    }

    setError(null);
    setLoading(true);
    const plan = await createPlan(name.trim());
    setLoading(false);
    if (!plan) {
      setError("Failed to create plan. Please try again.");
      return;
    }
    onClose();
    navigate(`/plans/${plan.id}`);
  }

  return (
    <>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title={upgradeMsg.title} description={upgradeMsg.description} />
      <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 200,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              width: "100%",
              maxWidth: 420,
              padding: "0 16px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 20,
                border: `1px solid rgba(164,216,225,0.35)`,
                padding: "32px 28px 28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: colors.textMain,
                    letterSpacing: "-0.02em",
                  }}
                >
                  New travel plan
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: colors.textSubtle,
                    display: "flex",
                    padding: 4,
                  }}
                >
                  <XMarkIcon style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input
                  ref={inputRef}
                  label="Plan name"
                  placeholder="e.g. Tokyo Spring 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={error ?? undefined}
                />

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={loading}>
                    Create plan
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
