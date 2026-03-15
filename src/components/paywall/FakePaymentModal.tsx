
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, LockClosedIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { colors } from "../../theme";

interface FakePaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: "basic" | "pro";
  period: "monthly" | "annual";
  amount: number;
  userId: string;
  userEmail: string;
}

const PLAN_LABELS = { basic: "YatraSathi Basic", pro: "YatraSathi Pro" };
const PERIOD_LABELS = { monthly: "Monthly", annual: "Annual" };

export default function FakePaymentModal({ open, onClose, plan, period, amount, userId, userEmail }: FakePaymentModalProps) {
  const { refresh } = useSubscription();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [card, setCard] = useState("4111 1111 1111 1111");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!name.trim()) { setError("Please enter cardholder name."); return; }
    setError(null);
    setStep("processing");

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));

    // Activate plan directly in Supabase
    const expiresAt = new Date();
    if (period === "annual") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan,
      status: "active",
      period,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      razorpay_subscription_id: `demo_${Date.now()}`,
    }, { onConflict: "user_id" });

    await refresh();
    setStep("success");
  }

  function handleClose() {
    setStep("form");
    setError(null);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === "form" ? handleClose : undefined}
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420,
              maxHeight: "90vh", overflowY: "auto",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
              background: "#fff",
            }}
          >

              {/* Razorpay-style header */}
              <div style={{ background: "#2A9D8F", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.7)", fontFamily: "Inter,sans-serif" }}>YatraSathi</p>
                  <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff", fontFamily: "Inter,sans-serif" }}>
                    ₹{(amount / 100).toLocaleString()}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontFamily: "Inter,sans-serif" }}>
                    {PLAN_LABELS[plan]} — {PERIOD_LABELS[period]}
                  </p>
                </div>
                {step === "form" && (
                  <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <XMarkIcon style={{ width: 14, height: 14, color: "#fff" }} />
                  </button>
                )}
              </div>

              <div style={{ padding: "20px" }}>
                {step === "form" && (
                  <>
                    <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "#666", fontFamily: "Inter,sans-serif" }}>
                      {userEmail}
                    </p>

                    {[
                      { label: "Card Number", value: card, onChange: setCard, placeholder: "4111 1111 1111 1111" },
                      { label: "Cardholder Name", value: name, onChange: setName, placeholder: "Name on card" },
                    ].map((f) => (
                      <div key={f.label} style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#555", marginBottom: 4, fontFamily: "Inter,sans-serif" }}>{f.label}</label>
                        <input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: "0.88rem", fontFamily: "Inter,sans-serif", outline: "none", boxSizing: "border-box" }} />
                      </div>
                    ))}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: "Expiry (MM/YY)", value: expiry, onChange: setExpiry },
                        { label: "CVV", value: cvv, onChange: setCvv },
                      ].map((f) => (
                        <div key={f.label}>
                          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#555", marginBottom: 4, fontFamily: "Inter,sans-serif" }}>{f.label}</label>
                          <input value={f.value} onChange={(e) => f.onChange(e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: "0.88rem", fontFamily: "Inter,sans-serif", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>

                    {error && <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "#dc2626", fontFamily: "Inter,sans-serif" }}>{error}</p>}

                    <button onClick={handlePay}
                      style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: "#2A9D8F", color: "#fff", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <LockClosedIcon style={{ width: 14, height: 14 }} />
                      Pay ₹{(amount / 100).toLocaleString()} Securely
                    </button>

                    <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: "0.68rem", color: "#aaa", fontFamily: "Inter,sans-serif" }}>
                      Secured by Razorpay · 256-bit SSL
                    </p>
                  </>
                )}

                {step === "processing" && (
                  <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 40, height: 40, border: "3px solid rgba(42,157,143,0.2)", borderTopColor: "#2A9D8F", borderRadius: "50%", margin: "0 auto 16px" }} />
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#333", fontFamily: "Inter,sans-serif" }}>Processing payment…</p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#999", fontFamily: "Inter,sans-serif" }}>Please do not close this window</p>
                  </div>
                )}

                {step === "success" && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <CheckCircleIcon style={{ width: 48, height: 48, color: "#16a34a", margin: "0 auto 12px" }} />
                    <p style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 800, color: "#1B2A3B", fontFamily: "Inter,sans-serif" }}>Payment Successful!</p>
                    <p style={{ margin: "0 0 20px", fontSize: "0.85rem", color: "#666", fontFamily: "Inter,sans-serif" }}>
                      Your {PLAN_LABELS[plan]} plan is now active.
                    </p>
                    <button onClick={handleClose}
                      style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#2A9D8F", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                      Continue
                    </button>
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
