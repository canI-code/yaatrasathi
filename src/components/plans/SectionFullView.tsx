/**
 * SectionFullView — renders the full rich output for a saved plan section,
 * identical to what the user sees on the original planning page.
 */
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import { colors } from "../../theme";
import type {
  SectionType,
  TripPlan,
  BudgetBreakdown,
  Hotel,
  FoodItem,
  TransportOption,
  SafetyTip,
  BestTimeInfo,
  WeatherData,
} from "../../types";

// ── Shared helpers ────────────────────────────────────────────────────────────

const SPICE_COLORS: Record<string, string> = {
  mild: "#059669", medium: "#d97706", hot: "#ea580c", "very hot": "#dc2626",
};
const SEASON_COLORS: Record<string, string> = {
  summer: "#e77d11", winter: "#2563eb", monsoon: "#059669", spring: "#7c3aed", autumn: "#d97706",
};

function renderStars(count: number) {
  return Array.from({ length: 5 }, (_, i) =>
    i < count
      ? <StarSolid key={i} style={{ width: 13, height: 13, color: "#D97706" }} />
      : <StarIcon key={i} style={{ width: 13, height: 13, color: "rgba(0,0,0,0.1)" }} />
  );
}

function renderRating(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < rating ? "#d97706" : "rgba(0,0,0,0.1)", fontSize: 13 }}>★</span>
  ));
}

// ── Section renderers ─────────────────────────────────────────────────────────

