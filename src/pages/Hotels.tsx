import { useState } from "react";
import { BuildingOfficeIcon, SparklesIcon, StarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { GetLocationButton } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import { generateHotelRecommendations } from "../lib/groq";
import type { Hotel } from "../types";
import { colors } from "../theme";
import SaveToPlanButton from "../components/plans/SaveToPlanButton";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";
import SaveReminderBanner from "../components/shared/SaveReminderBanner";

const STAR_OPTIONS = [
  { label: "Any Stars", value: "any" },
  { label: "3 Stars", value: "3" },
  { label: "4 Stars", value: "4" },
  { label: "5 Stars", value: "5" },
];

const Hotels = () => {
  const [destination, setDestination] = useState("");
  const [stars, setStars] = useState("any");
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useUnsavedWarning(hotels.length > 0);

  const handleSearch = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(null);
    setLoading(true);
    setHotels([]);
    try {
      const result = await generateHotelRecommendations({ destination, stars: stars === "any" ? undefined : parseInt(stars) });
      setHotels(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hotel recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) =>
      i < count
        ? <StarSolid key={i} style={{ width: 14, height: 14, color: "#D97706" }} />
        : <StarIcon key={i} style={{ width: 14, height: 14, color: "rgba(0, 0, 0, 0.1)" }} />
    );

  return (
    <PageWrapper>
      <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "8px", textAlign: "center", color: colors.textMain }}>
        <GradientText>Hotels</GradientText> & Stays
      </h1>
      <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: "40px", fontSize: "0.95rem" }}>
        AI-curated hotel recommendations for any destination
      </p>

      <div style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
        <Card padding="28px">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <Input
                label="Destination"
                placeholder="e.g. Jaipur, Rajasthan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                rightIcon={<GetLocationButton onLocation={setDestination} />}
                leftIcon={<BuildingOfficeIcon style={{ width: 18, height: 18 }} />}
                error={error ?? undefined}
              />
            </div>
            <Select label="Star Rating" options={STAR_OPTIONS} value={stars} onChange={(e) => setStars(e.target.value)} />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Button fullWidth onClick={handleSearch} loading={loading} leftIcon={<SparklesIcon style={{ width: 18, height: 18 }} />}>
                Find Hotels
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {loading && <Loader message=" Finding the best hotels for you..." />}

      {hotels.length > 0 && !loading && (
        <>
          <SaveReminderBanner />
          {/* Top-right: save all hotels with info tooltip */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {/* Info icon with tooltip */}
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
                  width: 220,
                  background: "rgba(27,42,59,0.92)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                  padding: "8px 12px",
                  borderRadius: 10,
                  zIndex: 50,
                  pointerEvents: "none",
                }}>
                  Saves all {hotels.length} hotels to your plan. To save a single hotel, use the bookmark button on each card.
                </div>
              )}
            </div>
            <SaveToPlanButton aiOutput={hotels} sectionType="hotels" />
          </div>

          {/* Hotel cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {hotels.map((hotel, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, flex: 1, color: colors.textMain }}>{hotel.name}</h3>
                  <div style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>{renderStars(hotel.stars)}</div>
                </div>
                <p style={{ fontSize: "0.82rem", color: colors.textMuted, marginBottom: "12px" }}>📍 {hotel.location}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: colors.accentStrong }}>
                    ₹{hotel.pricePerNight.toLocaleString()}
                    <span style={{ fontSize: "0.75rem", color: colors.textSubtle }}>/night</span>
                  </span>
                  <span style={{ fontSize: "0.8rem", backgroundColor: "rgba(22,163,74,0.1)", color: "#059669", padding: "3px 10px", borderRadius: "999px", border: "1px solid rgba(22,163,74,0.2)" }}>
                    ⭐ {hotel.rating}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                  {hotel.amenities.slice(0, 4).map((a) => (
                    <span key={a} style={{ fontSize: "0.72rem", color: colors.textMuted, backgroundColor: "rgba(0, 0, 0, 0.04)", padding: "3px 9px", borderRadius: "8px", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
                      {a}
                    </span>
                  ))}
                </div>
                {/* Per-hotel save button */}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 10 }}>
                  <SaveToPlanButton aiOutput={[hotel]} sectionType="hotels" />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default Hotels;
