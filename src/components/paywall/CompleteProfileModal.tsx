
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, UserCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme";

interface CompleteProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onCompleted: () => void;
}

export default function CompleteProfileModal({ open, onClose, userId, onCompleted }: CompleteProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSave() {
    if (!fullName.trim()) { setError("Full name is required."); return; }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) { setError("Please enter a valid age (13–120)."); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setError("Please enter a valid 10-digit phone number."); return; }

    setError(null);
    setLoading(true);

    const { error: dbErr } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      full_name: fullName.trim(),
      age: ageNum,
      phone: phone.trim(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    setLoading(false);
    if (dbErr) { setError(dbErr.message); return; }
    setDone(true);
    setTimeout(() => { onCompleted(); onClose(); setDone(false); }, 1200);
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 9100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderRadius: 20, border: "1px solid rgba(164,216,225,0.35)", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(42,157,143,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserCircleIcon style={{ width: 20, height: 20, color: colors.accentStrong }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: colors.textMain, fontFamily: "Inter,sans-serif" }}>Complete Your Profile</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textMuted, fontFamily: "Inter,sans-serif" }}>Required before upgrading your plan</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textSubtle, display: "flex", padding: 4 }}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {done ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <CheckCircleIcon style={{ width: 40, height: 40, color: colors.success, margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: colors.textMain, fontFamily: "Inter,sans-serif" }}>Profile saved!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Full Name", value: fullName, onChange: setFullName, placeholder: "e.g. Rahul Sharma", type: "text" },
                    { label: "Age", value: age, onChange: setAge, placeholder: "e.g. 25", type: "number" },
                    { label: "Phone Number", value: phone, onChange: setPhone, placeholder: "e.g. 9876543210", type: "tel" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: colors.textMuted, marginBottom: 5, fontFamily: "Inter,sans-serif" }}>{f.label}</label>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontFamily: "Inter,sans-serif", color: colors.textMain, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}

                  {error && <p style={{ margin: 0, fontSize: "0.8rem", color: colors.error, background: colors.errorSoft, padding: "8px 12px", borderRadius: 8, fontFamily: "Inter,sans-serif" }}>{error}</p>}

                  <button onClick={handleSave} disabled={loading}
                    style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: loading ? "rgba(42,157,143,0.4)" : colors.accentStrong, color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "Inter,sans-serif", marginTop: 4 }}>
                    {loading ? "Saving…" : "Save & Continue to Payment"}
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
