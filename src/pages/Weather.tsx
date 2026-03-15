import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  SparklesIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { GetLocationButton } from "../components/ui/Input";
import { fetchWeather, fetchForecast } from "../lib/weather";
import { generateWeatherAnalysis } from "../lib/groq";
import type { WeatherData, WeatherForecast, WeatherAnalysis } from "../types";

// ─── Weather condition → solid accent / glow ───────────────────────────────

const CONDITION_THEMES: Record<string, { accent: string; glow: string }> = {
  "01d": { accent: "#2A9D8F", glow: "rgba(42,157,143,0.25)" },
  "01n": { accent: "#0F172A", glow: "rgba(15,23,42,0.35)" },
  "02d": { accent: "#38BDF8", glow: "rgba(56,189,248,0.25)" },
  "02n": { accent: "#1D4ED8", glow: "rgba(37,99,235,0.25)" },
  "03d": { accent: "#64748B", glow: "rgba(148,163,184,0.25)" },
  "03n": { accent: "#475569", glow: "rgba(71,85,105,0.25)" },
  "04d": { accent: "#94A3B8", glow: "rgba(148,163,184,0.25)" },
  "04n": { accent: "#1F2937", glow: "rgba(31,41,55,0.3)" },
  "09d": { accent: "#0EA5E9", glow: "rgba(14,165,233,0.3)" },
  "09n": { accent: "#0369A1", glow: "rgba(3,105,161,0.3)" },
  "10d": { accent: "#22C55E", glow: "rgba(34,197,94,0.3)" },
  "10n": { accent: "#16A34A", glow: "rgba(22,163,74,0.3)" },
  "11d": { accent: "#F97316", glow: "rgba(249,115,22,0.3)" },
  "11n": { accent: "#EA580C", glow: "rgba(234,88,12,0.3)" },
  "13d": { accent: "#A4D8E1", glow: "rgba(148, 210, 221,0.35)" },
  "13n": { accent: "#64748B", glow: "rgba(100,116,139,0.3)" },
  "50d": { accent: "#94A3B8", glow: "rgba(148,163,184,0.25)" },
  "50n": { accent: "#64748B", glow: "rgba(100,116,139,0.25)" },
};

const getTheme = (icon: string) =>
  CONDITION_THEMES[icon] ?? {
    accent: "#2A9D8F",
    glow: "rgba(42,157,143,0.25)",
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt12 = (unix: number) =>
  new Date(unix * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDay = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short" });
};

const windDir = (deg?: number) => {
  if (deg === undefined) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Glass = ({
  children,
  style,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  [key: string]: unknown;
}) => (
  <motion.div
    onClick={onClick}
    style={{
      background: "rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "20px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      ...style,
    }}
    {...rest}
  />
);

const StatPill = ({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.04 }}
    style={{
      background: "rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "16px",
      padding: "14px 18px",
      backdropFilter: "blur(16px)",
      minWidth: "110px",
      flexShrink: 0,
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{icon}</div>
    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1B2A3B", marginBottom: "2px" }}>{value}</div>
    <div style={{ fontSize: "0.68rem", color: "rgba(27, 42, 59, 0.65)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
  </motion.div>
);

const ForecastCard = ({
  fc,
  accent,
  delay,
}: {
  fc: WeatherForecast;
  accent: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, background: "rgba(0, 0, 0, 0.05)" }}
    style={{
      background: "rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "18px",
      padding: "18px 14px",
      backdropFilter: "blur(16px)",
      minWidth: "110px",
      flexShrink: 0,
      textAlign: "center",
      transition: "background 0.2s",
    }}
  >
    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(27, 42, 59, 0.65)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {fmtDay(fc.date)}
    </p>
    <img
      src={`https://openweathermap.org/img/wn/${fc.icon}@2x.png`}
      alt={fc.description}
      style={{ width: 52, height: 52, objectFit: "contain" }}
    />
    <p style={{ fontSize: "0.7rem", color: "rgba(27, 42, 59, 0.65)", textTransform: "capitalize", margin: "4px 0 10px", lineHeight: 1.3 }}>
      {fc.description}
    </p>
    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: accent }}>{fc.tempMax}°</span>
      <span style={{ fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.65)" }}>{fc.tempMin}°</span>
    </div>
    {/* temp range bar */}
    <div style={{ marginTop: "8px", height: "3px", borderRadius: "2px", background: "rgba(0, 0, 0, 0.05)", position: "relative" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "70%" }}
        transition={{ delay: delay + 0.3, duration: 0.6 }}
        style={{ height: "100%", borderRadius: "2px", background: accent, marginLeft: "15%" }}
      />
    </div>
  </motion.div>
);

const ChipList = ({
  items,
  color,
  bg,
}: {
  items: string[];
  color: string;
  bg: string;
}) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    {items.map((item, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        whileHover={{ scale: 1.05 }}
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.82rem",
          fontWeight: 500,
          background: bg,
          color,
          border: `1px solid ${color}44`,
          display: "inline-block",
        }}
      >
        {item}
      </motion.span>
    ))}
  </div>
);

