
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCircleIcon, LockClosedIcon, ChartBarIcon, CreditCardIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { usePlans } from "../contexts/PlansContext";
import { supabase } from "../lib/supabase";
import { colors, glass } from "../theme";

const PLAN_COLORS = { free: colors.textMuted, basic: colors.accentStrong, pro: "#7c3aed" };
const PLAN_LABELS = { free: "Free", basic: "Basic", pro: "Pro" };

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ ...glass.card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(42,157,143,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.72rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: colors.textMain, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: "0.72rem", color: colors.textSubtle }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { plan, usage, refresh } = useSubscription();
  const { plans, fetchPlans } = usePlans();

  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "password" | "plan">("overview");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPlans();
    refresh();
    // Load existing profile
    if (user) {
      supabase.from("user_profiles").select("full_name, age, phone").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) { setFullName(data.full_name ?? ""); setAge(String(data.age ?? "")); setPhone(data.phone ?? ""); }
        });
    }
  }, [fetchPlans, refresh, user]);

  const totalSections = plans.reduce((s, p) => s + (p.sections?.length ?? 0), 0);
  const planColor = PLAN_COLORS[plan];
  const planLabel = PLAN_LABELS[plan];

  async function handleChangePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) setPwMsg({ type: "error", text: error.message });
    else { setPwMsg({ type: "success", text: "Password updated successfully." }); setNewPassword(""); setConfirmPassword(""); }
  }

  async function handleSaveProfile() {
    if (!fullName.trim()) { setProfileMsg({ type: "error", text: "Full name is required." }); return; }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) { setProfileMsg({ type: "error", text: "Please enter a valid age (13–120)." }); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setProfileMsg({ type: "error", text: "Please enter a valid 10-digit phone number." }); return; }
    setProfileLoading(true);
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user!.id, full_name: fullName.trim(), age: ageNum, phone: phone.trim(), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setProfileLoading(false);
    if (error) setProfileMsg({ type: "error", text: error.message });
    else setProfileMsg({ type: "success", text: "Profile saved successfully." });
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <ChartBarIcon style={{ width: 15, height: 15 }} /> },
    { id: "profile", label: "My Profile", icon: <UserCircleIcon style={{ width: 15, height: 15 }} /> },
    { id: "plan", label: "Plan & Billing", icon: <CreditCardIcon style={{ width: 15, height: 15 }} /> },
    { id: "password", label: "Change Password", icon: <LockClosedIcon style={{ width: 15, height: 15 }} /> },
  ] as const;

  return (
    <PageWrapper>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: colors.accentStrong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>
                {(user?.email?.[0] ?? "U").toUpperCase()}
              </span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: colors.textMain, letterSpacing: "-0.02em" }}>
                {user?.email?.split("@")[0]}
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: colors.textMuted }}>{user?.email}</p>
              <span style={{ display: "inline-block", marginTop: 6, fontSize: "0.72rem", fontWeight: 700, color: planColor, background: `${planColor}18`, padding: "2px 10px", borderRadius: 999, border: `1px solid ${planColor}33` }}>
                {planLabel} Plan
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.5)", borderRadius: 14, padding: 5, border: "1px solid rgba(164,216,225,0.25)" }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: "none", background: activeTab === tab.id ? colors.accentStrong : "transparent", color: activeTab === tab.id ? "#fff" : colors.textMuted, fontSize: "0.82rem", fontWeight: activeTab === tab.id ? 700 : 500, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
              <StatCard icon={<SparklesIcon style={{ width: 18, height: 18, color: colors.accentStrong }} />} label="AI Queries Today" value={usage.ai_queries} sub={plan === "pro" ? "Unlimited" : `of ${plan === "basic" ? 50 : 5}`} />
              <StatCard icon={<ChartBarIcon style={{ width: 18, height: 18, color: colors.accentStrong }} />} label="Saved Plans" value={plans.length} sub={plan === "pro" ? "Unlimited" : `of ${plan === "basic" ? 10 : 1}`} />
              <StatCard icon={<UserCircleIcon style={{ width: 18, height: 18, color: colors.accentStrong }} />} label="Total Sections" value={totalSections} sub="across all plans" />
              <StatCard icon={<CreditCardIcon style={{ width: 18, height: 18, color: planColor }} />} label="Current Plan" value={planLabel} sub="Active" />
            </div>

            {/* Usage bars */}
            <div style={{ ...glass.card, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>Today's Usage</h3>
              {[
                { label: "AI Queries", used: usage.ai_queries, max: plan === "pro" ? -1 : plan === "basic" ? 50 : 5 },
                { label: "Chat Messages", used: usage.chat_msgs, max: plan === "pro" ? -1 : plan === "basic" ? 100 : 0 },
              ].map((item) => {
                const pct = item.max === -1 ? 20 : item.max === 0 ? 100 : Math.min((item.used / item.max) * 100, 100);
                const isUnlimited = item.max === -1;
                return (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.82rem", color: colors.textBody }}>{item.label}</span>
                      <span style={{ fontSize: "0.78rem", color: colors.textSubtle }}>{isUnlimited ? "Unlimited" : `${item.used} / ${item.max}`}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "rgba(0,0,0,0.06)" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: pct > 80 ? colors.warning : colors.accentStrong, width: `${isUnlimited ? 20 : pct}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent plans */}
            {plans.length > 0 && (
              <div style={{ ...glass.card, padding: "20px 24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>Recent Plans</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plans.slice(0, 5).map((p) => (
                    <Link key={p.id} to={`/plans/${p.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(164,216,225,0.2)" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: colors.textMain }}>{p.name}</span>
                      <span style={{ fontSize: "0.75rem", color: colors.textSubtle }}>{p.sections?.length ?? 0} sections</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Plan tab */}
        {activeTab === "plan" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...glass.card, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Plan</p>
                  <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: planColor, letterSpacing: "-0.02em" }}>{planLabel}</p>
                </div>
                {plan !== "pro" && (
                  <Link to="/pricing">
                    <Button size="sm" leftIcon={<SparklesIcon style={{ width: 14, height: 14 }} />}>
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { label: "AI Queries/day", value: plan === "pro" ? "Unlimited" : plan === "basic" ? "50" : "5" },
                  { label: "Saved Plans", value: plan === "pro" ? "Unlimited" : plan === "basic" ? "10" : "1" },
                  { label: "Plan Analysis", value: plan === "free" ? "Not included" : "Included" },
                  { label: "Plan Chat", value: plan === "free" ? "Not included" : "Included" },
                  { label: "PDF Export", value: plan === "free" ? "Not included" : "Included" },
                  { label: "Cross-plan AI Rec.", value: plan === "pro" ? "Included" : "Not included" },
                ].map((item) => (
                  <div key={item.label} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 10, border: "1px solid rgba(164,216,225,0.2)" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.68rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: item.value.includes("Not") ? colors.textSubtle : colors.textMain }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ ...glass.card, padding: "24px", maxWidth: 420 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700, color: colors.textMain }}>Personal Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name", value: fullName, onChange: setFullName, placeholder: "e.g. Rahul Sharma", type: "text" },
                  { label: "Age", value: age, onChange: setAge, placeholder: "e.g. 25", type: "number" },
                  { label: "Phone Number", value: phone, onChange: setPhone, placeholder: "e.g. 9876543210", type: "tel" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontFamily: "Inter,sans-serif", color: colors.textMain, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                {profileMsg && (
                  <p style={{ margin: 0, fontSize: "0.82rem", color: profileMsg.type === "success" ? colors.success : colors.error, background: profileMsg.type === "success" ? colors.successSoft : colors.errorSoft, padding: "8px 12px", borderRadius: 8 }}>{profileMsg.text}</p>
                )}
                <Button onClick={handleSaveProfile} loading={profileLoading} leftIcon={<UserCircleIcon style={{ width: 14, height: 14 }} />}>
                  Save Profile
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Password tab */}
        {activeTab === "password" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ ...glass.card, padding: "24px", maxWidth: 420 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700, color: colors.textMain }}>Change Password</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "New Password", value: newPassword, onChange: setNewPassword },
                  { label: "Confirm Password", value: confirmPassword, onChange: setConfirmPassword },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>{f.label}</label>
                    <input type="password" value={f.value} onChange={(e) => f.onChange(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontFamily: "Inter,sans-serif", color: colors.textMain, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                {pwMsg && (
                  <p style={{ margin: 0, fontSize: "0.82rem", color: pwMsg.type === "success" ? colors.success : colors.error, background: pwMsg.type === "success" ? colors.successSoft : colors.errorSoft, padding: "8px 12px", borderRadius: 8 }}>{pwMsg.text}</p>
                )}
                <Button onClick={handleChangePassword} loading={pwLoading} leftIcon={<LockClosedIcon style={{ width: 14, height: 14 }} />}>
                  Update Password
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