function PlannerView({ data }: { data: TripPlan }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Overview */}
      <div style={{ padding: "16px 18px", background: "rgba(42,157,143,0.06)", borderRadius: 14, border: "1px solid rgba(42,157,143,0.15)" }}>
        <p style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 700, color: colors.accentStrong, textTransform: "uppercase", letterSpacing: "0.06em" }}>Overview</p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: colors.textBody, lineHeight: 1.7 }}>{data.overview}</p>
      </div>

      {/* Key stats */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {[
          { label: "From", value: data.source },
          { label: "To", value: data.destination },
          { label: "Days", value: data.duration },
          { label: "Travelers", value: data.travelers },
          { label: "Style", value: data.travelStyle },
          { label: "Budget", value: data.budget },
          { label: "Total Cost", value: `₹${data.totalEstimatedCost?.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
            <span style={{ fontSize: "0.68rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}: </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: colors.textMain }}>{String(value)}</span>
          </div>
        ))}
      </div>

      {/* Itinerary */}
      {data.itinerary?.map((day) => (
        <div key={day.day} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.55)", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F4F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "0.55rem", color: colors.textSubtle, fontWeight: 700 }}>DAY</span>
              <span style={{ fontSize: "1rem", fontWeight: 900, color: colors.textMain, lineHeight: 1 }}>{day.day}</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>{day.theme}</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textSubtle }}>Est. ₹{day.estimatedCost?.toLocaleString()} / person</p>
            </div>
          </div>
          {[
            { label: "Travel", value: day.travel },
            { label: "Stay", value: day.stay },
            { label: "Morning", value: day.morning },
            { label: "Afternoon", value: day.afternoon },
            { label: "Evening", value: day.evening },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: colors.accentStrong, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}: </span>
              <span style={{ fontSize: "0.82rem", color: colors.textBody }}>{value}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.55)", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: "0.78rem", fontWeight: 700, color: colors.accentStrong, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tips</p>
          {data.tips.map((tip, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: "0.83rem", color: colors.textBody, display: "flex", gap: 8 }}>
              <span style={{ color: colors.accentStrong, flexShrink: 0 }}>{i + 1}.</span>{tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetView({ data }: { data: BudgetBreakdown }) {
  const rows = [
    { label: "Accommodation", key: "accommodation" as const },
    { label: "Food & Dining", key: "food" as const },
    { label: "Transport", key: "transport" as const },
    { label: "Activities", key: "activities" as const },
    { label: "Shopping", key: "shopping" as const },
    { label: "Miscellaneous", key: "miscellaneous" as const },
  ];
  const total = rows.reduce((s, r) => s + (data[r.key] ?? 0), 0) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {[
          { label: "Total", value: `₹${data.total?.toLocaleString()}` },
          { label: "Per Person", value: `₹${data.perPersonTotal?.toLocaleString()}` },
          { label: "Per Day", value: `₹${data.perDayTotal?.toLocaleString()}` },
          { label: "Travelers", value: `${data.travelers} · ${data.days} days` },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "12px 14px", background: "rgba(42,157,143,0.06)", borderRadius: 12, border: "1px solid rgba(42,157,143,0.12)", textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.68rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: colors.accentStrong }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Summary text */}
      {data.summary && (
        <p style={{ margin: 0, fontSize: "0.88rem", color: colors.textBody, lineHeight: 1.7, padding: "12px 16px", background: "rgba(255,255,255,0.55)", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)" }}>
          {data.summary}
        </p>
      )}

      {/* Breakdown bars */}
      <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.55)", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ margin: "0 0 14px", fontSize: "0.78rem", fontWeight: 700, color: colors.textMain, textTransform: "uppercase", letterSpacing: "0.06em" }}>Breakdown</p>
        {rows.map((row) => {
          const amount = data[row.key] ?? 0;
          const pct = Math.round((amount / total) * 100);
          return (
            <div key={row.key} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "0.82rem", color: colors.textBody }}>{row.label}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: colors.accentStrong }}>₹{amount.toLocaleString()} <span style={{ fontSize: "0.7rem", color: colors.textSubtle }}>({pct}%)</span></span>
              </div>
              <div style={{ height: 5, borderRadius: 4, background: "rgba(0,0,0,0.06)" }}>
                <div style={{ height: "100%", borderRadius: 4, background: colors.accentStrong, width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.55)", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: "0.78rem", fontWeight: 700, color: colors.accentStrong, textTransform: "uppercase", letterSpacing: "0.06em" }}>Money-Saving Tips</p>
          {data.tips.map((tip, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: "0.83rem", color: colors.textBody, display: "flex", gap: 8 }}>
              <span style={{ color: colors.accentStrong, flexShrink: 0 }}>{i + 1}.</span>{tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function HotelsView({ data }: { data: Hotel[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {data.map((hotel, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, flex: 1, color: colors.textMain }}>{hotel.name}</h3>
            <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>{renderStars(hotel.stars)}</div>
          </div>
          <p style={{ fontSize: "0.8rem", color: colors.textMuted, marginBottom: 10 }}>📍 {hotel.location}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: colors.accentStrong }}>₹{hotel.pricePerNight?.toLocaleString()}<span style={{ fontSize: "0.72rem", color: colors.textSubtle }}>/night</span></span>
            <span style={{ fontSize: "0.78rem", background: "rgba(22,163,74,0.1)", color: "#059669", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(22,163,74,0.2)" }}>⭐ {hotel.rating}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {hotel.amenities?.slice(0, 4).map((a) => (
              <span key={a} style={{ fontSize: "0.7rem", color: colors.textMuted, background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 7, border: "1px solid rgba(0,0,0,0.05)" }}>{a}</span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function FoodView({ data }: { data: FoodItem[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      {data.map((food, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card style={{ height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, flex: 1, color: colors.textMain }}>{food.name}</h3>
              {food.isVegetarian && (
                <span style={{ fontSize: "0.68rem", background: "rgba(22,163,74,0.1)", color: "#059669", padding: "2px 7px", borderRadius: 6, border: "1px solid rgba(22,163,74,0.2)", whiteSpace: "nowrap", marginLeft: 8 }}>🌿 Veg</span>
              )}
            </div>
            <p style={{ fontSize: "0.82rem", color: colors.textBody, marginBottom: 10, lineHeight: 1.6 }}>{food.description}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.72rem", color: SPICE_COLORS[food.spiceLevel] ?? colors.textMuted, background: "rgba(0,0,0,0.04)", padding: "2px 9px", borderRadius: 8 }}>🌶 {food.spiceLevel}</span>
              <span style={{ fontSize: "0.72rem", color: colors.accentStrong, fontWeight: 600 }}>{food.priceRange}</span>
            </div>
            <p style={{ fontSize: "0.76rem", color: colors.textSubtle, margin: 0 }}>📍 {food.whereToFind?.slice(0, 2).join(", ")}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function TransportView({ data }: { data: TransportOption[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {data.map((opt, i) => (
        <Card key={i} style={{ height: "100%" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(164,216,225,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              {opt.type === "flight" ? "✈" : opt.type === "train" ? "🚂" : opt.type === "bus" ? "🚌" : opt.type === "car" ? "🚗" : "🚀"}
            </div>
            <div>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: colors.textMain, margin: 0 }}>{opt.name}</h3>
              <p style={{ fontSize: "0.72rem", color: colors.textSubtle, margin: 0 }}>{opt.type}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: "0.8rem", color: colors.accentStrong, fontWeight: 600 }}>💰 {opt.cost}</span>
            <span style={{ fontSize: "0.8rem", color: colors.textMuted }}>⏱ {opt.duration}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <p style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700, marginBottom: 4 }}>✓ Pros</p>
              {opt.pros?.slice(0, 3).map((p, j) => <p key={j} style={{ fontSize: "0.73rem", color: colors.textMuted, marginBottom: 2 }}>• {p}</p>)}
            </div>
            <div>
              <p style={{ fontSize: "0.68rem", color: "#DC2626", fontWeight: 700, marginBottom: 4 }}>✗ Cons</p>
              {opt.cons?.slice(0, 3).map((c, j) => <p key={j} style={{ fontSize: "0.73rem", color: colors.textMuted, marginBottom: 2 }}>• {c}</p>)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SafetyView({ data }: { data: SafetyTip[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
      {data.map((tip, i) => (
        <Card key={i} style={{ height: "100%", borderLeft: `3px solid ${colors.accentStrong}` }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 10, color: colors.textMain }}>{tip.category}</h3>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {tip.tips.map((t, j) => (
              <li key={j} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: "0.82rem", color: colors.textBody, lineHeight: 1.6 }}>
                <span style={{ color: colors.accentStrong, flexShrink: 0 }}>•</span>{t}
              </li>
            ))}
          </ul>
          {tip.emergency && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(220,38,38,0.06)", borderRadius: 10, border: "1px solid rgba(220,38,38,0.15)", display: "flex", alignItems: "center", gap: 6 }}>
              <ExclamationTriangleIcon style={{ width: 13, height: 13, color: "#DC2626" }} />
              <p style={{ fontSize: "0.76rem", color: "#DC2626", margin: 0 }}>Emergency: {tip.emergency}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function BestTimeView({ data }: { data: BestTimeInfo[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      {data.map((s, i) => {
        const color = SEASON_COLORS[s.season?.toLowerCase()] ?? colors.accentStrong;
        return (
          <Card key={i} style={{ borderTop: `3px solid ${color}`, height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color, margin: 0 }}>{s.season}</h3>
              <div style={{ display: "flex" }}>{renderRating(s.rating)}</div>
            </div>
            <p style={{ fontSize: "0.76rem", color: colors.textSubtle, marginBottom: 8 }}>📅 {s.months?.join(", ")}</p>
            <p style={{ fontSize: "0.82rem", color: colors.textBody, marginBottom: 10, lineHeight: 1.6 }}>{s.weather}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <p style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700, marginBottom: 4 }}>✓ Pros</p>
                {s.pros?.slice(0, 3).map((p, j) => <p key={j} style={{ fontSize: "0.73rem", color: colors.textMuted, marginBottom: 2 }}>• {p}</p>)}
              </div>
              <div>
                <p style={{ fontSize: "0.68rem", color: "#DC2626", fontWeight: 700, marginBottom: 4 }}>✗ Cons</p>
                {s.cons?.slice(0, 3).map((c, j) => <p key={j} style={{ fontSize: "0.73rem", color: colors.textMuted, marginBottom: 2 }}>• {c}</p>)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function WeatherView({ data }: { data: WeatherData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: "rgba(42,157,143,0.06)", borderRadius: 14, border: "1px solid rgba(42,157,143,0.15)" }}>
        <img src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} alt={data.description} style={{ width: 60, height: 60 }} />
        <div>
          <p style={{ margin: "0 0 2px", fontSize: "1.8rem", fontWeight: 900, color: colors.textMain }}>{Math.round(data.temperature)}°C</p>
          <p style={{ margin: 0, fontSize: "0.88rem", color: colors.textMuted, textTransform: "capitalize" }}>{data.description}</p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: colors.textSubtle }}>{data.city}, {data.country}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {[
          { label: "Feels Like", value: `${Math.round(data.feelsLike)}°C` },
          { label: "Humidity", value: `${data.humidity}%` },
          { label: "Wind", value: `${data.windSpeed} m/s` },
          { label: "Visibility", value: `${(data.visibility / 1000).toFixed(1)} km` },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.55)", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
            <p style={{ margin: "0 0 3px", fontSize: "0.68rem", color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: colors.textMain }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface SectionFullViewProps {
  type: SectionType;
  data: unknown;
}

export default function SectionFullView({ type, data }: SectionFullViewProps) {
  if (!data) return null;

  switch (type) {
    case "planner":   return <PlannerView   data={data as TripPlan} />;
    case "budget":    return <BudgetView    data={data as BudgetBreakdown} />;
    case "hotels":    return <HotelsView    data={data as Hotel[]} />;
    case "food":      return <FoodView      data={data as FoodItem[]} />;
    case "transport": return <TransportView data={data as TransportOption[]} />;
    case "safety":    return <SafetyView    data={data as SafetyTip[]} />;
    case "best-time": return <BestTimeView  data={data as BestTimeInfo[]} />;
    case "weather":   return <WeatherView   data={data as WeatherData} />;
    default:          return null;
  }
}
