import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
import { colors } from "../theme";
import {
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  FireIcon,
  TruckIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CloudIcon,
  MapIcon,
  SunIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  HomeModernIcon,
  GlobeAsiaAustraliaIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Tell the AI",
    desc: "Enter your destination, duration, budget and travel style.",
    icon: <ChatBubbleLeftRightIcon style={{ width: 24, paddingBottom: 2 }} />,
  },
  {
    number: "02",
    title: "AI Crafts Your Plan",
    desc: "Groq AI generates a full itinerary, hotel picks, food guide & budget in seconds.",
    icon: <CpuChipIcon style={{ width: 24, paddingBottom: 2 }} />,
  },
  {
    number: "03",
    title: "Go Explore",
    desc: "Download your plan as PDF, navigate with the live map, and travel smart.",
    icon: <PaperAirplaneIcon style={{ width: 24, paddingBottom: 2 }} />,
  },
];

const FEATURES = [
  { icon: <CpuChipIcon style={{ width: 24 }} />, label: "AI Trip Planner", path: "/planner", desc: "Full itineraries crafted by Groq AI in seconds." },
  { icon: <CurrencyDollarIcon style={{ width: 24 }} />, label: "Smart Budget Estimator", path: "/budget", desc: "Detailed cost breakdowns for any destination & style." },
  { icon: <BuildingOffice2Icon style={{ width: 24 }} />, label: "Hotels & Stays", path: "/hotels", desc: "Curated hotel picks from budget to luxury." },
  { icon: <FireIcon style={{ width: 24 }} />, label: "Local Food Guide", path: "/food", desc: "Must-try dishes and where to find them locally." },
  { icon: <TruckIcon style={{ width: 24 }} />, label: "Travel Options", path: "/transport", desc: "Compare flights, trains, buses and more." },
  { icon: <ShieldCheckIcon style={{ width: 24 }} />, label: "Safety Guide", path: "/safety", desc: "Stay safe with AI-powered travel safety tips." },
  { icon: <CalendarDaysIcon style={{ width: 24 }} />, label: "Best Time To Visit", path: "/best-time", desc: "Seasonal insights for perfect timing." },
  { icon: <CloudIcon style={{ width: 24 }} />, label: "Live Weather", path: "/weather", desc: "Real-time weather from OpenWeatherMap." },
  { icon: <MapIcon style={{ width: 24 }} />, label: "Interactive Map", path: "/map", desc: "Explore destinations on a live Mapbox map." },
];

