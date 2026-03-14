"""
YatraSathi ✈️ — AI Travel Planner
Landing page — full UI overhaul (MakeMyTrip / TripAdvisor style)
"""

import streamlit as st

# ─────────────────────────────────────────────────────────────
#  Page config  (ONLY defined here — never in sub-pages)
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="YatraSathi — AI Travel Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        "Get Help":     "https://github.com",
        "Report a bug": "https://github.com",
        "About":        "YatraSathi — Your AI-Powered Travel Companion",
    },
)

# ─────────────────────────────────────────────────────────────
#  Global CSS + sidebar branding (design system)
# ─────────────────────────────────────────────────────────────
from utils.styles import load_global_css, sidebar_branding  # noqa: E402
load_global_css()

# ──────────────────────────────────────────────────────────────
#  Landing-page-specific additional styles
# ──────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* ── Hero ── */
    .hero-section {
        background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
        padding: 4.5rem 2rem 3.5rem 2rem;
        border-radius: 24px;
        text-align: center;
        margin-bottom: 2.5rem;
        box-shadow: 0 24px 64px rgba(0,0,0,0.45);
        border: 1px solid rgba(255,255,255,0.07);
        position: relative;
        overflow: hidden;
    }
    .hero-section::before {
        content: "";
        position: absolute;
        top: -60px; left: -60px;
        width: 250px; height: 250px;
        background: radial-gradient(circle, rgba(255,75,75,0.18) 0%, transparent 70%);
        border-radius: 50%;
    }
    .hero-section::after {
        content: "";
        position: absolute;
        bottom: -60px; right: -60px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(79,172,254,0.15) 0%, transparent 70%);
        border-radius: 50%;
    }
    .hero-title {
        font-size: clamp(2.8rem, 6vw, 4.5rem);
        font-weight: 900;
        background: linear-gradient(90deg, #FF4B4B, #FF8E53, #FFC837, #FF8E53, #FF4B4B);
        background-size: 300% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shine 4s linear infinite;
        margin: 0;
        line-height: 1.15;
    }
    @keyframes shine { to { background-position: 300% center; } }
    .hero-plane {
        font-size: 3rem;
        display: inline-block;
        animation: float 3s ease-in-out infinite;
        margin-left: 0.5rem;
    }
    @keyframes float {
        0%,100% { transform: translateY(0) rotate(-10deg); }
        50%      { transform: translateY(-10px) rotate(5deg); }
    }
    .hero-subtitle {
        font-size: clamp(1.1rem, 2.5vw, 1.5rem);
        color: rgba(255,255,255,0.88);
        margin: 0.8rem 0 0.5rem 0;
        font-weight: 500;
    }
    .hero-tagline {
        font-size: clamp(0.9rem, 1.8vw, 1.05rem);
        color: rgba(255,255,255,0.5);
        font-style: italic;
        margin-bottom: 1.8rem;
    }
    .cta-btn {
        display: inline-block;
        background: linear-gradient(135deg, #FF4B4B, #FF8E53);
        color: white !important;
        padding: 0.85rem 2.5rem;
        border-radius: 50px;
        font-size: 1.05rem;
        font-weight: 700;
        text-decoration: none !important;
        box-shadow: 0 8px 24px rgba(255,75,75,0.5);
        transition: all 0.3s ease;
        letter-spacing: 0.3px;
    }
    .cta-btn:hover {
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 14px 32px rgba(255,75,75,0.65);
    }
    .hero-badges { margin-top: 1.5rem; }
    .hero-badge {
        display: inline-block;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 50px;
        padding: 5px 16px;
        font-size: 0.82rem;
        color: rgba(255,255,255,0.75);
        margin: 0.25rem 0.3rem;
        backdrop-filter: blur(6px);
    }

    /* ── Stats bar ── */
    .stats-bar {
        background: linear-gradient(135deg, rgba(15,12,41,0.9), rgba(48,43,99,0.9));
        border-radius: 18px;
        padding: 2rem 1rem;
        text-align: center;
        margin-bottom: 2.5rem;
        border: 1px solid rgba(255,75,75,0.25);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .stat-number {
        font-size: clamp(2rem, 4vw, 2.8rem);
        font-weight: 900;
        background: linear-gradient(90deg, #FF4B4B, #FF8E53);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.1;
    }
    .stat-label {
        font-size: 0.78rem;
        color: rgba(255,255,255,0.5);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-top: 4px;
        font-weight: 500;
    }

    /* ── Section headings ── */
    .section-heading {
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 800;
        background: linear-gradient(90deg, #FF4B4B, #FF8E53, #FFC837);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.3rem;
        text-align: center;
    }
    .section-sub {
        text-align: center;
        color: #718096;
        font-size: 0.95rem;
        margin-bottom: 1.8rem;
    }

    /* ── Feature cards ── */
    .feat-card {
        padding: 2rem 1.5rem;
        border-radius: 18px;
        text-align: center;
        min-height: 210px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 32px rgba(0,0,0,0.28);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
        margin-bottom: 0.5rem;
        position: relative;
        overflow: hidden;
    }
    .feat-card:hover { transform: translateY(-7px); box-shadow: 0 22px 48px rgba(0,0,0,0.4); }
    .feat-icon  { font-size: 3rem; margin-bottom: 0.9rem; }
    .feat-name  { font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 0.4rem; }
    .feat-desc  { font-size: 0.82rem; color: rgba(255,255,255,0.8); line-height: 1.45; }
    .gc1 { background: linear-gradient(135deg, #667eea, #764ba2); }
    .gc2 { background: linear-gradient(135deg, #f093fb, #f5576c); }
    .gc3 { background: linear-gradient(135deg, #4facfe, #00f2fe); }
    .gc4 { background: linear-gradient(135deg, #43e97b, #38f9d7); }
    .gc5 { background: linear-gradient(135deg, #fa709a, #fee140); }
    .gc6 { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
    .gc7 { background: linear-gradient(135deg, #fccb90, #d57eeb); }
    .gc8 { background: linear-gradient(135deg, #89f7fe, #66a6ff); }
    .gc9 { background: linear-gradient(135deg, #fddb92, #d1fdff); color: #333; }

    /* ── How it works ── */
    .step-wrap {
        background: rgba(30,30,46,0.85);
        border-radius: 18px;
        padding: 2rem 1.5rem;
        text-align: center;
        border: 1px solid rgba(255,75,75,0.18);
        box-shadow: 0 8px 24px rgba(0,0,0,0.22);
        height: 100%;
    }
    .step-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF4B4B, #FF8E53);
        color: white;
        font-size: 1.5rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem auto;
        box-shadow: 0 6px 18px rgba(255,75,75,0.5);
    }
    .step-icon  { font-size: 2.2rem; margin-bottom: 0.5rem; }
    .step-title { font-size: 1.05rem; font-weight: 700; color: #FAFAFA; margin-bottom: 0.4rem; }
    .step-desc  { font-size: 0.85rem; color: #718096; line-height: 1.5; }
    .arrow-connector {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: rgba(255,75,75,0.5);
        padding-top: 3rem;
    }

    /* ── Destinations ── */
    .dest-card {
        background: rgba(30,30,46,0.9);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
        margin-bottom: 1rem;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }
    .dest-card:hover {
        transform: translateY(-5px);
        border-color: rgba(255,75,75,0.45);
        box-shadow: 0 16px 40px rgba(255,75,75,0.2);
    }
    .dest-emoji   { font-size: 2.8rem; margin-bottom: 0.5rem; }
    .dest-name    { font-size: 1.1rem; font-weight: 700; color: #FAFAFA; margin-bottom: 0.2rem; }
    .dest-tagline { font-size: 0.82rem; color: #718096; margin-bottom: 0.8rem; }
    .dest-link    { font-size: 0.85rem; color: #FF8E53; font-weight: 600; }

    /* ── CTA box ── */
    .cta-box {
        background: linear-gradient(135deg, rgba(255,75,75,0.1), rgba(255,140,0,0.07));
        border: 2px dashed rgba(255,75,75,0.4);
        border-radius: 20px;
        padding: 2.5rem;
        text-align: center;
    }

    /* ── Tech badges ── */
    .tech-badge {
        background: rgba(30,30,46,0.9);
        border-radius: 12px;
        padding: 14px 10px;
        text-align: center;
        border: 1px solid #2a2a3e;
        transition: all 0.3s ease;
    }
    .tech-badge:hover {
        border-color: rgba(255,75,75,0.4);
        transform: translateY(-3px);
    }

    /* ── Footer ── */
    .site-footer {
        background: #0a0a0a;
        padding: 3rem 2rem 1.5rem 2rem;
        margin: 3rem -4rem -4rem -4rem;
        border-top: 2px solid #FF4B4B;
    }
    .footer-logo {
        font-size: 1.6rem;
        font-weight: 900;
        background: linear-gradient(90deg,#FF4B4B,#FF8E53);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .footer-tagline { color: #4a5568; font-size: 0.82rem; margin-top: 0.3rem; }
    .footer-links   { color: #718096; font-size: 0.85rem; line-height: 2.2; }
    .footer-links a { color: #FF8E53 !important; text-decoration: none; }
    .footer-credit  { color: #4a5568; font-size: 0.82rem; line-height: 1.8; }
    .footer-divider { border: none; border-top: 1px solid #1a1a1a; margin: 1.5rem 0 1rem 0; }
    .footer-bottom  { text-align: center; color: #333; font-size: 0.78rem; }
    .footer-bottom a { color: #555 !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ─────────────────────────────────────────────────────────────
#  Sidebar branding
# ─────────────────────────────────────────────────────────────
sidebar_branding()

# ═════════════════════════════════════════════════════════════
#  ❶  HERO SECTION
# ═════════════════════════════════════════════════════════════
st.markdown(
    """
    <div class="hero-section animate-fade-in">
        <p class="hero-title">
            YatraSathi
            <span class="hero-plane">✈️</span>
        </p>
        <p class="hero-subtitle">Your AI-Powered Travel Companion</p>
        <p class="hero-tagline">Plan smarter. Travel better. Explore endlessly.</p>
        <a class="cta-btn" href="/AI_Trip_Planner" target="_self">
            🚀&nbsp;&nbsp;Start Planning Your Trip
        </a>
        <div class="hero-badges">
            <span class="hero-badge">⚡ Groq AI (Llama 3.3 70B)</span>
            <span class="hero-badge">🌤️ Live Weather</span>
            <span class="hero-badge">📍 Interactive Maps</span>
            <span class="hero-badge">💰 Budget Planner</span>
            <span class="hero-badge">🇮🇳 India &amp; Beyond</span>
            <span class="hero-badge">📄 PDF Export</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ═════════════════════════════════════════════════════════════
#  ❷  STATISTICS BAR
# ═════════════════════════════════════════════════════════════
st.markdown('<div class="stats-bar">', unsafe_allow_html=True)
sc1, sc2, sc3, sc4 = st.columns(4)
with sc1:
    st.markdown(
        '<div class="stat-number">10,000+</div><div class="stat-label">Itineraries Generated</div>',
        unsafe_allow_html=True,
    )
with sc2:
    st.markdown(
        '<div class="stat-number">500+</div><div class="stat-label">Destinations Covered</div>',
        unsafe_allow_html=True,
    )
with sc3:
    st.markdown(
        '<div class="stat-number">9</div><div class="stat-label">Smart Features</div>',
        unsafe_allow_html=True,
    )
with sc4:
    st.markdown(
        '<div class="stat-number">24/7</div><div class="stat-label">AI Availability</div>',
        unsafe_allow_html=True,
    )
st.markdown('</div>', unsafe_allow_html=True)

# ═════════════════════════════════════════════════════════════
#  ❸  FEATURE CARDS  (3 × 3 grid with coloured gradients)
# ═════════════════════════════════════════════════════════════
st.markdown('<p class="section-heading">🚀 Everything You Need</p>', unsafe_allow_html=True)
st.markdown('<p class="section-sub">9 powerful AI features — all in one place</p>', unsafe_allow_html=True)

FEATURES = [
    ("🤖", "gc1", "AI Trip Planner",   "Day-by-day itinerary crafted by Groq AI in seconds",   "pages/1_🤖_AI_Trip_Planner.py"),
    ("💰", "gc2", "Budget Estimator",  "Full cost breakdown — stay, food, transport & more",     "pages/2_💰_Budget_Estimator.py"),
    ("🏨", "gc3", "Hotels & Stays",    "Curated stay recommendations for every budget tier",     "pages/3_🏨_Hotels_&_Stays.py"),
    ("🍽️","gc4", "Food Guide",         "Local cuisine, must-try dishes & restaurant tips",       "pages/4_🍽️_Food_Guide.py"),
    ("🚗", "gc5", "Travel Options",    "Flights, trains, buses & local transport compared",      "pages/5_🚗_Travel_Options.py"),
    ("🛡️","gc6", "Safety Info",        "Health advisories, scam alerts & emergency contacts",   "pages/6_🛡️_Safety_Info.py"),
    ("📅", "gc7", "Best Time To Visit","Month-by-month weather, festivals & travel tips",        "pages/7_📅_Best_Time_To_Visit.py"),
    ("🌤️","gc8", "Live Weather",       "Real-time conditions & 5-day forecast",                 "pages/8_🌤️_Live_Weather.py"),
    ("📍", "gc9", "Explore Map",       "Interactive map with geo-coded places of interest",      "pages/9_📍_Explore_Map.py"),
]

for row_start in range(0, len(FEATURES), 3):
    row = FEATURES[row_start : row_start + 3]
    cols = st.columns(3, gap="medium")
    for col, (icon, gc, name, desc, page) in zip(cols, row):
        with col:
            st.markdown(
                f"""
                <div class="feat-card {gc}">
                    <div class="feat-icon">{icon}</div>
                    <div class="feat-name">{name}</div>
                    <div class="feat-desc">{desc}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"Open {name}", key=f"fc_{name}", use_container_width=True):
                st.switch_page(page)
    st.write("")

st.divider()

# ═════════════════════════════════════════════════════════════
#  ❹  HOW IT WORKS
# ═════════════════════════════════════════════════════════════
st.markdown('<p class="section-heading">🗺️ How It Works</p>', unsafe_allow_html=True)
st.markdown('<p class="section-sub">Get a personalised trip plan in 3 simple steps</p>', unsafe_allow_html=True)

STEPS = [
    ("1", "📝", "Tell Us Your Preferences",
     "Choose destination, travel style, budget, interests and trip duration."),
    ("2", "🤖", "AI Creates Your Plan",
     "Groq AI (Llama 3.3 70B) generates a complete, personalised day-by-day itinerary."),
    ("3", "🚀", "Explore & Go!",
     "Download as PDF, check live weather, explore the map and travel with confidence."),
]

how_cols = st.columns([5, 1, 5, 1, 5], gap="small")
for i, (num, icon, title, desc) in enumerate(STEPS):
    with how_cols[i * 2]:
        st.markdown(
            f"""
            <div class="step-wrap">
                <div class="step-icon">{icon}</div>
                <div class="step-circle">{num}</div>
                <div class="step-title">{title}</div>
                <div class="step-desc">{desc}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
for ai in [1, 3]:
    with how_cols[ai]:
        st.markdown('<div class="arrow-connector">→</div>', unsafe_allow_html=True)

st.divider()

# ═════════════════════════════════════════════════════════════
#  ❺  POPULAR DESTINATIONS
# ═════════════════════════════════════════════════════════════
st.markdown('<p class="section-heading">🔥 Popular Destinations</p>', unsafe_allow_html=True)
st.markdown('<p class="section-sub">Top picks loved by YatraSathi travellers</p>', unsafe_allow_html=True)

DESTINATIONS = [
    ("🏖️", "Goa",       "Sun, Sand & Seafood"),
    ("🏔️", "Manali",    "Mountains & Adventure"),
    ("🕌", "Jaipur",    "The Pink City"),
    ("🌊", "Kerala",    "God's Own Country"),
    ("🏛️", "Varanasi",  "Spiritual Capital"),
    ("🍵", "Darjeeling","Queen of Hills"),
]

d_col1, d_col2, d_col3 = st.columns(3, gap="medium")
dest_cols_cycle = [d_col1, d_col2, d_col3]
for idx, (emoji, name, tagline) in enumerate(DESTINATIONS):
    with dest_cols_cycle[idx % 3]:
        st.markdown(
            f"""
            <div class="dest-card">
                <div class="dest-emoji">{emoji}</div>
                <div class="dest-name">{name}</div>
                <div class="dest-tagline">{tagline}</div>
                <div class="dest-link">Explore with AI →</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

st.write("")
qb_cols = st.columns(6, gap="small")
for col, (_, dest, _tl) in zip(qb_cols, DESTINATIONS):
    with col:
        if st.button(f"Plan {dest}", key=f"dest_{dest}", use_container_width=True):
            st.session_state["prefill_destination"] = dest
            st.switch_page("pages/1_🤖_AI_Trip_Planner.py")

st.divider()

# ═════════════════════════════════════════════════════════════
#  ❻  CTA — START NOW
# ═════════════════════════════════════════════════════════════
st.markdown(
    """
    <div class="cta-box animate-fade-in">
        <p style="font-size:2.2rem; margin:0 0 0.6rem 0;">👈</p>
        <p style="font-size:1.3rem; font-weight:800; color:#FAFAFA; margin:0 0 0.5rem 0;">
            Pick any feature from the sidebar to begin your journey!
        </p>
        <p style="color:#718096; font-size:0.9rem; margin:0;">
            Every section is powered by live AI · real-time data · and practical travel advice.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)
st.write("")
_, mid, _ = st.columns([1, 2, 1])
with mid:
    if st.button("🚀 Start Planning My Trip", use_container_width=True):
        st.switch_page("pages/1_🤖_AI_Trip_Planner.py")

st.divider()

# ═════════════════════════════════════════════════════════════
#  ❼  TECH STACK
# ═════════════════════════════════════════════════════════════
st.markdown(
    '<p class="section-heading" style="font-size:1.4rem;">⚙️ Built With</p>',
    unsafe_allow_html=True,
)
TECH = [
    ("🐍", "Python 3.11"),
    ("🎈", "Streamlit"),
    ("⚡", "Groq AI"),
    ("🌩️", "OpenWeatherMap"),
    ("🗺️", "Folium + OSM"),
    ("📄", "FPDF2"),
]
t_cols = st.columns(len(TECH), gap="small")
for col, (icon, name) in zip(t_cols, TECH):
    with col:
        st.markdown(
            f"""
            <div class="tech-badge">
                <div style="font-size:1.6rem;">{icon}</div>
                <div style="font-size:0.78rem; color:#a0aec0; margin-top:6px;">{name}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

# ═════════════════════════════════════════════════════════════
#  ❽  FOOTER
# ═════════════════════════════════════════════════════════════
st.markdown(
    """
    <div class="site-footer">
        <div style="display:flex; flex-wrap:wrap; gap:2rem;
                    justify-content:space-between; align-items:flex-start;">

            <div style="min-width:200px; max-width:280px;">
                <div class="footer-logo">✈️ YatraSathi</div>
                <div class="footer-tagline">
                    Plan smarter. Travel better.<br>Explore endlessly.
                </div>
            </div>

            <div class="footer-links">
                <strong style="color:#718096; font-size:0.75rem;
                               text-transform:uppercase; letter-spacing:1px;">
                    Quick Links
                </strong><br>
                <a href="/AI_Trip_Planner"  target="_self">🤖 AI Trip Planner</a><br>
                <a href="/Budget_Estimator" target="_self">💰 Budget Estimator</a><br>
                <a href="/Hotels_&_Stays"   target="_self">🏨 Hotels &amp; Stays</a><br>
                <a href="/Explore_Map"      target="_self">📍 Explore Map</a>
            </div>

            <div class="footer-credit">
                <strong style="color:#FF8E53;">🏆 Cylsys AI/ML Hackathon 2025</strong><br>
                Built with ❤️ by <strong style="color:#e0e0e0;">YatraSathi Team</strong><br><br>
                <span style="color:#4a5568;">Powered by:</span><br>
                ⚡ Groq AI (Llama 3.3 70B)<br>
                🌩️ OpenWeatherMap API<br>
                🗺️ OpenStreetMap + Nominatim
            </div>
        </div>

        <hr class="footer-divider">

        <div class="footer-bottom">
            © 2025 YatraSathi. All rights reserved.
            &nbsp;|&nbsp;
            Powered by
            <a href="https://groq.com" target="_blank">Groq AI</a> ·
            <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a> ·
            <a href="https://streamlit.io/" target="_blank">Streamlit</a> ·
            <a href="https://openstreetmap.org/" target="_blank">OpenStreetMap</a>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

