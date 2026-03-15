
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { supabase } from "../../lib/supabase";
import FakePaymentModal from "./FakePaymentModal";
import CompleteProfileModal from "./CompleteProfileModal";
import { colors } from "../../theme";

interface PaymentButtonProps {
  plan: "basic" | "pro";
  period: "monthly" | "annual";
  label: string;
  highlight?: boolean;
  style?: React.CSSProperties;
}

const AMOUNTS: Record<string, Record<string, number>> = {
  basic: { monthly: 19900, annual: 169900 },
  pro:   { monthly: 49900, annual: 399900 },
};

export default function PaymentButton({ plan, period, label, highlight = false, style }: PaymentButtonProps) {
  const { user, session } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const isCurrentPlan = currentPlan === plan;
  const amount = AMOUNTS[plan][period];

  async function handleClick() {
    if (!session || !user) { navigate("/signup?redirect=/pricing"); return; }
    if (isCurrentPlan) return;

    setChecking(true);
    // Check if profile is complete
    const { data } = await supabase
      .from("user_profiles")
      .select("full_name, age, phone")
      .eq("user_id", user.id)
      .maybeSingle();
    setChecking(false);

    const isComplete = data?.full_name && data?.age && data?.phone;
    if (!isComplete) {
      setProfileOpen(true);
    } else {
      setPaymentOpen(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isCurrentPlan || checking}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
          background: isCurrentPlan ? "rgba(0,0,0,0.08)" : checking ? "rgba(42,157,143,0.5)" : highlight ? "#7c3aed" : colors.accentStrong,
          color: isCurrentPlan ? colors.textSubtle : "#fff",
          fontSize: "0.9rem", fontWeight: 700,
          cursor: isCurrentPlan || checking ? "default" : "pointer",
          fontFamily: "Inter,sans-serif", transition: "filter 0.2s",
          ...style,
        }}
        onMouseEnter={(e) => { if (!isCurrentPlan && !checking) e.currentTarget.style.filter = "brightness(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
      >
        {checking ? "Checking…" : isCurrentPlan ? "Current Plan" : label}
      </button>

      {user && (
        <>
          <CompleteProfileModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            userId={user.id}
            onCompleted={() => { setProfileOpen(false); setPaymentOpen(true); }}
          />
          <FakePaymentModal
            open={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            plan={plan}
            period={period}
            amount={amount}
            userId={user.id}
            userEmail={user.email ?? ""}
          />
        </>
      )}
    </>
  );
}
