import { useState } from "react";
import { SparklesIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import { generateFoodGuide } from "../lib/groq";
import type { FoodItem } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";
import { useAIQuota } from "../hooks/useAIQuota";
import UpgradeModal from "../components/paywall/UpgradeModal";

const SPICE_COLORS: Record<string, string> = {
  mild: "#059669",
  medium: "#d97706",
  hot: "#ea580c",
  "very hot": "#dc2626",
};

const FOOD_TYPE_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "🌿 Vegetarian", value: "vegetarian" },
  { label: "🍗 Non-Vegetarian", value: "non-vegetarian" },
  { label: "🥗 Vegan", value: "vegan" },
  { label: "🙏 Jain", value: "jain" },
  { label: "🌍 International", value: "international" },
  { label: "🍜 Street Food", value: "street food" },
  { label: "🍱 Local Cuisine", value: "local cuisine" },
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "any" },
  { label: "💸 Budget (Under ₹200)", value: "budget" },
  { label: "🍽️ Mid-Range (₹200–₹800)", value: "mid-range" },
  { label: "✨ Fine Dining (₹800+)", value: "fine-dining" },
];

const FoodGuide = () => {
  const [destination, setDestination] = useState("");
  const [foodType, setFoodType] = useState("any");
  const [budget, setBudget] = useState("any");
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useUnsavedWarning(foods.length > 0);
  const { withQuota, upgradeOpen, setUpgradeOpen, upgradeMsg } = useAIQuota();

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setFoods([]);
    try {
      const result = await withQuota(() => generateFoodGuide({ destination: destination.trim(), foodType, budget }));
      if (result) setFoods(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch food guide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title={upgradeMsg.title} description={upgradeMsg.description} />
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center", color: colors.textMain }}>
        Local <GradientText>Food Guide</GradientText>
      </h1>
      <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: "40px", fontSize: "0.95rem" }}>
        Discover must-try dishes tailored to your taste and budget
      </p>

      {/* Search form */}
      <div style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
        <Card padding="28px">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {/* Destination */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Input
                label="Destination"
                placeholder="e.g. Chennai, Tamil Nadu"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setError(null); }}
                error={error ?? undefined}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                rightIcon={<GetLocationButton onLocation={setDestination} />}
              />
            </div>

            {/* Food type */}
            <Select
              label="Food Type"
              options={FOOD_TYPE_OPTIONS}
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
            />

            {/* Budget */}
            <Select
              label="Budget"
              options={BUDGET_OPTIONS}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <Button
              fullWidth
              size="lg"
              onClick={handleSearch}
              loading={loading}
              leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}
            >
              Explore Food
            </Button>
          </div>
        </Card>
      </div>

      {loading && <Loader message="🍽️ Discovering local flavors..." />}

      {foods.length > 0 && !loading && (
        <>
          <SaveReminderBanner />
          {/* Top-right: save all with info tooltip */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <button
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: colors.textSubtle, padding: 2 }}
              >
                <InformationCircleIcon style={{ width: 18, height: 18 }} />
              </button>
              {tooltipVisible && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  width: 230,
                  background: "rgba(27,42,59,0.92)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  padding: "8px 12px",
                  borderRadius: 10,
                  zIndex: 50,
                  pointerEvents: "none",
                }}>
                  Saves all {foods.length} food items to your plan. To save a single item, use the bookmark button on each card.
                </div>
              )}
            </div>
            <SaveToPlanButton aiOutput={foods} sectionType="food" />
          </div>

          {/* Food cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}
          >
            {foods.map((food, i) => (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, flex: 1, color: colors.textMain }}>{food.name}</h3>
                    {food.isVegetarian && (
                      <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(22,163,74,0.1)", color: "#059669", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(22,163,74,0.2)", whiteSpace: "nowrap", marginLeft: "8px" }}>
                        🌿 Veg
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: "0.83rem", color: colors.textBody, marginBottom: "12px", lineHeight: 1.6, flex: 1 }}>
                    {food.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.73rem",
                      color: SPICE_COLORS[food.spiceLevel] ?? colors.textMuted,
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      padding: "2px 10px",
                      borderRadius: "8px",
                      border: `1px solid ${SPICE_COLORS[food.spiceLevel] ?? "rgba(0,0,0,0.06)"}40`,
                    }}>
                      🌶 {food.spiceLevel}
                    </span>
                    <span style={{ fontSize: "0.73rem", color: colors.accentStrong, fontWeight: 600 }}>
                      {food.priceRange}
                    </span>
                  </div>

                  {/* Where to find */}
                  <p style={{ fontSize: "0.78rem", color: colors.textSubtle, marginBottom: "12px" }}>
                    📍 {food.whereToFind.slice(0, 2).join(", ")}
                  </p>

                  {/* Per-item save */}
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10 }}>
                    <SaveToPlanButton aiOutput={[food]} sectionType="food" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </PageWrapper>
  );
};

export default FoodGuide;
