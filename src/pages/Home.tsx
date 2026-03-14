import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import GradientText from "../components/ui/GradientText";
import Button from "../components/ui/Button";
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
  { icon: <GlobeAsiaAustraliaIcon style={{ width: 28 }} />, name: "Darjeeling", tagline: "Queen Of Hills", query: "Darjeeling, West Bengal", image: "https://images.unsplash.com/photo-1544605928-1b6c7a7ce6b2?q=80&w=800&auto=format&fit=crop" },
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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => {
          const currentLoc = window.prompt("Please enter your current location:");
          if (currentLoc) {
            navigate(`/planner?source=${encodeURIComponent(currentLoc)}&destination=${encodeURIComponent(query)}`);
          } else {
            navigate(`/planner?destination=${encodeURIComponent(query)}`);
          }
        }}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        height: "200px",
        background: hovered ? "rgba(42, 157, 143, 0.08)" : "rgba(0, 0, 0, 0.05)",
        border: hovered ? "1px solid rgba(42, 157, 143, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : "0 4px 12px rgba(0,0,0,0.04)",
        transition: "all 0.28s ease",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)" }} />
      <motion.div
        animate={hovered ? { y: -4, scale: 1.02 } : { y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          color: hovered ? "#A4D8E1" : "#ffffff",
        }}
      >
        {icon}
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          bottom: "22px",
          right: "20px",
          fontSize: "1rem",
          color: "rgba(255, 255, 255, 0.8)",
        }}
      >
        →
      </motion.div>
    </motion.div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard = ({ icon, label, path, desc }: (typeof FEATURES)[0]) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          padding: "28px 24px",
          borderRadius: "20px",
          background: hovered
            ? "rgba(164, 216, 225, 0.12)" : "rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: hovered
            ? "1px solid rgba(42, 157, 143,0.3)"
            : "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: hovered
            ? "0 8px 24px rgba(42, 157, 143,0.1), 0 4px 12px rgba(0,0,0,0.05)"
            : "0 4px 12px rgba(0,0,0,0.05)",
          cursor: "pointer",
          height: "100%",
          transition: "background 0.25s ease, border 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <motion.div
          animate={hovered ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{ marginBottom: "14px", color: hovered ? "#2A9D8F" : "#A4D8E1" }}
        >
          {icon}
        </motion.div>
        <h3
          style={{
            fontSize: "0.97rem",
            fontWeight: 700,
            color: hovered ? "#2A9D8F" : "#3D3C3A",
            marginBottom: "8px",
            transition: "color 0.25s ease",
          }}
        >
          {label}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "rgba(61, 60, 58,0.6)", lineHeight: 1.6 }}>
          {desc}
        </p>
      </motion.div>
    </Link>
  );
};

// ─── Stagger helpers ──────────────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Home Page ────────────────────────────────────────────────────────────────