const DESTINATIONS = [
  { icon: <SunIcon style={{ width: 28 }} />, name: "Goa", tagline: "Sun · Sand · Seafood", query: "Goa, India", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=800&auto=format&fit=crop" },
  { icon: <SparklesIcon style={{ width: 28 }} />, name: "Manali", tagline: "Mountains · Adventure", query: "Manali, Himachal Pradesh", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop" },
  { icon: <BuildingStorefrontIcon style={{ width: 28 }} />, name: "Jaipur", tagline: "The Pink City", query: "Jaipur, Rajasthan", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop" },
  { icon: <MapPinIcon style={{ width: 28 }} />, name: "Kerala", tagline: "God's Own Country", query: "Kerala, India", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop" },
  { icon: <HomeModernIcon style={{ width: 28 }} />, name: "Varanasi", tagline: "Spiritual Capital", query: "Varanasi, Uttar Pradesh", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop" },
  { icon: <GlobeAsiaAustraliaIcon style={{ width: 28 }} />, name: "Darjeeling", tagline: "Queen Of Hills", query: "Darjeeling, West Bengal", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop" },
];

const STATS = [
  { value: 10000, suffix: "+", label: "Itineraries Generated", icon: <MapIcon style={{ width: 24 }} /> },
  { value: 500, suffix: "+", label: "Destinations Covered", icon: <GlobeAsiaAustraliaIcon style={{ width: 24 }} /> },
  { value: 9, suffix: "", label: "Smart AI Features", icon: <CpuChipIcon style={{ width: 24 }} /> },
  { value: 24, suffix: "/7", label: "AI Availability", icon: <SparklesIcon style={{ width: 24 }} /> },
];

// ─── Counter Component ────────────────────────────────────────────────────────

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [inView, count, target]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

// ─── Destination Card ─────────────────────────────────────────────────────────

const DestinationCard = ({
  icon, name, tagline, query, image,
}: (typeof DESTINATIONS)[0]) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image);
  const [imgFailed, setImgFailed] = useState(false);

  // Fallback gradient per destination
  const FALLBACK_GRADIENTS: Record<string, string> = {
    Goa: "linear-gradient(135deg, #0ea5e9 0%, #2A9D8F 100%)",
    Manali: "linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)",
    Jaipur: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
    Kerala: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
    Varanasi: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
    Darjeeling: "linear-gradient(135deg, #0891b2 0%, #6366f1 100%)",
  };
  const fallback = FALLBACK_GRADIENTS[name] ?? "linear-gradient(135deg, #2A9D8F 0%, #A4D8E1 100%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={() => {
          // Try to get current location via Geolocation API
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                  );
                  const data = await res.json();
                  const city =
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.state ||
                    data.address.country;
                  navigate(
                    `/planner?source=${encodeURIComponent(city ?? "")}&destination=${encodeURIComponent(query)}`
                  );
                } catch {
                  navigate(`/planner?destination=${encodeURIComponent(query)}`);
                }
              },
              () => {
                // Permission denied or failed — go without source
                navigate(`/planner?destination=${encodeURIComponent(query)}`);
              }
            );
          } else {
            navigate(`/planner?destination=${encodeURIComponent(query)}`);
          }
        }}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        height: "210px",
        border: "1px solid rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: imgFailed ? fallback : undefined, backgroundImage: imgFailed ? undefined : `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s ease" }} className="dest-img">
        {!imgFailed && (
          <img
            src={imgSrc}
            alt={name}
            onError={() => setImgFailed(true)}
            style={{ display: "none" }}
          />
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: "rgba(255, 255, 255, 0.85)",
        }}
      >
        {icon}
      </div>
      <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: "4px",
            letterSpacing: "-0.3px",
          }}
        >
          {name}
        </h3>
        <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}>
          {tagline}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard = ({ icon, label, path, desc }: (typeof FEATURES)[0]) => {
  return (
    <Link to={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          padding: "28px 24px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
          height: "100%",
          transition: "border-color 0.3s ease, background 0.3s ease",
        }}
        className="feature-card"
      >
        <div
          style={{ marginBottom: "14px", color: colors.accentSoft }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontSize: "0.97rem",
            fontWeight: 700,
            color: colors.textMain,
            marginBottom: "8px",
          }}
        >
          {label}
        </h3>
        <p style={{ fontSize: "0.82rem", color: colors.textMuted, lineHeight: 1.65 }}>
          {desc}
        </p>
      </motion.div>
    </Link>
  );
};

