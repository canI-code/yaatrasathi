import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import PageWrapper from "../components/layout/PageWrapper";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import {
  initMap,
  flyTo,
  geocodeCity,
  clearTouristMarkers,
  addTouristMarker,
  openTouristPopup,
} from "../lib/leafletMap";
import { generateTouristPlaces } from "../lib/groq";
import type { MapLocation } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: "all",        label: "All",          emoji: "", color: "#2A9D8F" },
  { id: "attraction", label: "Attractions",  emoji: "", color: "#2A9D8F" },
  { id: "hotel",      label: "Hotels",       emoji: "", color: "#2A9D8F" },
  { id: "food",       label: "Food",         emoji: "", color: "#2A9D8F" },
  { id: "transport",  label: "Transport",    emoji: "", color: "#2A9D8F" },
] as const;

type FilterId = typeof FILTER_TABS[number]["id"];

const CATEGORY_META: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  attraction: { color: "#2A9D8F", bg: "rgba(42, 157, 143,0.12)",   icon: <BuildingLibraryIcon style={{ width: 13, height: 13 }} /> },
  hotel:      { color: "#818CF8", bg: "rgba(99,102,241,0.12)",  icon: <BuildingOffice2Icon style={{ width: 13, height: 13 }} /> },
  food:       { color: "#FBBF24", bg: "rgba(245,158,11,0.12)",  icon: <StarIcon style={{ width: 13, height: 13 }} /> },
  transport:  { color: "#34D399", bg: "rgba(16,185,129,0.12)",  icon: <TruckIcon style={{ width: 13, height: 13 }} /> },
};

const EXPLORE_MSGS = [
  " Locating your destination on the globe...",
  " Groq AI scouting top tourist spots...",
  " Pinning markers to the map...",
  " Polishing your explore view...",
];

const POPULAR_CITIES = ["Paris", "Tokyo", "Mumbai", "New York", "Rome", "Bangkok", "Dubai"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryBadge = ({ type }: { type: string }) => {
  const meta = CATEGORY_META[type] ?? CATEGORY_META.attraction;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "0.65rem", fontWeight: 700, textTransform: "capitalize",
      padding: "2px 8px", borderRadius: "8px",
      color: meta.color, background: meta.bg,
    }}>
      {meta.icon} {type}
    </span>
  );
};