const Home = () => {
  const featuresRef = useRef<HTMLElement>(null);
  const howWorksRef = useRef<HTMLDivElement>(null);
  const howWorksInView = useInView(howWorksRef, { once: true, amount: 0.25 });
  const featuresInView = useInView(featuresRef as React.RefObject<Element>, { once: true, amount: 0.1 });
  const destRef = useRef<HTMLDivElement>(null);
  const destInView = useInView(destRef, { once: true, amount: 0.15 });

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          padding: "120px clamp(16px, 5vw, 60px) 60px",
          position: "relative",
          backgroundColor: "#f9f6f2",
          overflow: "hidden",
        }}
      >
        {/* Background Accents (Subtle) */}
        <div
          style={{
            position: "absolute",
            width: "60vw",
            height: "60vw",
            maxWidth: 600,
            maxHeight: 600,
            borderRadius: "50%",
            backgroundColor: "rgba(164, 216, 225, 0.15)",
            filter: "blur(80px)",
            top: "-10%",
            right: "-5%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "40vw",
            height: "40vw",
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: "50%",
            backgroundColor: "rgba(42, 157, 143, 0.1)",
            filter: "blur(60px)",
            bottom: "-5%",
            left: "-10%",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "30px", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <div style={{ width: 40, height: 4, backgroundColor: "#2A9D8F", borderRadius: 4 }} />
            <span style={{ color: "#2A9D8F", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.9rem" }}>
              Premium AI Travel
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#1a1a1a",
              maxWidth: 800,
            }}
          >
            Plan smarter, <br />
            travel <span style={{ color: "#2A9D8F" }}>better.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
              color: "rgba(61, 60, 58, 0.7)",
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            YatraSathi uses advanced AI to instantly generate personalized itineraries, calculate budgets, and find the best local experiences—all in a beautifully simple interface.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.3 }}
             style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}
          >
             <Link to="/planner" style={{ textDecoration: "none" }}>
               <Button size="lg" style={{ padding: "16px 40px", fontSize: "1rem", borderRadius: "8px" }}>
                 Start Planning
               </Button>
             </Link>
             <Button size="lg" variant="ghost" onClick={scrollToFeatures} style={{ padding: "16px 40px", fontSize: "1rem", borderRadius: "8px" }}>
               Explore Features
             </Button>
          </motion.div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.6 }}
             style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "40px", paddingTop: "30px", borderTop: "1px solid rgba(0,0,0,0.05)", maxWidth: 600 }}
          >
             <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a" }}>10k+</span>
                <span style={{ fontSize: "0.85rem", color: "rgba(61,60,58,0.6)", fontWeight: 500 }}>Trips Planned</span>
             </div>
             <div style={{ width: 1, height: 40, backgroundColor: "rgba(0,0,0,0.1)" }} />
             <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a" }}>500+</span>
                <span style={{ fontSize: "0.85rem", color: "rgba(61,60,58,0.6)", fontWeight: 500 }}>Destinations</span>
             </div>
             <div style={{ width: 1, height: 40, backgroundColor: "rgba(0,0,0,0.1)" }} />
             <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a" }}>4.9/5</span>
                <span style={{ fontSize: "0.85rem", color: "rgba(61,60,58,0.6)", fontWeight: 500 }}>User Rating</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        data-glass-section
        style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1100px", margin: "0 auto" }}
      >
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2A9D8F", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px" }}>
            Three steps to your{" "}
            <GradientText>perfect trip</GradientText>
          </h2>
        </motion.div>

        <div ref={howWorksRef} style={{ position: "relative" }}>
          {/* Dotted connector line */}
          <div
            style={{
              position: "absolute",
              top: "48px",
              left: "calc(16.66% + 48px)",
              right: "calc(16.66% + 48px)",
              height: "2px",
              background: "#F0F4F8",
              pointerEvents: "none",
            }}
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={howWorksInView ? "visible" : "hidden"}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "32px" }}
          >
            {STEPS.map((step) => (
              <motion.div
                data-glass-elevated
                key={step.number}
                variants={fadeUp}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "40px 28px",
                  borderRadius: "24px",
                  background: "rgba(246, 249, 252, 0.9)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "#F0F4F8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: "0 8px 28px rgba(42, 157, 143,0.35)",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "rgba(61, 60, 58, 0.9)" }}>{step.number}</span>
                </div>
                <div style={{ fontSize: "2rem", marginBottom: "14px" }}>{step.icon}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "10px", color: "rgba(61, 60, 58, 0.9)" }}>{step.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(61, 60, 58,0.5)", lineHeight: 1.7 }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section
        data-glass-section
        ref={featuresRef as React.RefObject<HTMLElement>}
        style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto", scrollMarginTop: "80px" }}
      >
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2A9D8F", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            FEATURES
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px" }}>
            Everything you need to <GradientText>travel smarter</GradientText>
          </h2>
          <p style={{ color: "rgba(61, 60, 58,0.45)", fontSize: "0.95rem", marginTop: "12px" }}>9 AI-powered tools. One platform.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}
        >
          {FEATURES.map((feat) => (
            <motion.div key={feat.path} variants={fadeUp}>
              <FeatureCard {...feat} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section
        style={{
          padding: "80px clamp(16px, 5vw, 80px)",
          background: "#F0F4F8",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              style={{
                textAlign: "center",
                padding: "36px 20px",
                borderRadius: "20px",
                background: "rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  color: "#b7e4e7",
                  lineHeight: 1.1,
                  marginBottom: "8px",
                }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ fontSize: "0.83rem", color: "rgba(61, 60, 58,0.5)", fontWeight: 500 }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Popular Destinations ── */}
      <section style={{ padding: "100px clamp(16px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2A9D8F", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            POPULAR DESTINATIONS
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.5px" }}>
            Where will you go <GradientText>next?</GradientText>
          </h2>
          <p style={{ color: "rgba(61, 60, 58,0.45)", fontSize: "0.95rem", marginTop: "12px" }}>
            Click any destination to instantly generate a trip plan
          </p>
        </motion.div>

        <div ref={destRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={destInView ? "visible" : "hidden"}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}
          >
            {DESTINATIONS.map((dest) => (
              <motion.div key={dest.name} variants={fadeUp}>
                <DestinationCard {...dest} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      <section style={{ padding: "80px clamp(16px, 5vw, 80px)", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55 }}
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "64px 40px",
            borderRadius: "28px",
            background: "#F0F4F8",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(42, 157, 143,0.2)",
            boxShadow: "0 24px 80px rgba(42, 157, 143,0.1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}></div>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: "14px", letterSpacing: "-0.5px" }}>
            Ready to plan your <GradientText>dream trip?</GradientText>
          </h2>
          <p style={{ color: "rgba(61, 60, 58,0.5)", fontSize: "0.95rem", marginBottom: "36px", lineHeight: 1.7 }}>
            Join thousands of travelers who rely on YatraSathi AI to plan perfect journeys every day.
          </p>
          <Link to="/planner" style={{ textDecoration: "none" }}>
            <Button size="lg" style={{ padding: "15px 44px", fontSize: "1rem", boxShadow: "0 8px 32px rgba(42, 157, 143,0.4)" }}>
              <RocketLaunchIcon style={{ width: 20, display: "inline-block", verticalAlign: "middle", marginRight: "8px" }} /> Start Planning Free
            </Button>
          </Link>
        </motion.div>
      </section>
    </>
  );
};

export default Home;