const AICard = ({
  icon,
  title,
  children,
  delay,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45 }}
    style={{
      background: "rgba(0, 0, 0, 0.05)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "18px",
      padding: "24px",
      backdropFilter: "blur(12px)",
    }}
  >
    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", color: "#1B2A3B" }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span> {title}
    </h3>
    {children}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Weather = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<WeatherAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const theme = weather ? getTheme(weather.icon) : null;

  const handleSearch = async () => {
    const q = city.trim();
    if (!q) { setError("Please enter a city name."); return; }
    setError(null);
    setLoading(true);
    setWeather(null);
    setForecast([]);
    setAnalysis(null);
    setAnalysisError(null);
    try {
      const [w, fc] = await Promise.all([fetchWeather(q), fetchForecast(q)]);
      setWeather(w);
      setForecast(fc);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyse = async () => {
    if (!weather) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const result = await generateWeatherAnalysis(weather, forecast);
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "AI analysis failed. Please try again.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const STATS = weather
    ? [
        { icon: "", label: "Feels Like", value: `${Math.round(weather.feelsLike)}°C` },
        { icon: "", label: "Humidity", value: `${weather.humidity}%` },
        { icon: "", label: "Wind", value: `${weather.windSpeed} m/s` },
        { icon: "", label: "Visibility", value: `${(weather.visibility / 1000).toFixed(1)} km` },
        { icon: "", label: "Sunrise", value: fmt12(weather.sunrise) },
        { icon: "", label: "Sunset", value: fmt12(weather.sunset) },
      ]
    : [];

  return (
    <PageWrapper>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px 80px" }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "10px" }}>
            <GradientText> Live Weather</GradientText>
          </h1>
          <p style={{ color: "rgba(27, 42, 59, 0.65)", fontSize: "0.95rem" }}>
            Real-time weather + AI travel analysis powered by OpenWeatherMap & Groq
          </p>
        </motion.div>

        {/* ── Search Bar ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: "flex", gap: "10px", marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <MapPinIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "rgba(27, 42, 59, 0.45)", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              placeholder="Enter city name — e.g. Mumbai, Paris, Tokyo"
              value={city}
              onChange={(e) => { setCity(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 14px 12px 40px",
                background: error ? "rgba(42, 157, 143,0.08)" : "rgba(0, 0, 0, 0.05)",
                border: `1px solid ${error ? "rgba(42, 157, 143,0.5)" : "rgba(0, 0, 0, 0.05)"}`,
                borderRadius: "14px", color: "#1B2A3B", fontSize: "0.95rem", outline: "none",
                transition: "border-color 0.2s",
                paddingRight: "40px"
              }}
              onFocus={(e) => { if (!error) (e.target as HTMLInputElement).style.borderColor = "rgba(42, 157, 143,0.5)"; }}
              onBlur={(e) => { if (!error) (e.target as HTMLInputElement).style.borderColor = "rgba(0, 0, 0, 0.05)"; }}
            />
            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
              <GetLocationButton onLocation={setCity} />
            </div>
          </div>
          <Button onClick={handleSearch} loading={loading}
            leftIcon={<MagnifyingGlassIcon style={{ width: 18, height: 18 }} />}>
            Search
          </Button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", color: "#2A9D8F", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ExclamationTriangleIcon style={{ width: 16, height: 16 }} /> {error}
          </motion.p>
        )}

        {/* Loading */}
        {loading && <Loader message=" Fetching live weather data..." />}

        {/* ── Weather Results ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {weather && !loading && (
            <motion.div key="weather-results" ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}>

              {/* ── Hero Card ──────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    borderRadius: "28px",
                    background: "rgba(255, 255, 255, 0.55)",
                    padding: "0",
                    marginBottom: "16px",
                    overflow: "hidden",
                    boxShadow: `0 24px 80px ${theme!.glow}, 0 4px 24px rgba(15,23,42,0.16)`,
                    position: "relative",
                  }}
                >
                {/* Decorative blur circle */}
                <div style={{
                  position: "absolute", top: "-60px", right: "-60px",
                  width: "280px", height: "280px", borderRadius: "50%",
                  background: "rgba(164, 216, 225, 0.15)",
                  filter: "blur(30px)", pointerEvents: "none",
                }} />

                <div style={{ padding: "36px 36px 28px", position: "relative" }}>
                  {/* Location */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <MapPinIcon style={{ width: 16, height: 16, color: "rgba(27, 42, 59, 0.65)" }} />
                        <span style={{ fontSize: "0.8rem", color: "rgba(27, 42, 59, 0.65)", fontWeight: 600, letterSpacing: "0.05em" }}>
                          {weather.country}
                        </span>
                      </div>
                      <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1B2A3B", lineHeight: 1.1 }}>
                        {weather.city}
                      </h2>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.05)", borderRadius: "14px",
                      padding: "8px 16px", backdropFilter: "blur(10px)",
                      fontSize: "0.78rem", color: "#1B2A3B", fontWeight: 600,
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}>
                      Live · {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                  </div>

                  {/* Main temperature */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "12px" }}>
                    <motion.img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                      alt={weather.description}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      style={{ width: 100, height: 100, objectFit: "contain", filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1))" }}
                    />
                    <div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: "clamp(4rem, 10vw, 6rem)", fontWeight: 900, color: "#1B2A3B", lineHeight: 1, letterSpacing: "-2px" }}
                      >
                        {Math.round(weather.temperature)}°
                      </motion.div>
                      <p style={{ fontSize: "1rem", color: "rgba(27, 42, 59, 0.65)", textTransform: "capitalize", marginTop: "4px" }}>
                        {weather.description}
                      </p>
                    </div>
                  </div>

                  {/* Feels like */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(0, 0, 0, 0.05)", borderRadius: "20px",
                    padding: "6px 16px", fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.65)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}>
                    <span>Feels like</span>
                    <strong>{Math.round(weather.feelsLike)}°C</strong>
                    <span style={{ color: "rgba(27, 42, 59, 0.65)" }}>·</span>
                    <span>{weather.humidity}% humidity</span>
                  </div>
                </div>

                {/* Stats strip */}
                <div style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                  padding: "18px 36px",
                  display: "flex", gap: "0",
                  overflowX: "auto",
                }}>
                  {STATS.map((s, i) => (
                    <div key={s.label} style={{
                      flex: 1, minWidth: "80px", textAlign: "center",
                      borderRight: i < STATS.length - 1 ? "1px solid rgba(0, 0, 0, 0.05)" : "none",
                      padding: "0 12px",
                    }}>
                      <div style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{s.icon}</div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1B2A3B" }}>{s.value}</div>
                      <div style={{ fontSize: "0.65rem", color: "rgba(27, 42, 59, 0.65)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── 5-Day Forecast ─────────────────────────────────────── */}
              {forecast.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(27, 42, 59, 0.58)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px", paddingLeft: "4px" }}>
                    5-Day Forecast
                  </h3>
                  <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
                    {forecast.map((fc, i) => (
                      <ForecastCard key={fc.date} fc={fc} accent={theme!.accent} delay={0.3 + i * 0.07} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── AI Analysis CTA ────────────────────────────────────── */}
              {!analysis && !analysisLoading && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "20px",
                    padding: "28px",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}></div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>AI Weather Analysis</h3>
                  <p style={{ color: "rgba(27, 42, 59, 0.65)", fontSize: "0.9rem", marginBottom: "20px", maxWidth: "420px", margin: "0 auto 20px" }}>
                    Get Groq AI insights on how this weather affects travel, what to wear, and what to do in {weather.city}.
                  </p>
                  {analysisError && (
                    <p style={{ color: "#2A9D8F", fontSize: "0.85rem", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                      <ExclamationTriangleIcon style={{ width: 15, height: 15 }} /> {analysisError}
                    </p>
                  )}
                  <Button onClick={handleAnalyse} size="lg"
                    leftIcon={<SparklesIcon style={{ width: 20, height: 20 }} />}>
                    Generate AI Analysis
                  </Button>
                </motion.div>
              )}

              {/* AI Loading */}
              {analysisLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "20px" }}>
                  <Loader message=" Groq AI is analysing weather patterns for your trip..." />
                </motion.div>
              )}

              {/* ── AI Analysis Results ────────────────────────────────── */}
              {analysis && !analysisLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(27, 42, 59, 0.58)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                       AI Weather Analysis · {weather.city}
                    </h3>
                    <button
                      onClick={() => { setAnalysis(null); setAnalysisError(null); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(27, 42, 59, 0.45)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <ArrowPathIcon style={{ width: 14, height: 14 }} /> Regenerate
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Overview + Travel Impact - 2 col */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
                      <AICard icon="" title="Weather Overview" delay={0}>
                        <p style={{ fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.7 }}>{analysis.overview}</p>
                      </AICard>
                      <AICard icon="" title="Travel Impact" delay={0.07}>
                        <p style={{ fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.7 }}>{analysis.travelImpact}</p>
                      </AICard>
                    </div>

                    {/* Clothing + Items */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
                      <AICard icon="" title="What to Wear" delay={0.14}>
                        <ChipList items={analysis.clothingRecommendations} color="#818CF8" bg="rgba(99,102,241,0.12)" />
                      </AICard>
                      <AICard icon="" title="What to Carry" delay={0.21}>
                        <ChipList items={analysis.itemsToCarry} color="#34D399" bg="rgba(16,185,129,0.12)" />
                      </AICard>
                    </div>

                    {/* Recommended Activities */}
                    <AICard icon="" title="Recommended Activities" delay={0.28}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                        {analysis.recommendedActivities.map((act, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.32 + i * 0.06 }}
                            whileHover={{ y: -3, background: "rgba(52,211,153,0.15)" }}
                            style={{
                              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                              borderRadius: "12px", padding: "12px 14px", fontSize: "0.87rem",
                              color: "rgba(27, 42, 59, 0.82)", lineHeight: 1.4, transition: "all 0.18s",
                            }}>
                             {act}
                          </motion.div>
                        ))}
                      </div>
                    </AICard>

                    {/* Avoid + Best Time */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
                      <AICard icon="" title="Activities to Avoid" delay={0.35}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {analysis.activitiesToAvoid.map((a, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.38 + i * 0.06 }}
                              style={{ fontSize: "0.87rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.5, display: "flex", gap: "8px", alignItems: "flex-start" }}>
                              <span style={{ color: "#F87171", flexShrink: 0 }}></span> {a}
                            </motion.div>
                          ))}
                        </div>
                      </AICard>

                      <AICard icon="" title="Best Time of Day" delay={0.42}>
                        <p style={{ fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.7 }}>{analysis.bestTimeOfDay}</p>
                      </AICard>
                    </div>

                    {/* Week Trend */}
                    <AICard icon="" title="5-Day Weather Trend" delay={0.49}>
                      <p style={{ fontSize: "0.9rem", color: "rgba(27, 42, 59, 0.72)", lineHeight: 1.7 }}>{analysis.weekTrend}</p>
                    </AICard>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
};

export default Weather;
