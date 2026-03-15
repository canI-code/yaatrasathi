import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import { colors } from "../theme";

const PLANS = [
  {
    id: "free", name: "Free", tagline: "Try before you fly",
    monthlyINR: 0, annualINR: 0, color: colors.textMuted,
    highlight: false, badge: null, ctaVariant: "outline",
    cta: "Get Started Free", ctaLink: "/signup",
    features: [
      { text: "5 AI queries per day across all tools", included: true },
      { text: "Interactive Map — explore mode", included: true },
      { text: "General AI Chat — 20 messages/day", included: true },
      { text: "1 saved travel plan", included: true },
      { text: "Save sections to plan", included: false },
      { text: "Version history", included: false },
      { text: "AI Plan Analysis", included: false },
      { text: "Plan Chat assistant", included: false },
      { text: "Cross-plan AI Recommendation", included: false },
      { text: "PDF export", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "basic", name: "Basic", tagline: "For the regular explorer",
    monthlyINR: 199, annualINR: 1699, color: colors.accentStrong,
    highlight: false, badge: null, ctaVariant: "outline",
    cta: "Start Basic", ctaLink: "/signup?plan=basic",
    features: [
      { text: "50 AI queries per day across all tools", included: true },
      { text: "Interactive Map — all tools", included: true },
      { text: "General AI Chat — 100 messages/day", included: true },
      { text: "10 saved travel plans", included: true },
      { text: "Save sections to plan", included: true },
      { text: "Version history (4 versions/section)", included: true },
      { text: "AI Plan Analysis (on demand)", included: true },
      { text: "Plan Chat assistant", included: true },
      { text: "Cross-plan AI Recommendation", included: false },
      { text: "PDF export", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro", name: "Pro", tagline: "For frequent & power travelers",
    monthlyINR: 499, annualINR: 3999, color: "#7C3AED",
    highlight: true, badge: "Most Popular", ctaVariant: "filled",
    cta: "Go Pro", ctaLink: "/signup?plan=pro",
    features: [
      { text: "Unlimited AI queries across all tools", included: true },
      { text: "Interactive Map — all tools + routing", included: true },
      { text: "General AI Chat — unlimited", included: true },
      { text: "Unlimited saved travel plans", included: true },
      { text: "Save sections to plan", included: true },
      { text: "Version history (4 versions/section)", included: true },
      { text: "AI Plan Analysis — unlimited", included: true },
      { text: "Plan Chat assistant — unlimited", included: true },
      { text: "Cross-plan AI Recommendation", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const FAQS = [
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade anytime. Changes take effect at the start of your next billing cycle." },
  { q: "What happens to my plans if I downgrade?", a: "Your data is never deleted. You can view existing plans but cannot create new ones beyond the free limit until you upgrade." },
  { q: "Is there a free trial for paid plans?", a: "The Free plan lets you explore all features with daily limits. No credit card required." },
  { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, and net banking via Razorpay." },
  { q: "Are prices inclusive of GST?", a: "Displayed prices are exclusive of GST. 18% GST will be added at checkout as per Indian tax regulations." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageWrapper>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, marginBottom: 12, letterSpacing: "-0.03em" }}>
            Simple, <GradientText>honest pricing</GradientText>
          </h1>
          <p style={{ fontSize: "1.05rem", color: colors.textMuted, maxWidth: 520, margin: "0 auto 28px" }}>
            Plan smarter trips with AI. Start free, upgrade when you need more.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderRadius: 999, padding: "5px 6px", border: "1px solid rgba(164,216,225,0.3)" }}>
            <button onClick={() => setAnnual(false)} style={{ padding: "7px 20px", borderRadius: 999, border: "none", background: !annual ? colors.accentStrong : "transparent", color: !annual ? "#fff" : colors.textMuted, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{ padding: "7px 20px", borderRadius: 999, border: "none", background: annual ? colors.accentStrong : "transparent", color: annual ? "#fff" : colors.textMuted, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
              Annual
              <span style={{ fontSize: "0.7rem", background: "rgba(22,163,74,0.15)", color: "#16a34a", padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>Save 30%</span>
            </button>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 64, alignItems: "start" }}>
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{ background: plan.highlight ? "rgba(124,58,237,0.04)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 24, border: plan.highlight ? "2px solid rgba(124,58,237,0.35)" : "1px solid rgba(164,216,225,0.3)", padding: "28px 26px", position: "relative", boxShadow: plan.highlight ? "0 8px 40px rgba(124,58,237,0.12)" : "0 4px 20px rgba(0,0,0,0.06)" }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#7C3AED", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "4px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>{plan.badge}</div>
              )}
              <p style={{ margin: "0 0 4px", fontSize: "0.75rem", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{plan.name}</p>
              <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: colors.textMuted }}>{plan.tagline}</p>
              <div style={{ marginBottom: 24 }}>
                {plan.monthlyINR === 0 ? (
                  <p style={{ margin: 0, fontSize: "2.4rem", fontWeight: 900, color: colors.textMain, letterSpacing: "-0.03em" }}>Free</p>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>Rs.</span>
                      <span style={{ fontSize: "2.4rem", fontWeight: 900, color: colors.textMain, letterSpacing: "-0.03em", lineHeight: 1 }}>{annual ? Math.round(plan.annualINR / 12) : plan.monthlyINR}</span>
                      <span style={{ fontSize: "0.85rem", color: colors.textSubtle, marginBottom: 6 }}>/mo</span>
                    </div>
                    {annual && <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>Billed Rs.{plan.annualINR}/year</p>}
                  </>
                )}
              </div>
              <Link to={plan.ctaLink} style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
                <button style={{ width: "100%", padding: "12px 0", borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", border: plan.ctaVariant === "filled" ? "none" : `2px solid ${plan.color}`, background: plan.ctaVariant === "filled" ? plan.color : "transparent", color: plan.ctaVariant === "filled" ? "#fff" : plan.color }}>{plan.cta}</button>
              </Link>
              <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.included ? (plan.highlight ? "rgba(124,58,237,0.12)" : "rgba(42,157,143,0.1)") : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {f.included ? <CheckIcon style={{ width: 11, height: 11, color: plan.highlight ? "#7C3AED" : colors.accentStrong }} /> : <XMarkIcon style={{ width: 10, height: 10, color: colors.textSubtle }} />}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: f.included ? colors.textBody : colors.textSubtle, lineHeight: 1.5 }}>{f.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(42,157,143,0.06)", borderRadius: 999, border: "1px solid rgba(42,157,143,0.15)" }}>
            <SparklesIcon style={{ width: 16, height: 16, color: colors.accentStrong }} />
            <p style={{ margin: 0, fontSize: "0.85rem", color: colors.accentStrong, fontWeight: 500 }}>All plans include all 8 AI tools: Planner, Budget, Hotels, Food, Transport, Safety, Best Time and Weather</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ maxWidth: 680, margin: "0 auto 60px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center", marginBottom: 28, color: colors.textMain, letterSpacing: "-0.02em" }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderRadius: 14, border: "1px solid rgba(164,216,225,0.25)", overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter,sans-serif", textAlign: "left", gap: 12 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textMain }}>{faq.q}</span>
                  <span style={{ fontSize: "1.2rem", color: colors.textSubtle, flexShrink: 0, display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && <div style={{ padding: "0 20px 16px" }}><p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted, lineHeight: 1.7 }}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: "center", padding: "40px 24px", background: "rgba(42,157,143,0.05)", borderRadius: 24, border: "1px solid rgba(42,157,143,0.15)", marginBottom: 20 }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: colors.textMain, marginBottom: 8, letterSpacing: "-0.02em" }}>Not sure which plan is right for you?</h3>
          <p style={{ fontSize: "0.9rem", color: colors.textMuted, marginBottom: 20 }}>Start with Free. No credit card required. Upgrade anytime.</p>
          <Link to="/signup" style={{ display: "inline-block", textDecoration: "none", padding: "12px 32px", borderRadius: 999, background: colors.accentStrong, color: "#fff", fontWeight: 700, fontSize: "0.95rem", fontFamily: "Inter,sans-serif" }}>Create free account</Link>
        </motion.div>

      </div>
    </PageWrapper>
  );
}