const StarRating = ({ rating }: { rating?: number }) => {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ fontSize: "0.65rem", color: "#2A9D8F", letterSpacing: "1px" }}>
      {"".repeat(full)}{half ? "½" : ""}{"".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      <span style={{ color: "rgba(27, 42, 59, 0.55)", marginLeft: "4px" }}>{rating.toFixed(1)}</span>
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ExploreMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInitialized = useRef(false);

  const [city, setCity] = useState("");
  const [mapLoading, setMapLoading] = useState(true);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [exploreError, setExploreError] = useState<string | null>(null);

  const [places, setPlaces] = useState<MapLocation[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exploredCity, setExploredCity] = useState<string>("");

  // Rotate loading messages
  useEffect(() => {
    if (!exploreLoading) return;
    const id = setInterval(() => setLoadingMsgIdx((p) => (p + 1) % EXPLORE_MSGS.length), 2200);
    return () => clearInterval(id);
  }, [exploreLoading]);

  // Initialize map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized.current) return;

    try {
      // Leaflet is fully free — no API key needed
      initMap(mapContainerRef.current!, [78.9629, 20.5937], 4);
      mapInitialized.current = true;
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Failed to initialize map.");
    } finally {
      setMapLoading(false);
    }

    return () => {
      mapInitialized.current = false;
    };
  }, []);

  const handleExplore = useCallback(async (cityName?: string) => {
    const q = (cityName ?? city).trim();
    if (!q) return;
    if (mapLoading) return;

    setExploreError(null);
    setExploreLoading(true);
    setLoadingMsgIdx(0);
    setPlaces([]);
    setSelectedId(null);
    clearTouristMarkers();

    try {
      // Step 1: Geocode → fly map
      const geo = await geocodeCity(q);
      flyTo(geo.coordinates, 12);
      setExploredCity(geo.name);

      // Step 2: Groq AI → 15 tourist places
      const fetched = await generateTouristPlaces(q);

      // Step 3: Add markers
      for (const place of fetched) {
        addTouristMarker(place, (loc) => {
          setSelectedId(loc.id);
        });
      }

      setPlaces(fetched);
    } catch (e) {
      setExploreError(e instanceof Error ? e.message : "Exploration failed. Please try again.");
    } finally {
      setExploreLoading(false);
    }
  }, [city, mapLoading]);

  const handleSelectPlace = (place: MapLocation) => {
    setSelectedId(place.id);
    openTouristPopup(place.id);
  };

  const filteredPlaces = activeFilter === "all"
    ? places
    : places.filter((p) => (p.type ?? p.category) === activeFilter);

  const filterCounts: Record<string, number> = { all: places.length };
  for (const p of places) {
    const t = p.type ?? p.category;
    filterCounts[t] = (filterCounts[t] ?? 0) + 1;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "28px" }}
      >
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.7rem)", fontWeight: 900, marginBottom: "8px" }}>
          <GradientText> Explore</GradientText> the Map
        </h1>
        <p style={{ color: "rgba(27, 42, 59, 0.55)", fontSize: "0.95rem" }}>
          AI-powered tourist discovery — 15 handpicked spots on an interactive map
        </p>
      </motion.div>

      {/* ── Main Layout: Sidebar + Map ──────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: "16px",
        height: "calc(100vh - 260px)",
        minHeight: "580px",
        maxHeight: "820px",
      }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: "310px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div style={{
            background: "rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: "16px",
            padding: "16px",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <MapPinIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(27, 42, 59, 0.55)", pointerEvents: "none" }} />
              <input
                placeholder="City name — e.g. Paris, Goa..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                disabled={exploreLoading}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 40px 10px 36px",
                  background: "rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  borderRadius: "10px", color: "#1B2A3B",
                  fontSize: "0.88rem", outline: "none",
                  transition: "border-color 0.2s",
                  opacity: exploreLoading ? 0.5 : 1,
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(42, 157, 143,0.5)"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(0, 0, 0, 0.05)"; }}
              />
              <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "auto" }}><GetLocationButton onLocation={setCity} /></div>
            </div>
            <Button
              fullWidth
              size="sm"
              onClick={() => handleExplore()}
              loading={exploreLoading}
              disabled={!city.trim() || mapLoading}
              leftIcon={<SparklesIcon style={{ width: 16, height: 16 }} />}
            >
              {exploreLoading ? "Exploring..." : "Explore with AI"}
            </Button>

            {/* Popular quick-picks */}
            {!places.length && !exploreLoading && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "0.68rem", color: "rgba(27, 42, 59, 0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Popular destinations
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); handleExplore(c); }}
                      disabled={mapLoading}
                      style={{
                        padding: "4px 10px", borderRadius: "12px", fontSize: "0.73rem",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                        background: "rgba(0, 0, 0, 0.05)", color: "rgba(27, 42, 59, 0.78)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(42, 157, 143,0.15)"; (e.target as HTMLButtonElement).style.borderColor = "rgba(42, 157, 143,0.4)"; }}
                      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(0, 0, 0, 0.05)"; (e.target as HTMLButtonElement).style.borderColor = "rgba(0, 0, 0, 0.05)"; }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {exploreError && (
              <p style={{ marginTop: "10px", fontSize: "0.78rem", color: "#2A9D8F", display: "flex", alignItems: "center", gap: "6px" }}>
                <ExclamationTriangleIcon style={{ width: 14, height: 14, flexShrink: 0 }} /> {exploreError}
              </p>
            )}
          </div>

          {/* Filter Tabs */}
          {places.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "14px",
                padding: "10px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                <FunnelIcon style={{ width: 12, height: 12, color: "rgba(27, 42, 59, 0.55)" }} />
                <span style={{ fontSize: "0.68rem", color: "rgba(27, 42, 59, 0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Filter by type
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {FILTER_TABS.map((tab) => {
                  const count = filterCounts[tab.id] ?? 0;
                  const isActive = activeFilter === tab.id;
                  if (tab.id !== "all" && !count) return null;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      style={{
                        padding: "5px 10px", borderRadius: "20px",
                        fontSize: "0.73rem", fontWeight: 600,
                        border: `1px solid ${isActive ? tab.color : "rgba(0, 0, 0, 0.05)"}`,
                        background: isActive ? `${tab.color}22` : "rgba(0, 0, 0, 0.05)",
                        color: isActive ? tab.color : "rgba(27, 42, 59, 0.62)",
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      {tab.emoji} {tab.label}
                      {count > 0 && (
                        <span style={{
                          width: "16px", height: "16px", borderRadius: "50%",
                          background: isActive ? tab.color : "rgba(0, 0, 0, 0.05)",
                          color: isActive ? "#1B2A3B" : "rgba(27, 42, 59, 0.62)",
                          fontSize: "0.6rem", fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Loading inside sidebar */}
          {exploreLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "14px",
                padding: "20px 16px",
                textAlign: "center",
                flex: 1,
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}></div>
              <p style={{ fontSize: "0.8rem", color: "rgba(27, 42, 59, 0.62)", lineHeight: 1.6 }}>
                {EXPLORE_MSGS[loadingMsgIdx]}
              </p>
              <div style={{ marginTop: "12px", display: "flex", gap: "4px", justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2A9D8F" }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Places List */}
          {!exploreLoading && places.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                paddingRight: "2px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(42, 157, 143,0.3) transparent",
              }}
            >
              {/* City header */}
              <div style={{ padding: "6px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "rgba(27, 42, 59, 0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Exploring
                  </p>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1B2A3B" }}>{exploredCity}</p>
                </div>
                <span style={{ fontSize: "0.72rem", color: "rgba(27, 42, 59, 0.55)" }}>
                  {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""}
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredPlaces.map((place, i) => {
                  const isSelected = selectedId === place.id;
                  const type = place.type ?? place.category ?? "attraction";
                  const meta = CATEGORY_META[type] ?? CATEGORY_META.attraction;
                  return (
                    <motion.button
                      key={place.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      onClick={() => handleSelectPlace(place)}
                      whileHover={{ x: 3 }}
                      style={{
                        display: "flex", gap: "10px", alignItems: "flex-start",
                        width: "100%", textAlign: "left", cursor: "pointer",
                        padding: "12px",
                        background: isSelected
                          ? `${meta.color}18`
                          : "rgba(0, 0, 0, 0.05)",
                        border: `1px solid ${isSelected ? meta.color + "55" : "rgba(0, 0, 0, 0.05)"}`,
                        borderRadius: "12px",
                        transition: "all 0.18s",
                        outline: "none",
                      }}
                    >
                      {/* Category icon circle */}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: meta.bg, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", border: `1px solid ${meta.color}33`,
                      }}>
                        {meta.icon}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1B2A3B", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {place.name}
                        </p>
                        <StarRating rating={place.rating} />
                        <p style={{ fontSize: "0.72rem", color: "rgba(27, 42, 59, 0.55)", margin: "3px 0 5px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {place.description}
                        </p>
                        <CategoryBadge type={type} />
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state */}
          {!exploreLoading && places.length === 0 && !mapError && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "12px", opacity: 0.5, padding: "20px",
            }}>
              <div style={{ fontSize: "3rem" }}></div>
              <p style={{ fontSize: "0.85rem", color: "rgba(27, 42, 59, 0.62)", textAlign: "center", lineHeight: 1.6 }}>
                Search any city and let AI discover top tourist spots for you
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Map Container ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            flex: 1,
            position: "relative",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
            background: "#0d0d0f",
          }}
        >
          {/* Map loading overlay */}
          {mapLoading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0d0d0f",
            }}>
              <Loader message=" Loading interactive map..." />
            </div>
          )}

          {/* Map error overlay */}
          {mapError && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "#0d0d0f", gap: "12px", padding: "32px",
            }}>
              <div style={{ fontSize: "3rem" }}></div>
              <p style={{ color: "#2A9D8F", fontWeight: 700, textAlign: "center" }}>Map Failed to Load</p>
              <p style={{ color: "rgba(27, 42, 59, 0.55)", fontSize: "0.85rem", textAlign: "center", maxWidth: "300px" }}>
                {mapError}
              </p>
            </div>
          )}

          {/* Explore loading overlay on map */}
          <AnimatePresence>
            {exploreLoading && (
              <motion.div
                key="explore-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  background: "rgba(13,13,15,0.7)",
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: "16px",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ fontSize: "3.5rem" }}
                >
                  
                </motion.div>
                <p style={{ color: "#1B2A3B", fontWeight: 600, fontSize: "1rem" }}>
                  {EXPLORE_MSGS[loadingMsgIdx]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The actual Mapbox map */}
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

          {/* Legend */}
          {places.length > 0 && !exploreLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: "absolute", bottom: "28px", left: "16px", zIndex: 5,
                background: "rgba(13,13,15,0.88)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "14px", padding: "10px 14px",
                display: "flex", gap: "14px",
              }}
            >
              {FILTER_TABS.filter((t) => t.id !== "all" && (filterCounts[t.id] ?? 0) > 0).map((tab) => (
                <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: tab.color }} />
                  <span style={{ fontSize: "0.68rem", color: "rgba(27, 42, 59, 0.68)", fontWeight: 600 }}>
                    {tab.emoji} {tab.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Places count badge */}
          {places.length > 0 && !exploreLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: "absolute", top: "16px", left: "16px", zIndex: 5,
                background: "rgba(13,13,15,0.85)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(42, 157, 143,0.3)",
                borderRadius: "12px", padding: "8px 14px",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <MapPinIcon style={{ width: 14, height: 14, color: "#2A9D8F" }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1B2A3B" }}>
                {places.length} places in <GradientText style={{ fontSize: "0.78rem" }}>{exploredCity}</GradientText>
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default ExploreMap;