// ─── Hero Animation Sub-component ────────────────────────────────────────────────────────
const HeroAnimation = () => {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "500px", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      {/* Background blobs (to give it depth) */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: "85%",
          height: "85%",
          background: "linear-gradient(135deg, rgba(42, 157, 143, 0.2), rgba(164, 216, 225, 0.4))",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      
      {/* Central rotating globe outline */}
      <motion.div
        animate={{ rotateZ: 360, rotateX: 20 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{
          width: "75%",
          height: "75%",
          position: "relative",
          zIndex: 1,
          borderRadius: "50%",
          border: `2px dashed ${colors.accentStrong}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <GlobeAsiaAustraliaIcon style={{ width: "85%", height: "85%", color: colors.accentStrong, strokeWidth: 0.5, opacity: 0.8 }} />
      </motion.div>

      {/* Floating markers */}
      <motion.div
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "15%", left: "5%", zIndex: 2 }}
      >
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", padding: "10px 14px", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(42,157,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <MapPinIcon style={{ width: 18, color: colors.accentStrong }} />
           </div>
           <div>
             <p style={{ fontSize: "0.75rem", fontWeight: 700, margin: 0, color: colors.textMain }}>Paris</p>
             <p style={{ fontSize: "0.65rem", margin: 0, color: colors.textMuted }}>Day 1</p>
           </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: "absolute", bottom: "10%", right: "0%", zIndex: 2 }}
      >
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", padding: "10px 14px", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <MapPinIcon style={{ width: 18, color: "rgba(234,88,12,1)" }} />
           </div>
           <div>
             <p style={{ fontSize: "0.75rem", fontWeight: 700, margin: 0, color: colors.textMain }}>Rome</p>
             <p style={{ fontSize: "0.65rem", margin: 0, color: colors.textMuted }}>Day 5</p>
           </div>
        </div>
      </motion.div>

      {/* Airplane orbiting */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          zIndex: 3
        }}
      >
        <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%) rotate(90deg)" }}>
          <div style={{ background: colors.accentStrong, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${colors.accentStrong}66`, border: "2px solid white" }}>
             <PaperAirplaneIcon style={{ width: 22, color: "white" }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Home Page ────────────────────────────────────────────────────────────────

const Home = () => {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          padding: "120px clamp(16px, 5vw, 60px) 60px",
          position: "relative",
          backgroundColor: colors.background,
          overflow: "hidden",
        }}
      >
        {/* Soft background blobs */}
        <div
          style={{
            position: "absolute",
            width: "50vw",
            height: "50vw",
            maxWidth: 500,
            maxHeight: 500,
            borderRadius: "50%",
            backgroundColor: "rgba(164, 216, 225, 0.12)",
            filter: "blur(100px)",
            top: "-8%",
            right: "-3%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "35vw",
            height: "35vw",
            maxWidth: 350,
            maxHeight: 350,
            borderRadius: "50%",
            backgroundColor: "rgba(42, 157, 143, 0.08)",
            filter: "blur(80px)",
            bottom: "-3%",
            left: "-8%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "25vw",
            height: "25vw",
            maxWidth: 250,
            maxHeight: 250,
            borderRadius: "50%",
            backgroundColor: "rgba(183, 228, 231, 0.1)",
            filter: "blur(70px)",
            top: "40%",
            left: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", zIndex: 1, flexWrap: "wrap" }}>
          
          {/* Left Hero Content */}
          <div style={{ flex: "1 1 min(100%, 540px)", display: "flex", flexDirection: "column", gap: "32px", zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div style={{ width: 40, height: 3, backgroundColor: colors.accentStrong, borderRadius: 4 }} />
              <span style={{ color: colors.accentStrong, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.85rem" }}>
                Premium AI Travel
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: colors.textMain,
                maxWidth: 800,
              }}
            >
              Plan smarter, <br />
              travel <span style={{ color: colors.accentStrong }}>better.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
                color: colors.textMuted,
                maxWidth: 600,
                lineHeight: 1.7,
              }}
            >
              YatraSathi uses advanced AI to instantly generate personalized itineraries, calculate budgets, and find the best local experiences—all in a beautifully simple interface.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.3 }}
               style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}
            >
               <Link to="/planner" style={{ textDecoration: "none" }}>
                 <Button size="lg" style={{ padding: "16px 40px", fontSize: "1rem", borderRadius: "14px" }}>
                   Start Planning
                 </Button>
               </Link>
               <Button size="lg" variant="ghost" onClick={scrollToFeatures} style={{ padding: "16px 40px", fontSize: "1rem", borderRadius: "14px" }}>
                 Explore Features
               </Button>
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1, delay: 0.6 }}
               style={{ display: "flex", alignItems: "center", gap: "28px", marginTop: "44px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.06)", maxWidth: 600 }}
            >
               <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, color: colors.textMain }}>10k+</span>
                  <span style={{ fontSize: "0.82rem", color: colors.textMuted, fontWeight: 500 }}>Trips Planned</span>
               </div>
               <div style={{ width: 1, height: 40, backgroundColor: "rgba(0,0,0,0.08)" }} />
               <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, color: colors.textMain }}>500+</span>
                  <span style={{ fontSize: "0.82rem", color: colors.textMuted, fontWeight: 500 }}>Destinations</span>
               </div>
               <div style={{ width: 1, height: 40, backgroundColor: "rgba(0,0,0,0.08)" }} />
               <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, color: colors.textMain }}>4.9/5</span>
                  <span style={{ fontSize: "0.82rem", color: colors.textMuted, fontWeight: 500 }}>User Rating</span>
               </div>
            </motion.div>
          </div>

          {/* Right Animation Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ flex: "1 1 min(100%, 480px)", display: "flex", justifyContent: "center", zIndex: 1 }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        data-glass-section
        style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1100px", margin: "0 auto" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: colors.accentStrong, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px", color: colors.textMain }}>
            Three steps to your{" "}
            <GradientText>perfect trip</GradientText>
          </h2>
        </motion.div>

        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "48px",
              left: "calc(16.66% + 48px)",
              right: "calc(16.66% + 48px)",
              height: "2px",
              background: "rgba(164, 216, 225, 0.3)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "28px" }}
          >
            {STEPS.map((step, idx) => (
              <motion.div
                data-glass-elevated
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "40px 28px",
                  borderRadius: "24px",
                  background: "rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(164, 216, 225, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: colors.accentStrong }}>{step.number}</span>
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "14px", color: colors.accentSoft }}>{step.icon}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "10px", color: colors.textMain }}>{step.title}</h3>
                <p style={{ fontSize: "0.85rem", color: colors.textMuted, lineHeight: 1.7 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section
        data-glass-section
        ref={featuresRef as React.RefObject<HTMLElement>}
        style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto", scrollMarginTop: "80px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: colors.accentStrong, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            FEATURES
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px", color: colors.textMain }}>
            Everything you need to <GradientText>travel smarter</GradientText>
          </h2>
          <p style={{ color: colors.textSubtle, fontSize: "0.95rem", marginTop: "12px" }}>9 AI-powered tools. One platform.</p>
        </motion.div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}
        >
          {FEATURES.map((feat) => (
            <FeatureCard key={feat.path} {...feat} />
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section
        style={{
          padding: "80px clamp(16px, 5vw, 80px)",
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.04)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              style={{
                textAlign: "center",
                padding: "36px 20px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{ color: colors.accentSoft, marginBottom: "12px" }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  color: colors.accentStrong,
                  lineHeight: 1.1,
                  marginBottom: "8px",
                }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ fontSize: "0.83rem", color: colors.textMuted, fontWeight: 500 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <section style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: colors.accentStrong, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            POPULAR DESTINATIONS
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px", color: colors.textMain }}>
            Where will you go <GradientText>next?</GradientText>
          </h2>
          <p style={{ color: colors.textSubtle, fontSize: "0.95rem", marginTop: "12px" }}>
            Click any destination to instantly generate a trip plan
          </p>
        </motion.div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}
        >
          {DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.name} {...dest} />
          ))}
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      <section style={{ padding: "80px clamp(16px, 5vw, 80px)", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "64px 40px",
            borderRadius: "28px",
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(164, 216, 225, 0.25)",
          }}
        >
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: "14px", letterSpacing: "-0.5px", color: colors.textMain }}>
            Ready to plan your <GradientText>dream trip?</GradientText>
          </h2>
          <p style={{ color: colors.textMuted, fontSize: "0.95rem", marginBottom: "36px", lineHeight: 1.7 }}>
            Join thousands of travelers who rely on YatraSathi AI to plan perfect journeys every day.
          </p>
          <Link to="/planner" style={{ textDecoration: "none" }}>
            <Button size="lg" style={{ padding: "15px 44px", fontSize: "1rem" }}>
              <RocketLaunchIcon style={{ width: 20, display: "inline-block", verticalAlign: "middle", marginRight: "8px" }} /> Start Planning Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* CSS for selective hover effects */}
      <style>{`
        .feature-card:hover {
          border-color: rgba(42, 157, 143, 0.25) !important;
          background: rgba(255, 255, 255, 0.6) !important;
        }
        .feature-card:hover h3 {
          color: ${colors.accentStrong} !important;
        }
      `}</style>
    </>
  );
};

export default Home;
