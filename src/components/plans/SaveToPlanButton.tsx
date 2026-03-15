import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { BookmarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { usePlans, extractTripLocations } from "../../contexts/PlansContext";
import { useAuth } from "../../contexts/AuthContext";
import type { SectionType, TripPlan } from "../../types";
import { colors } from "../../theme";

interface SaveToPlanButtonProps {
  aiOutput: unknown;
  sectionType: SectionType;
}

export default function SaveToPlanButton({ aiOutput, sectionType }: SaveToPlanButtonProps) {
  const { session } = useAuth();
  const { plans, fetchPlans, saveSection, saveWeatherSnapshot } = usePlans();

  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  // Persistent: once saved, store the plan name — never resets
  const [savedToPlan, setSavedToPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For portal positioning
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Fetch plans when dropdown opens
  useEffect(() => {
    if (open && plans.length === 0) fetchPlans();
  }, [open, plans.length, fetchPlans]);

  // Reposition dropdown whenever it opens
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 240),
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // check if click is inside the portal dropdown
        const portal = document.getElementById("save-plan-portal");
        if (portal && portal.contains(target)) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!session || aiOutput == null) return null;

  async function handleSave() {
    if (!selectedPlanId) return;
    setError(null);
    setSaving(true);
    try {
      await saveSection(selectedPlanId, sectionType, aiOutput);

      if (sectionType === "planner") {
        const locations = extractTripLocations(aiOutput as TripPlan);
        if (locations) {
          await saveWeatherSnapshot(selectedPlanId, locations.source, locations.dest);
        }
      }

      const planName = plans.find((p) => p.id === selectedPlanId)?.name ?? "plan";
      setSavedToPlan(planName);
      setOpen(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isSaved = savedToPlan !== null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => { if (!isSaved) setOpen((v) => !v); }}
        title={isSaved ? `Saved to "${savedToPlan}"` : "Save to a plan"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 16px",
          borderRadius: 999,
          border: `1px solid ${isSaved ? colors.success : "rgba(42,157,143,0.35)"}`,
          background: isSaved ? colors.successSoft : "rgba(42,157,143,0.08)",
          color: isSaved ? colors.success : colors.accentStrong,
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: isSaved ? "default" : "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {isSaved
          ? <CheckIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
          : <BookmarkIcon style={{ width: 14, height: 14, flexShrink: 0 }} />}
        {isSaved ? `Saved to "${savedToPlan}"` : "Save to Plan"}
      </button>

      {/* Portal dropdown — renders at document body level to avoid z-index clipping */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="save-plan-portal"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: dropdownPos.width,
                backgroundColor: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 14,
                border: `1px solid rgba(164,216,225,0.4)`,
                boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                padding: "14px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Select a plan
              </p>

              {plans.length === 0 ? (
                <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textSubtle }}>
                  No plans yet. Create one from the dashboard.
                </p>
              ) : (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: `1px solid rgba(0,0,0,0.08)`,
                    background: "rgba(255,255,255,0.8)",
                    fontSize: "0.85rem",
                    fontFamily: "Inter, sans-serif",
                    color: colors.textMain,
                    outline: "none",
                  }}
                >
                  <option value="">— Choose plan —</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              {error && (
                <p style={{ margin: 0, fontSize: "0.78rem", color: colors.error }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid rgba(0,0,0,0.08)`, background: "transparent", fontSize: "0.82rem", cursor: "pointer", color: colors.textMuted, fontFamily: "Inter, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedPlanId || saving}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: !selectedPlanId || saving ? "rgba(42,157,143,0.4)" : colors.accentStrong,
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: !selectedPlanId || saving ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
