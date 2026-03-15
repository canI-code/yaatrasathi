import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon, SparklesIcon, StarIcon, ExclamationTriangleIcon, BuildingLibraryIcon, BuildingOffice2Icon, TruckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import { GetLocationButton } from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import { initMap, flyTo, geocodeCity, clearTouristMarkers, addTouristMarker, openTouristPopup, locateUser, startMeasure, clearMeasure, addCustomMarker, clearCustomMarkers, clearDrawings, getRoute, clearRoute, getMapInstance } from "../lib/leafletMap";
import { generateTouristPlaces } from "../lib/groq";
import type { MapLocation } from "../types";
import { colors } from "../theme";

const FILTER_TABS = [
  { id: "all", label: "All", color: "#2A9D8F" },
  { id: "attraction", label: "Attractions", color: "#2A9D8F" },
  { id: "hotel", label: "Hotels", color: "#818CF8" },
  { id: "food", label: "Food", color: "#FBBF24" },
  { id: "transport", label: "Transport", color: "#34D399" },
] as const;
type FilterId = typeof FILTER_TABS[number]["id"];

const CATEGORY_META: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  attraction: { color: "#2A9D8F", bg: "rgba(42,157,143,0.12)", icon: <BuildingLibraryIcon style={{ width: 13, height: 13 }} /> },
  hotel: { color: "#818CF8", bg: "rgba(99,102,241,0.12)", icon: <BuildingOffice2Icon style={{ width: 13, height: 13 }} /> },
  food: { color: "#FBBF24", bg: "rgba(245,158,11,0.12)", icon: <StarIcon style={{ width: 13, height: 13 }} /> },
  transport: { color: "#34D399", bg: "rgba(16,185,129,0.12)", icon: <TruckIcon style={{ width: 13, height: 13 }} /> },
};

const EXPLORE_MSGS = ["Locating your destination...", "Groq AI scouting top spots...", "Pinning markers to the map...", "Polishing your explore view..."];
const POPULAR_CITIES = ["Paris", "Tokyo", "Mumbai", "New York", "Rome", "Bangkok", "Dubai", "Goa", "Jaipur"];

const CategoryBadge = ({ type }: { type: string }) => {
  const meta = CATEGORY_META[type] ?? CATEGORY_META.attraction;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.65rem", fontWeight: 700, textTransform: "capitalize", padding: "2px 8px", borderRadius: 8, color: meta.color, background: meta.bg }}>{meta.icon} {type}</span>;
};

const StarRating = ({ rating }: { rating?: number }) => {
  if (!rating) return null;
  return <span style={{ fontSize: "0.65rem", color: "#d97706" }}>{"*".repeat(Math.floor(rating))}<span style={{ color: "rgba(27,42,59,0.45)", marginLeft: 4 }}>{rating.toFixed(1)}</span></span>;
};

const PanelCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 16, padding: "14px", border: "1px solid rgba(164,216,225,0.35)", boxShadow: "0 6px 24px rgba(0,0,0,0.10)", pointerEvents: "auto", ...style }}>{children}</div>
);

// ── Nominatim suggestion type ─────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

