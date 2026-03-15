import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";
import Input, { GetLocationButton } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import { generateTripPlan } from "../lib/groq";
import { exportTripPlanPDF } from "../lib/pdf";
import type { TripPlan } from "../types";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { label: " Budget (Under ₹10,000)", value: "Budget" },
  { label: " Moderate (₹10,000 – ₹30,000)", value: "Moderate" },
  { label: " Comfortable (₹30,000 – ₹60,000)", value: "Comfortable" },
  { label: " Luxury (₹60,000+)", value: "Luxury" },
];

const STYLE_OPTIONS = [
  { label: " Budget Backpacker", value: "Budget Backpacker" },
  { label: " Comfortable Explorer", value: "Comfortable Explorer" },
  { label: " Luxury Traveler", value: "Luxury Traveler" },
  { label: " Adventure Seeker", value: "Adventure Seeker" },
  { label: " Cultural Enthusiast", value: "Cultural Enthusiast" },
  { label: " Nature Lover", value: "Nature Lover" },
  { label: " Photography Traveler", value: "Photography Traveler" },
  { label: " Foodie Explorer", value: "Foodie Explorer" },
];

const INTEREST_OPTIONS = [
  "History & Heritage", "Nature & Wildlife", "Adventure Sports",
  "Beach & Water", "Mountains & Trekking", "Local Food",
  "Art & Culture", "Nightlife", "Shopping", "Spiritual & Temples",
  "Photography", "Road Trips", "Yoga & Wellness",
];

const FOOD_OPTIONS = [
  { label: " Vegetarian", value: "Vegetarian" },
  { label: " Non-Vegetarian", value: "Non-Vegetarian" },
  { label: " Vegan", value: "Vegan" },
  { label: " Jain", value: "Jain" },
  { label: " No Preference", value: "No Preference" },
];

const LOADING_MESSAGES = [
  " Consulting Groq AI for the best itinerary...",
  " Mapping out your perfect route...",
  " Finding the best stays for your budget...",
  " Discovering local culinary gems...",
  " Scheduling day-by-day activities...",
  " Calculating budget breakdown...",
  " Planning your travel logistics...",
  " Adding insider tips and hidden gems...",
  " Finalizing your complete trip plan...",
];

const DAY_SECTIONS = [
  { key: "travel", icon: "", label: "Travel" },
  { key: "stay", icon: "", label: "Stay" },
  { key: "morning", icon: "", label: "Morning" },
  { key: "afternoon", icon: "", label: "Afternoon" },
  { key: "evening", icon: "", label: "Evening" },
  { key: "food", icon: "", label: "Food" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

// Field label
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(27, 42, 59, 0.62)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
    {children}
  </p>
);

// Glassmorphism input
const GlassInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => {
  const { hasError, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "rgba(0, 0, 0, 0.05)",
        border: `1px solid ${hasError ? "#DC2626" : "rgba(0, 0, 0, 0.05)"}`,
        color: "#1B2A3B",
        fontSize: "0.92rem",
        fontFamily: "Inter, sans-serif",
        outline: "none",
        boxSizing: "border-box",
        transition: "border 0.2s",
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.border = `1px solid rgba(42, 157, 143,0.5)`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.border = `1px solid ${hasError ? "#DC2626" : "rgba(0, 0, 0, 0.05)"}`;
        props.onBlur?.(e);
      }}
    />
  );
};


// Custom Select Component replacing GlassSelect
const CustomSelect = ({ value, onChange, options, placeholder = "Select..." }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 50 : 1 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "12px",
          background: "rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          color: "#1B2A3B",
          fontSize: "0.92rem",
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "44px"
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDownIcon style={{ width: 16, height: 16, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.05)",
              zIndex: 50,
              maxHeight: "250px",
              overflowY: "auto",
              padding: "8px 0"
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  background: value === opt.value ? "rgba(42, 157, 143, 0.1)" : "transparent",
                  color: value === opt.value ? "#2A9D8F" : "#1B2A3B",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

  // Glassmorphism textarea
const GlassTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      background: "rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      color: "#1B2A3B",
      fontSize: "0.92rem",
      fontFamily: "Inter, sans-serif",
      outline: "none",
      resize: "vertical",
      minHeight: "80px",
      boxSizing: "border-box",
      ...props.style,
    }}
    onFocus={(e) => {
      e.target.style.border = "1px solid rgba(42, 157, 143,0.5)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.target.style.border = "1px solid rgba(0, 0, 0, 0.05)";
      props.onBlur?.(e);
    }}
  />
);

