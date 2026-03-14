import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { generateFoodGuide } from "../lib/groq";
import type { FoodItem } from "../types";

const SPICE_COLORS: Record<string, string> = {
  mild: "#4ade80",
  medium: "#fbbf24",
  hot: "#f97316",
  "very hot": "#ef4444",
};

const FoodGuide = () => {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setFoods([]);
    try {
      const result = await generateFoodGuide(destination);
      setFoods(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch food guide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center" }}>
        Local <GradientText>Food Guide</GradientText>
      </h1>
      <p style={{ textAlign: "center", color: "rgba(61, 60, 58,0.55)", marginBottom: "40px", fontSize: "0.95rem" }}>
        Discover must-try local dishes and where to find them
      </p>

      <div style={{ maxWidth: "600px", margin: "0 auto 40px", display: "flex", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Enter destination (e.g. Chennai, Tamil Nadu)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            error={error ?? undefined}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} rightIcon={<GetLocationButton onLocation={setDestination} />}
          />
        </div>
        <Button onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
          Explore
        </Button>
      </div>

      {loading && <Loader message=" Discovering local flavors..." />}

      {foods.length > 0 && !loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}
        >
          {foods.map((food, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>{food.name}</h3>
                  {food.isVegetarian && (
                    <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(34,197,94,0.25)", whiteSpace: "nowrap", marginLeft: "8px" }}>
                       Veg
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.83rem", color: "rgba(61, 60, 58,0.6)", marginBottom: "12px", lineHeight: 1.5 }}>
                  {food.description}
                </p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.73rem", color: SPICE_COLORS[food.spiceLevel] ?? "#f0f0f0", backgroundColor: "rgba(0, 0, 0, 0.05)", padding: "2px 10px", borderRadius: "8px", border: `1px solid ${SPICE_COLORS[food.spiceLevel] ?? "rgba(0, 0, 0, 0.05)"}30` }}>
                     {food.spiceLevel}
                  </span>
                  <span style={{ fontSize: "0.73rem", color: "#A4D8E1" }}>{food.priceRange}</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "rgba(61, 60, 58,0.4)" }}>
                   {food.whereToFind.slice(0, 2).join(", ")}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
};

export default FoodGuide;