// ── LocationSearch — autocomplete search box ──────────────────────────────────
function LocationSearch({ onSelect, placeholder = "Search place, city, landmark..." }: {
  onSelect: (result: NominatimResult) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=7&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json() as NominatimResult[];
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350);
  }

  function handleSelect(result: NominatimResult) {
    setQuery(result.display_name.split(",").slice(0, 2).join(","));
    setSuggestions([]);
    setOpen(false);
    onSelect(result);
  }

  function getIcon(type: string, cls: string) {
    if (cls === "amenity" || type === "university" || type === "school" || type === "college") return "🏫";
    if (cls === "tourism" || type === "attraction") return "🏛️";
    if (cls === "place" || type === "city" || type === "town" || type === "village") return "🏙️";
    if (cls === "highway") return "🛣️";
    if (cls === "natural") return "🌿";
    if (cls === "shop") return "🛍️";
    if (cls === "leisure") return "🌳";
    return "📍";
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <MagnifyingGlassIcon style={{ position: "absolute", left: 12, width: 15, height: 15, color: loading ? colors.accentStrong : colors.textSubtle, flexShrink: 0, zIndex: 1 }} />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "10px 40px 10px 36px", borderRadius: 12,
            border: `1px solid ${open ? "rgba(42,157,143,0.45)" : "rgba(0,0,0,0.08)"}`,
            background: "rgba(255,255,255,0.7)", fontSize: "0.85rem",
            fontFamily: "Inter,sans-serif", color: colors.textMain, outline: "none",
            transition: "border-color 0.2s", boxSizing: "border-box",
          }}
        />
        {loading && (
          <div style={{ position: "absolute", right: 10 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ width: 14, height: 14, border: "2px solid rgba(42,157,143,0.2)", borderTopColor: colors.accentStrong, borderRadius: "50%" }} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9999,
              background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)",
              borderRadius: 12, border: "1px solid rgba(164,216,225,0.4)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)", overflow: "hidden",
            }}>
            {suggestions.map((s, i) => (
              <button key={s.place_id} onClick={() => handleSelect(s)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 12px", border: "none",
                  background: "transparent", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 8,
                  borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(42,157,143,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>{getIcon(s.type, s.class)}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: colors.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.display_name.split(",")[0]}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: colors.textSubtle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.display_name.split(",").slice(1, 4).join(",")}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ExploreMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInitialized = useRef(false);
  const [city, setCity] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [places, setPlaces] = useState<MapLocation[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exploredCity, setExploredCity] = useState("");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [routeResult, setRouteResult] = useState<{ distance: number; duration: number; steps: string[] } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    if (!exploreLoading) return;
    const id = setInterval(() => setLoadingMsgIdx((p) => (p + 1) % EXPLORE_MSGS.length), 2200);
    return () => clearInterval(id);
  }, [exploreLoading]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized.current) return;
    try {
      initMap(mapContainerRef.current, [78.9629, 20.5937], 4);
      mapInitialized.current = true;
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Failed to initialize map.");
    } finally {
      setMapLoading(false);
    }
    return () => { mapInitialized.current = false; };
  }, []);

  const handleExplore = useCallback(async (cityName?: string, coords?: [number, number]) => {
    const q = (cityName ?? city).trim();
    if (!q || mapLoading) return;
    setExploreError(null);
    setExploreLoading(true);
    setLoadingMsgIdx(0);
    setPlaces([]);
    setSelectedId(null);
    clearTouristMarkers();
    try {
      let center: [number, number];
      let displayName: string;
      if (coords) {
        center = coords;
        displayName = q;
      } else {
        // Use Nominatim directly
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
        if (!data.length) throw new Error(`"${q}" not found. Try selecting from the suggestions.`);
        center = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        displayName = data[0].display_name.split(",")[0];
      }
      flyTo(center, 14);
      setExploredCity(displayName);
      const fetched = await generateTouristPlaces(q);
      for (const place of fetched) addTouristMarker(place, (loc) => setSelectedId(loc.id));
      setPlaces(fetched);
    } catch (e) {
      setExploreError(e instanceof Error ? e.message : "Exploration failed.");
    } finally {
      setExploreLoading(false);
    }
  }, [city, mapLoading]);

  const handleSelectPlace = (place: MapLocation) => { setSelectedId(place.id); openTouristPopup(place.id); };

  const handleLocate = async () => {
    try { await locateUser(); } catch (e) { alert(e instanceof Error ? e.message : "Location failed."); }
  };

  const handleMeasureToggle = () => {
    if (activeTool === "measure") { clearMeasure(); setActiveTool(null); }
    else { clearMeasure(); startMeasure(); setActiveTool("measure"); }
  };

  const handleDropPin = () => {
    const map = getMapInstance();
    if (map) { const c = map.getCenter(); addCustomMarker(c, customLabel || "Pin"); setCustomLabel(""); }
  };

  const handleGetRoute = async () => {
    if (!routeFrom.trim() || !routeTo.trim()) return;
    setRouteLoading(true);
    setRouteError(null);
    setRouteResult(null);
    clearRoute();
    try {
      const [fromGeo, toGeo] = await Promise.all([geocodeCity(routeFrom), geocodeCity(routeTo)]);
      const result = await getRoute(fromGeo.coordinates, toGeo.coordinates);
      setRouteResult(result);
    } catch (e) {
      setRouteError(e instanceof Error ? e.message : "Routing failed.");
    } finally {
      setRouteLoading(false);
    }
  };

  const filteredPlaces = activeFilter === "all" ? places : places.filter((p) => (p.type ?? p.category) === activeFilter);
  const filterCounts: Record<string, number> = { all: places.length };
  for (const p of places) { const t = p.type ?? p.category; filterCounts[t] = (filterCounts[t] ?? 0) + 1; }
  const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  const formatDur = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m} min`; };

  return (
    <div style={{ position: "fixed", top: 68, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} />

      {mapLoading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "#e8e0d8" }}>
          <Loader message="Loading interactive map..." />
        </div>
      )}

      <AnimatePresence>
        {exploreLoading && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.22)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ fontSize: "3rem" }}>O</motion.div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", background: "rgba(0,0,0,0.45)", padding: "7px 18px", borderRadius: 999 }}>{EXPLORE_MSGS[loadingMsgIdx]}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        style={{ position: "absolute", top: 12, left: 12, bottom: 12, width: 290, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(42,157,143,0.3) transparent" }}>

        <PanelCard>
          <p style={{ margin: "0 0 10px", fontSize: "0.7rem", fontWeight: 700, color: "rgba(27,42,59,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Explore the Map</p>
          <div style={{ marginBottom: 10 }}>
            <LocationSearch
              placeholder="Search place, college, city..."
              onSelect={(result) => {
                const coords: [number, number] = [parseFloat(result.lon), parseFloat(result.lat)];
                setSelectedCoords(coords);
                setCity(result.display_name.split(",")[0]);
                flyTo(coords, 16);
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Button fullWidth size="sm" onClick={() => handleExplore(city, selectedCoords ?? undefined)} loading={exploreLoading} disabled={!city.trim() || mapLoading}
              leftIcon={<SparklesIcon style={{ width: 15, height: 15 }} />}>
              {exploreLoading ? "Exploring..." : "Explore with AI"}
            </Button>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              <GetLocationButton onLocation={(loc) => { setCity(loc); setSelectedCoords(null); }} />
            </div>
          </div>
          {!places.length && !exploreLoading && (
            <div style={{ marginTop: 6 }}>
              <p style={{ fontSize: "0.63rem", color: "rgba(27,42,59,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Popular</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {POPULAR_CITIES.map((c) => (
                  <button key={c} onClick={() => { setCity(c); setSelectedCoords(null); handleExplore(c); }} disabled={mapLoading}
                    style={{ padding: "3px 9px", borderRadius: 10, fontSize: "0.72rem", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.04)", color: "rgba(27,42,59,0.7)", cursor: "pointer", fontFamily: "Inter,sans-serif" }}>{c}</button>
                ))}
              </div>
            </div>
          )}
          {exploreError && <p style={{ marginTop: 8, fontSize: "0.74rem", color: "#dc2626", display: "flex", alignItems: "center", gap: 5 }}><ExclamationTriangleIcon style={{ width: 13, height: 13 }} />{exploreError}</p>}
        </PanelCard>

        <PanelCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showTools ? 10 : 0 }}>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "rgba(27,42,59,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Map Tools</p>
            <button onClick={() => setShowTools((v) => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.72rem", color: colors.accentStrong, fontFamily: "Inter,sans-serif", fontWeight: 600 }}>{showTools ? "Hide" : "Show"}</button>
          </div>
          {showTools && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={handleLocate} title="Find my location" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(164,216,225,0.3)", background: "rgba(255,255,255,0.8)", color: colors.textMuted, cursor: "pointer", fontSize: "0.75rem", fontFamily: "Inter,sans-serif" }}>Locate Me</button>
                <button onClick={handleMeasureToggle} title="Measure distance" style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${activeTool === "measure" ? colors.accentStrong : "rgba(164,216,225,0.3)"}`, background: activeTool === "measure" ? "rgba(42,157,143,0.12)" : "rgba(255,255,255,0.8)", color: activeTool === "measure" ? colors.accentStrong : colors.textMuted, cursor: "pointer", fontSize: "0.75rem", fontFamily: "Inter,sans-serif" }}>{activeTool === "measure" ? "Stop Measure" : "Measure"}</button>
                <button onClick={() => { clearMeasure(); setActiveTool(null); clearCustomMarkers(); clearDrawings(); clearTouristMarkers(); setPlaces([]); setExploredCity(""); }} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)", color: "#dc2626", cursor: "pointer", fontSize: "0.75rem", fontFamily: "Inter,sans-serif" }}>Clear All</button>
              </div>
              {activeTool === "measure" && (
                <p style={{ margin: 0, fontSize: "0.72rem", color: colors.accentStrong, background: "rgba(42,157,143,0.08)", padding: "6px 10px", borderRadius: 8 }}>Click on the map to add measurement points</p>
              )}
              <div>
                <p style={{ margin: "0 0 5px", fontSize: "0.7rem", fontWeight: 600, color: "rgba(27,42,59,0.55)" }}>Drop custom pin at map center</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Pin label..."
                    style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "Inter,sans-serif", outline: "none" }} />
                  <button onClick={handleDropPin} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: colors.accentStrong, color: "#fff", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>Add</button>
                </div>
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: "0.7rem", fontWeight: 600, color: "rgba(27,42,59,0.55)" }}>Route Planner (driving)</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <input value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)} placeholder="From city..."
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "Inter,sans-serif", outline: "none" }} />
                  <input value={routeTo} onChange={(e) => setRouteTo(e.target.value)} placeholder="To city..."
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "Inter,sans-serif", outline: "none" }} />
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={handleGetRoute} disabled={routeLoading || !routeFrom.trim() || !routeTo.trim()}
                      style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: routeLoading ? "rgba(42,157,143,0.4)" : colors.accentStrong, color: "#fff", fontSize: "0.75rem", fontWeight: 600, cursor: routeLoading ? "wait" : "pointer", fontFamily: "Inter,sans-serif" }}>
                      {routeLoading ? "Routing..." : "Get Route"}
                    </button>
                    <button onClick={() => { clearRoute(); setRouteResult(null); setRouteError(null); }}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "transparent", fontSize: "0.75rem", cursor: "pointer", fontFamily: "Inter,sans-serif", color: colors.textMuted }}>Clear</button>
                  </div>
                  {routeError && <p style={{ margin: 0, fontSize: "0.72rem", color: "#dc2626" }}>{routeError}</p>}
                  {routeResult && (
                    <div style={{ background: "rgba(42,157,143,0.06)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(42,157,143,0.15)" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 700, color: colors.accentStrong }}>{formatDist(routeResult.distance)} - {formatDur(routeResult.duration)}</p>
                      {routeResult.steps.slice(0, 4).map((s, i) => <p key={i} style={{ margin: "0 0 2px", fontSize: "0.68rem", color: "rgba(27,42,59,0.6)" }}>- {s}</p>)}
                      {routeResult.steps.length > 4 && <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(27,42,59,0.4)" }}>+{routeResult.steps.length - 4} more steps</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </PanelCard>

        {places.length > 0 && (
          <PanelCard style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {FILTER_TABS.map((tab) => {
                const count = filterCounts[tab.id] ?? 0;
                const isActive = activeFilter === tab.id;
                if (tab.id !== "all" && !count) return null;
                return (
                  <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: "0.71rem", fontWeight: 600, border: `1px solid ${isActive ? tab.color : "rgba(0,0,0,0.08)"}`, background: isActive ? `${tab.color}22` : "transparent", color: isActive ? tab.color : "rgba(27,42,59,0.6)", cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
                    {tab.label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </PanelCard>
        )}

        {!exploreLoading && places.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, pointerEvents: "auto" }}>
            <div style={{ padding: "2px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#1B2A3B" }}>{exploredCity}</p>
              <span style={{ fontSize: "0.68rem", color: "rgba(27,42,59,0.45)" }}>{filteredPlaces.length} places</span>
            </div>
            <AnimatePresence mode="popLayout">
              {filteredPlaces.map((place, i) => {
                const isSelected = selectedId === place.id;
                const type = place.type ?? place.category ?? "attraction";
                const meta = CATEGORY_META[type] ?? CATEGORY_META.attraction;
                return (
                  <motion.button key={place.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectPlace(place)}
                    style={{ display: "flex", gap: 9, alignItems: "flex-start", width: "100%", textAlign: "left", padding: "10px 11px", borderRadius: 12, cursor: "pointer", outline: "none", background: isSelected ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)", border: `2px solid ${isSelected ? meta.color : "rgba(164,216,225,0.25)"}`, boxShadow: isSelected ? `0 4px 16px ${meta.color}33` : "0 2px 8px rgba(0,0,0,0.06)", fontFamily: "Inter,sans-serif" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: meta.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1B2A3B", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.name}</p>
                      <StarRating rating={place.rating} />
                      <p style={{ fontSize: "0.68rem", color: "rgba(27,42,59,0.5)", margin: "2px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{place.description}</p>
                      <CategoryBadge type={type} />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!exploreLoading && places.length === 0 && !mapError && (
          <PanelCard style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(27,42,59,0.5)", lineHeight: 1.6, margin: 0 }}>Search any city and let AI discover top tourist spots for you</p>
          </PanelCard>
        )}
      </motion.div>

      {places.length > 0 && !exploreLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ position: "absolute", bottom: 20, right: 16, zIndex: 1000, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(164,216,225,0.3)", borderRadius: 12, padding: "7px 14px", display: "flex", gap: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          {FILTER_TABS.filter((t) => t.id !== "all" && (filterCounts[t.id] ?? 0) > 0).map((tab) => (
            <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: tab.color }} />
              <span style={{ fontSize: "0.67rem", color: "rgba(27,42,59,0.65)", fontWeight: 600 }}>{tab.label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ExploreMap;