// Day accordion card
const DayAccordion = ({ day, index, isOpen, onToggle }: {
  day: TripPlan["itinerary"][0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <motion.div
    className="ai-hover-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    style={{
      borderRadius: "20px",
      overflow: "hidden",
      border: isOpen ? "1px solid rgba(42, 157, 143,0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
      background: isOpen
        ? "rgba(42, 157, 143, 0.04)"
        : "transparent",
      
      backdropFilter: "blur(20px)",
      marginBottom: "12px",
      boxShadow: isOpen ? "0 2px 8px rgba(42, 157, 143, 0.1)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
      transition: "border 0.25s, box-shadow 0.25s, background 0.25s",
    }}
  >
    {/* Header */}
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
        {/* Day badge */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "#F0F4F8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(42, 157, 143,0.35)",
          }}
        >
          <span style={{ fontSize: "0.6rem", color: "rgba(0, 0, 0, 0.1)", fontWeight: 700, lineHeight: 1 }}>DAY</span>
          <span style={{ fontSize: "1.2rem", color: "#1B2A3B", fontWeight: 900, lineHeight: 1 }}>{day.day}</span>
        </div>
        <div style={{ textAlign: "left", minWidth: 0 }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1B2A3B", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {day.theme}
          </p>
          <p style={{ fontSize: "0.78rem", color: "rgba(27, 42, 59, 0.6)" }}>
            Est. ₹{day.estimatedCost?.toLocaleString() ?? "—"} per person
          </p>
        </div>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
        <ChevronDownIcon style={{ width: 20, height: 20, color: "rgba(27, 42, 59, 0.55)", flexShrink: 0 }} />
      </motion.div>
    </button>

    {/* Expandable content */}
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div style={{ padding: "0 24px 24px" }}>
            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)", marginBottom: "20px" }} />

            {/* Section grid */}
            <div style={{ display: "grid", gap: "16px" }}>
              {DAY_SECTIONS.map(({ key, icon, label }) => {
                const value = day[key as keyof typeof day];
                if (!value) return null;
                return (
                  <div
                    key={key}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: "rgba(0, 0, 0, 0.05)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2A9D8F", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {icon} {label}
                    </p>
                    {Array.isArray(value) ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {(value as string[]).map((item, i) => (
                          <p key={i} style={{ fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.78)", lineHeight: 1.6, paddingLeft: "8px", borderLeft: "2px solid rgba(42, 157, 143,0.2)" }}>
                            {item}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.78)", lineHeight: 1.7 }}>
                        {value as string}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Day cost badge */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "#F0F4F8",
                  border: "1px solid rgba(42, 157, 143,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2A9D8F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                   Daily Cost (per person)
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2A9D8F" }}>
                  ₹{day.estimatedCost?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TripPlanner = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSource = searchParams.get("source") || "";
  const initialDestination = searchParams.get("destination") || "";

  // Form state
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budgetLevel, setBudgetLevel] = useState("Moderate");
  const [travelStyle, setTravelStyle] = useState("Comfortable Explorer");
  const [interests, setInterests] = useState<string[]>([]);
  const [foodPref, setFoodPref] = useState("No Preference");
  const [specialReqs, setSpecialReqs] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]));
  const [copied, setCopied] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Warn before refresh/close when results are present
  useUnsavedWarning(plan !== null);

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, [loading]);

  // Scroll to results on plan
  useEffect(() => {
    if (plan) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [plan]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleDay = (day: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const fillSampleTrip = () => {
    setSource("Delhi");
    setDestination("Goa");
    setDays(4);
    setTravelers(2);
    setBudgetLevel("Comfortable");
    setTravelStyle("Comfortable Explorer");
    setInterests(["Beach & Water", "Local Food", "Nightlife"]);
    setFoodPref("No Preference");
    setSpecialReqs("");
    setErrors({});
    setApiError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!source.trim()) errs.source = "Source city is required";
    if (!destination.trim()) errs.destination = "Destination is required";
    return errs;
  };

  const handleGenerate = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setApiError(null);
    setPlan(null);
    sessionStorage.removeItem("yatrasathi_trip_plan");
    setLoading(true);
    setLoadingMsgIdx(0);

    try {
      const result = await generateTripPlan({
        source: source.trim(),
        destination: destination.trim(),
        duration: days,
        travelers,
        budgetLevel,
        travelStyle,
        interests,
        foodPreference: foodPref,
        specialRequirements: specialReqs.trim() || undefined,
      });
      setPlan(result);
      setOpenDays(new Set([1]));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to generate trip plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!plan) return;
    const text = plan.itinerary.map((d) =>
      `Day ${d.day}: ${d.theme}\n${d.travel}\n${d.stay}\nMorning: ${d.morning}\nAfternoon: ${d.afternoon}\nEvening: ${d.evening}\nFood: ${d.food?.join(" | ") ?? ""}`
    ).join('\n---\n');
    await navigator.clipboard.writeText(`YatraSathi Trip Plan: ${source} -> ${destination} (${days} days)\n\n${text}\n\nTips:\n${plan.tips?.join('\n')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!plan) return;
    const title = `YatraSathi: ${days}-Day Trip from ${source} to ${destination}`;
    const text = `Check out my AI-planned trip from ${source} to ${destination} (${days} days) — generated by YatraSathi AI!`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url: window.location.href }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${title}
${text}
${window.location.href}`);
    }
  };

  const handleGenerateAgain = () => {
    setPlan(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ──

  return (
    <PageWrapper>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 900, marginBottom: "10px", letterSpacing: "-0.5px" }}>
            <GradientText> AI Trip Planner</GradientText>
          </h1>
          <p style={{ color: "rgba(27, 42, 59, 0.55)", fontSize: "1rem" }}>
            Get a complete day‑by‑day itinerary generated in seconds
          </p>
        </motion.div>

        {/* ── Input Form (hide when loading or plan shown) ── */}
        <AnimatePresence mode="wait">
          {true && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              {/* Form card */}
              <div
                style={{
                  padding: "clamp(24px, 4vw, 40px)",
                  borderRadius: "28px",
                  background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {/* Source City */}
                  <div>
                    <FieldLabel> Source City</FieldLabel>
                    <Input placeholder="e.g. Delhi, Mumbai, Bangalore" value={source} onChange={(e) => setSource(e.target.value)} error={errors.source} rightIcon={<GetLocationButton onLocation={setSource} />} />
                    {errors.source && <p style={{ color: "#DC2626", fontSize: "0.78rem", marginTop: "6px" }}>{errors.source}</p>}
                  </div>

                  {/* Destination City */}
                  <div>
                    <FieldLabel> Destination City</FieldLabel>
                    <Input placeholder="e.g. Goa, Manali, Kerala" value={destination} onChange={(e) => setDestination(e.target.value)} error={errors.destination} rightIcon={<GetLocationButton onLocation={setDestination} />} />
                    {errors.destination && <p style={{ color: "#DC2626", fontSize: "0.78rem", marginTop: "6px" }}>{errors.destination}</p>}
                  </div>

                  {/* Days Slider */}
                  <div>
                    <FieldLabel> Number of Days</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={days}
                        onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setDays(v); }}
                        placeholder="e.g. 5"
                      />
                  </div>

                  {/* Travelers */}
                  <div>
                    <FieldLabel> Number of Travellers</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={travelers}
                        onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setTravelers(v); }}
                        placeholder="e.g. 2"
                      />
                  </div>

                  {/* Budget Level */}
                  <div>
                    <FieldLabel> Budget Level</FieldLabel>
                    <CustomSelect value={budgetLevel} onChange={(val: string) => setBudgetLevel(val)} options={BUDGET_OPTIONS} />
                  </div>

                  {/* Travel Style */}
                  <div>
                    <FieldLabel> Travel Style</FieldLabel>
                    <CustomSelect value={travelStyle} onChange={(val: string) => setTravelStyle(val)} options={STYLE_OPTIONS} />
                  </div>

                  {/* Interests — full width */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FieldLabel> Interests (select all that apply)</FieldLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                      {INTEREST_OPTIONS.map((interest) => {
                        const active = interests.includes(interest);
                        return (
                          <motion.button
                            key={interest}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleInterest(interest)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "20px",
                              border: active ? "1px solid rgba(42, 157, 143,0.6)" : "1px solid rgba(0, 0, 0, 0.05)",
                              background: active ? "rgba(42, 157, 143, 0.1)" : "transparent",
                                color: active ? "#2A9D8F" : "rgba(27, 42, 59, 0.58)",
                              fontSize: "0.8rem",
                              fontWeight: active ? 600 : 400,
                              cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                              transition: "all 0.2s",
                            }}
                          >
                            {interest}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Food Preference */}
                  <div>
                    <FieldLabel> Food Preference</FieldLabel>
                    <CustomSelect value={foodPref} onChange={(val: string) => setFoodPref(val)} options={FOOD_OPTIONS} />
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <FieldLabel> Special Requirements</FieldLabel>
                    <textarea className="textarea-override"
                      placeholder="e.g. wheelchair accessible, pet-friendly, honeymoon trip, avoid crowded places..."
                      value={specialReqs}
                      onChange={(e) => setSpecialReqs(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* ── Action Buttons ── */}
                <div style={{ display: "flex", gap: "12px", marginTop: "32px", flexWrap: "wrap" }}>
                  <motion.div style={{ flex: 1, minWidth: "200px" }}>
                    <Button fullWidth size="lg" onClick={handleGenerate} disabled={loading}
                      style={{  }}>
                      <SparklesIcon style={{ width: 20, height: 20 }} />
                       Generate Itinerary
                    </Button>
                  </motion.div>
                  <Button variant="ghost" size="lg" onClick={fillSampleTrip}
                    style={{ whiteSpace: "nowrap" }}>
                     Sample Trip
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: "center", padding: "80px 20px" }}
            >
              {/* Airplane orbit animation */}
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 40px" }}>
                {/* Orbit ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid rgba(42, 157, 143,0.2)",
                    borderTopColor: "#2A9D8F",
                  }}
                />
                {/* Orbiting plane */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <PaperAirplaneIcon style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", width: 22, height: 22, color: "#2A9D8F" }} />
                </motion.div>
                {/* Center globe */}
                <div style={{ position: "absolute", inset: "20px", borderRadius: "50%", background: "#F0F4F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                  
                </div>
              </div>

              {/* Rotating message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  style={{ fontSize: "1rem", color: "rgba(27, 42, 59, 0.78)", marginBottom: "12px", fontWeight: 500 }}
                >
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </motion.p>
              </AnimatePresence>
              <p style={{ fontSize: "0.82rem", color: "rgba(61, 60, 58,0.3)" }}>
                This may take 15–30 seconds for a detailed {days}-day plan
              </p>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "32px" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "#2A9D8F" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── API Error ── */}
        <AnimatePresence>
          {apiError && !loading && (
            <motion.div
    className="ai-hover-card"
    initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: "24px",
                padding: "20px 24px",
                borderRadius: "16px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <ExclamationTriangleIcon style={{ width: 20, height: 20, color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#DC2626", fontWeight: 600, marginBottom: "6px", fontSize: "0.9rem" }}>
                    Something went wrong
                  </p>
                  <p style={{ color: "rgba(27, 42, 59, 0.58)", fontSize: "0.84rem", lineHeight: 1.6 }}>{apiError}</p>
                  <button
                    onClick={handleGenerate}
                    style={{
                      marginTop: "14px",
                      padding: "8px 20px",
                      borderRadius: "10px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#DC2626",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ArrowPathIcon style={{ width: 15, height: 15 }} /> Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              ref={resultsRef}
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ scrollMarginTop: "100px" }}
            >
              <SaveReminderBanner />
              {/* Trip Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  textAlign: "center",
                  marginBottom: "40px",
                  padding: "36px 24px",
                  borderRadius: "24px",
                  background: "#F0F4F8",
                  border: "1px solid rgba(42, 157, 143,0.15)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}></div>
                <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.5px" }}>
                  <GradientText>{source} → {destination}</GradientText>
                </h2>
                <p style={{ color: "rgba(27, 42, 59, 0.55)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  {days} days · {travelers} traveller{travelers > 1 ? "s" : ""} · {plan.travelStyle || travelStyle} · {plan.budget || budgetLevel}
                </p>
                {plan.overview && (
                  <p style={{ color: "rgba(27, 42, 59, 0.72)", fontSize: "0.9rem", maxWidth: "640px", margin: "0 auto", lineHeight: 1.7 }}>
                    {plan.overview}
                  </p>
                )}
              </motion.div>

              {/* Budget Breakdown */}
              {plan.budgetBreakdown && plan.budgetBreakdown.length > 0 && (
                <motion.div
    className="ai-hover-card"
    initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{
                    marginBottom: "32px",
                    padding: "28px",
                    borderRadius: "20px",
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800 }}> Budget Breakdown</h3>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.75rem", color: "rgba(27, 42, 59, 0.55)", marginBottom: "2px" }}>Total Estimated Cost</p>
                      <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "#2A9D8F" }}>
                        ₹{plan.totalEstimatedCost?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                  </div>
                  {/* Table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                          {["Category", "Amount", "Share", ""].map((h, i) => (
                            <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px", color: "rgba(27, 42, 59, 0.55)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {plan.budgetBreakdown.map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                            <td style={{ padding: "10px 12px", color: "rgba(27, 42, 59, 0.78)" }}>{row.category}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", color: "#1B2A3B", fontWeight: 600 }}>₹{row.amount?.toLocaleString()}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", color: "rgba(27, 42, 59, 0.6)" }}>{row.percentage}%</td>
                            <td style={{ padding: "10px 12px", width: "100px" }}>
                              <div style={{ height: "6px", borderRadius: "4px", background: "rgba(0, 0, 0, 0.08)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${row.percentage}%`, background: "#2A9D8F", borderRadius: "4px" }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Day-by-Day Itinerary */}
              <motion.div
    initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{ marginBottom: "32px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800 }}> Day-by-Day Itinerary</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setOpenDays(new Set(plan.itinerary.map((d) => d.day)))}
                      style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(0, 0, 0, 0.05)", border: "1px solid rgba(0, 0, 0, 0.05)", color: "rgba(27, 42, 59, 0.58)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "Inter" }}
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => setOpenDays(new Set())}
                      style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(0, 0, 0, 0.05)", border: "1px solid rgba(0, 0, 0, 0.05)", color: "rgba(27, 42, 59, 0.58)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "Inter" }}
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {plan.itinerary.map((day, i) => (
                  <DayAccordion
                    key={day.day}
                    day={day}
                    index={i}
                    isOpen={openDays.has(day.day)}
                    onToggle={() => toggleDay(day.day)}
                  />
                ))}
              </motion.div>

              {/* Pro Tips */}
              {plan.tips && plan.tips.length > 0 && (
                <motion.div
    className="ai-hover-card"
    initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  style={{
                    marginBottom: "32px",
                    padding: "28px",
                    borderRadius: "20px",
                    background: "#F0F4F8",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "16px" }}> Insider Tips</h3>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {plan.tips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2A9D8F", background: "rgba(99,102,241,0.15)", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                          {i + 1}
                        </span>
                        <p style={{ fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.65 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Action Buttons ── */}
              <motion.div
    className="ai-hover-card"
    initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  padding: "24px",
                  borderRadius: "20px",
                  background: "rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <Button
                  size="md"
                  onClick={() => exportTripPlanPDF(plan)}
                  leftIcon={<ArrowDownTrayIcon style={{ width: 17, height: 17 }} />}
                  style={{ flex: "1 1 140px" }}
                >
                   Download PDF
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={handleCopy}
                  leftIcon={<ClipboardDocumentIcon style={{ width: 17, height: 17 }} />}
                  style={{ flex: "1 1 140px" }}
                >
                  {copied ? " Copied!" : " Copy to Clipboard"}
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  onClick={handleGenerateAgain}
                  leftIcon={<ArrowPathIcon style={{ width: 17, height: 17 }} />}
                  style={{ flex: "1 1 140px" }}
                >
                   Generate Again
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  onClick={handleShare}
                  leftIcon={<ShareIcon style={{ width: 17, height: 17 }} />}
                  style={{ flex: "1 1 100px" }}
                >
                   Share
                </Button>
                <SaveToPlanButton aiOutput={plan} sectionType="planner" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      
      {/* Range slider thumb style */}
      <style>{`
        .ai-hover-card {
          background: rgba(255, 255, 255, 0.55) !important; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s ease !important;
        }
        .ai-hover-card:hover {
          background: rgba(42, 157, 143, 0.04) !important;
          border: 1px solid rgba(42, 157, 143, 0.3) !important;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2A9D8F;
          cursor: pointer;
          border: 2px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(42, 157, 143,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2A9D8F;
          cursor: pointer;
          border: 2px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(42, 157, 143,0.4);
        }
      `}</style>
    </PageWrapper>
  );
};

export default TripPlanner;
