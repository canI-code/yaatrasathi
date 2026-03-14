"""
YatraSathi ✈️ — Page 5: Travel Options
Compare flights, trains, buses & road trips + local transport within city
"""

import streamlit as st
from utils.gemini_helper import get_gemini_response
from utils.constants import TRAVEL_STYLES

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()


# ─────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Travel Options — YatraSathi",
    page_icon="🚗",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #001a0a, #003320, #001a0a);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.travel-hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(0,230,118,0.12), rgba(0,176,255,0.10));
    border-radius: 20px;
    border: 1px solid rgba(0,230,118,0.25);
    margin-bottom: 2rem;
}
.travel-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #00E676, #00B0FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.travel-hero p { color: rgba(255,255,255,0.72); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(0,230,118,0.2);
    border-radius: 16px;
    padding: 1.6rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.result-card {
    background: rgba(0,26,10,0.88);
    border: 1px solid rgba(0,230,118,0.22);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    margin-top: 1.5rem;
    line-height: 1.8;
}
.chip-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0 0.5rem; }
.chip {
    background: rgba(0,230,118,0.12);
    border: 1px solid rgba(0,230,118,0.32);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.82rem;
    color: #69F0AE;
    font-weight: 500;
}
.mode-card {
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    text-align: center;
}
.stDownloadButton > button {
    background: linear-gradient(135deg, #00E676, #00B0FF) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
}
.stFormSubmitButton > button {
    background: linear-gradient(135deg, #00E676, #00B0FF) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    width: 100%;
}
hr { border-color: rgba(0,230,118,0.15) !important; }
/* Tab styling */
[data-testid="stTabs"] button {
    font-size: 1rem !important;
    font-weight: 600 !important;
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="travel-hero">
    <h1>🚗 Travel Options Comparator</h1>
    <p>Compare flights, trains, buses, and road routes — find your best way to travel</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  PROMPT BUILDERS
# ─────────────────────────────────────────────────────────────
def build_intercity_prompt(source, destination, num_travelers, preference):
    return f"""You are an Indian travel logistics expert with up-to-date knowledge of transport options.

Find ALL available travel options from {source} to {destination} for {num_travelers} traveler(s).
User's preference: {preference}

⚠️ ACCURACY RULES:
- Use ONLY real train names and numbers that actually run on this route
- Use ONLY real airlines that operate this route
- State clearly if any mode is NOT available (e.g., "No direct flights available")
- All costs should be realistic 2026 estimates
- For road distance/route, use real highways (NH numbers)

Provide output in EXACTLY this format:

## 🛫 TRAVEL OPTIONS: {source} → {destination}

---

### ✈️ BY FLIGHT
(If no direct flights, say so clearly and mention nearest airport alternatives)

| Airline | Flight No. (Example) | Route | Duration | Economy Cost (₹) | Frequency |
|---------|----------------------|-------|----------|-----------------|-----------|
(List 3-5 airlines if flights available on this route)

- 🏆 **Best Pick:** [specific flight recommendation]
- 💡 **Booking Tip:** [e.g., book 45+ days ahead, use incognito mode, best day to book]
- 📱 **Book On:** MakeMyTrip / Goibibo / airline website / Skyscanner
- ⏰ **Best Time to Fly:** [preferred time window and why]

---

### 🚂 BY TRAIN
(If no direct trains, mention connecting options)

| Train Name | Train No. | Departure | Arrival | Duration | Sleeper (₹) | 3A (₹) | 2A (₹) |
|------------|-----------|-----------|---------|----------|-------------|--------|--------|
(List 3-5 popular trains on this route)

- 🏆 **Best Pick:** [specific train recommendation with class]
- 💡 **Booking Tip:** [IRCTC Tatkal, booking window, waitlist strategy]
- 📱 **Book On:** IRCTC / RailYatri / ixigo
- ⚡ **Premium Option:** [Vande Bharat / Shatabdi / Rajdhani if available]

---

### 🚌 BY BUS
| Operator | Bus Type | Duration | Cost (₹) | Amenities |
|----------|----------|----------|----------|-----------|
(List 3-5 govt and private operators)

- 🏆 **Best Pick:** [recommendation]
- 📱 **Book On:** redBus / AbhiBus / state transport website
- 💡 **Tip:** [overnight bus tip, seat selection advice]

---

### 🚗 BY ROAD (Self-Drive / Cab)
- 📏 **Total Distance:** X km
- ⏱️ **Drive Duration:** X hours (without stops)
- 🛣️ **Route:** {source} → [major cities/towns en route] → {destination}
- 🛤️ **Highways:** [NH numbers and names]
- ⛽ **Fuel Cost (Petrol car):** ₹X,XXX approx (based on ~₹100/L, ~15 km/L)
- 🚧 **Toll Charges:** ₹X,XXX approx (one way)
- 🚖 **One-Way Cab Fare:** ₹X,XXX – ₹X,XXX (depends on cab type)
- 🛑 **Recommended Stops:**
  1. [Place name, km from {source}] — [what to do/eat there]
  2. [Place name, km from {source}] — [what to do/eat there]
  3. [Place name, km from {source}] — [what to do/eat there]
- ℹ️ **Road Condition Notes:** [highway quality, seasonal issues, mountain pass warnings if any]

---

### 📊 COMPARISON SUMMARY

| Mode | Total Cost/Person (₹) | Travel Time | Comfort | Availability | Our Score |
|------|-----------------------|-------------|---------|--------------|-----------|
| ✈️ Flight | | | ⭐⭐⭐⭐⭐ | | /10 |
| 🚂 Train (AC) | | | ⭐⭐⭐⭐ | | /10 |
| 🚌 Bus | | | ⭐⭐⭐ | | /10 |
| 🚗 Road/Cab | | | ⭐⭐⭐⭐ | | /10 |

---

### 🏆 OUR RECOMMENDATION
Based on preference ({preference}) and {num_travelers} traveler(s):
Give a clear, specific recommendation with 3-4 lines of reasoning. Mention which exact train/flight/bus to take, which class, and how to book it.
"""


def build_local_transport_prompt(destination, travel_style):
    return f"""You are a local transport expert for travelers visiting {destination}.

What LOCAL transport options are actually available WITHIN {destination} for a {travel_style} traveler?

⚠️ CRITICAL ACCURACY RULES:
- NEVER assume Ola/Uber/Rapido are available everywhere — they are BANNED in some states/cities (e.g., Goa bans app-based cab aggregators; only local taxis and GoaMiles app work there)
- Only list metro lines that ACTUALLY EXIST and are operational in {destination}
- Only mention local/suburban trains if they genuinely serve {destination} (Mumbai Local, Chennai Suburban/MRTS, Kolkata Suburban, etc.)
- Mention ferries and water transport only if relevant (Goa river ferries, Kerala backwaters, Mumbai ferry, Andaman, etc.)
- Be specific about apps and platforms that actually work in {destination}

## 🚕 LOCAL TRANSPORT IN {destination}

### 🗺️ AVAILABLE OPTIONS

For EACH transport mode, fill this table:

| Mode | Available in {destination}? | Avg Cost | Best For | How to Access |
|------|-----------------------------|----------|----------|---------------|
| 🚇 Metro / Rapid Transit | ✅/❌ | | | |
| 🚂 Suburban/Local Train | ✅/❌ | | | |
| 🚌 City Bus (Govt) | ✅/❌ | | | |
| 🛺 Auto Rickshaw | ✅/❌ | | | |
| 🚗 Local Taxi (metered/fixed) | ✅/❌ | | | |
| 📱 Ola / Uber / Rapido | ✅/❌/🚫 (banned) | | | |
| 🚢 Ferry / Water Transport | ✅/❌ | | | |
| 🛵 Bike / Scooty Rental | ✅/❌ | | | |
| 🚗 Car Rental (self-drive) | ✅/❌ | | | |
| 🚲 Cycle Rental | ✅/❌ | | | |
| 🚶 Walking / Walking Tours | ✅/❌ | | | |

---

### 📋 DETAILED BREAKDOWN

For each mode that IS available (✅), give a dedicated section:

#### [Mode Name]
- 💰 **Cost:** [per km rate / flat rate / daily rental / per trip]
- 🗺️ **Coverage:** [which areas of {destination} it covers]
- ⏰ **Operating Hours:** [timing]
- 📱 **How to Access:** [specific app name, stand location, booking method]
- 💡 **Tip for {travel_style}:** [one practical tip]
- ⭐ **Safety Rating:** [X/5 with brief reason]

---

### 💡 LOCAL TRANSPORT TIPS FOR {destination}
Give 5 specific, honest tips for getting around {destination}, including:
- The most cost-effective way for {travel_style} travelers
- Common scams or overcharging to watch out for
- Negotiation advice (where applicable)
- Rush hour / traffic advice
- Any transport app or card (e.g., metro smart card, city pass) worth getting

---

### 📱 USEFUL TRANSPORT APPS IN {destination}
List apps that ACTUALLY WORK in {destination} for transport:
| App | Purpose | Available Here? |
|-----|---------|----------------|
(Only list apps that genuinely operate in {destination} — e.g., GoaMiles for Goa, DMRC app for Delhi, TS Metro for Hyderabad, Rapido only where available)

---

### 🏆 BEST TRANSPORT COMBO FOR {travel_style}
Recommend the ideal combination of 2-3 transport modes for a {travel_style} traveler in {destination}, with estimated daily transport budget.
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("intercity_result", "local_result",
           "intercity_params", "local_params"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  TABS
# ─────────────────────────────────────────────────────────────
tab1, tab2 = st.tabs(["🛫 How to Reach  (Inter-city)", "🚕 Local Transport  (Within City)"])

# ═════════════════════════════════════════════════════════════
#  TAB 1 — INTER-CITY TRAVEL
# ═════════════════════════════════════════════════════════════
with tab1:
    st.markdown("#### Find and compare every way to get from A to B")

    PREFERENCE_OPTIONS = [
        "Cheapest",
        "Fastest",
        "Most Comfortable",
        "Show All Options",
    ]

    st.markdown('<div class="filter-card">', unsafe_allow_html=True)
    with st.form("intercity_form"):

        col1, col2 = st.columns(2)
        with col1:
            source = st.text_input(
                "🏠 From",
                placeholder="e.g. Mumbai, Delhi, Bengaluru…",
            )
        with col2:
            destination_ic = st.text_input(
                "📍 To",
                placeholder="e.g. Goa, Jaipur, Manali…",
            )

        col3, col4 = st.columns(2)
        with col3:
            num_travelers = st.number_input(
                "👥 Number of Travelers",
                min_value=1, max_value=20, value=2, step=1,
            )
        with col4:
            preference = st.selectbox(
                "🎯 Preference",
                options=PREFERENCE_OPTIONS,
                index=3,
            )

        ic_submitted = st.form_submit_button(
            "🔍 Find Travel Options", use_container_width=True
        )
    st.markdown('</div>', unsafe_allow_html=True)

    # ── Process inter-city form ───────────────────────────────
    if ic_submitted:
        if not source.strip() or not destination_ic.strip():
            st.error("⚠️ Please enter both source and destination cities.")
        elif source.strip().lower() == destination_ic.strip().lower():
            st.error("⚠️ Source and destination cannot be the same city.")
        else:
            st.session_state["intercity_params"] = {
                "source":      source.strip(),
                "destination": destination_ic.strip(),
                "travelers":   num_travelers,
                "preference":  preference,
            }
            prompt = build_intercity_prompt(
                source.strip(), destination_ic.strip(),
                num_travelers, preference,
            )
            with st.spinner("🔍 Comparing all travel modes… this may take 15–20 seconds"):
                result = get_gemini_response(prompt, temperature=0.4)

            if result:
                st.session_state["intercity_result"] = result
            else:
                st.error("❌ Could not fetch travel options. Please try again.")

    # ── Display inter-city results ────────────────────────────
    if st.session_state.get("intercity_result"):
        result = st.session_state["intercity_result"]
        p      = st.session_state.get("intercity_params", {})

        st.markdown("---")
        st.markdown(f"""
        <div class="chip-row">
            <span class="chip">🏠 {p.get('source','')}</span>
            <span class="chip">➡️ {p.get('destination','')}</span>
            <span class="chip">👥 {p.get('travelers','')} traveler(s)</span>
            <span class="chip">🎯 {p.get('preference','')}</span>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="result-card">', unsafe_allow_html=True)
        st.markdown(result)
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("---")
        col_dl, col_re, _ = st.columns([1, 1, 2])
        with col_dl:
            fname = f"travel_{p.get('source','').replace(' ','_').lower()}_to_{p.get('destination','').replace(' ','_').lower()}.txt"
            st.download_button(
                label="⬇️ Download Comparison",
                data=result,
                file_name=fname,
                mime="text/plain",
                use_container_width=True,
            )
        with col_re:
            if st.button("🔄 Regenerate", key="regen_ic", use_container_width=True):
                st.session_state["intercity_result"] = None
                st.rerun()

        st.info(
            "💡 Once you've chosen your travel mode, use **🤖 AI Trip Planner** "
            "to build a full itinerary, or **🏨 Hotels & Stays** to book accommodation.",
            icon="🚗",
        )

    else:
        # Empty state for tab 1
        st.markdown("---")
        st.markdown("### 🛤️ Modes We Compare")
        modes = [
            ("✈️", "Flight",          "Fastest. Ideal for long distances over 600 km.", "#00B0FF"),
            ("🚂", "Train",           "Comfortable & scenic. Best value for 200–1200 km.", "#00E676"),
            ("🚌", "Bus",             "Budget-friendly. Overnight options save hotel costs.", "#FFC107"),
            ("🚗", "Road / Self-Drive","Flexible. Great for groups and scenic routes.", "#FF7043"),
        ]
        cols = st.columns(4, gap="small")
        for i, (icon, name, desc, color) in enumerate(modes):
            with cols[i]:
                st.markdown(f"""
                <div style="background:rgba(255,255,255,0.04);
                            border-left:3px solid {color};
                            border-radius:10px;padding:1rem;
                            margin-bottom:0.6rem;text-align:center;">
                    <div style="font-size:2rem">{icon}</div>
                    <div style="color:{color};font-weight:700;
                                margin:0.3rem 0">{name}</div>
                    <div style="color:rgba(255,255,255,0.55);
                                font-size:0.8rem">{desc}</div>
                </div>
                """, unsafe_allow_html=True)

# ═════════════════════════════════════════════════════════════
#  TAB 2 — LOCAL TRANSPORT
# ═════════════════════════════════════════════════════════════
with tab2:
    st.markdown("#### Discover exactly how to get around once you arrive")
    st.caption(
        "⚠️ Transport rules vary massively by city — "
        "e.g., Ola/Uber are **banned in Goa**, Mumbai has **local trains**, "
        "Delhi has a **full Metro network**. We give you city-accurate info."
    )

    st.markdown('<div class="filter-card">', unsafe_allow_html=True)
    with st.form("local_form"):

        col_a, col_b = st.columns(2)
        with col_a:
            destination_local = st.text_input(
                "📍 Destination City",
                placeholder="e.g. Goa, Mumbai, Jaipur, Kolkata…",
            )
        with col_b:
            local_style = st.selectbox(
                "🧳 Your Travel Style",
                options=TRAVEL_STYLES,
                index=0,
            )

        local_submitted = st.form_submit_button(
            "🔍 Find Local Transport", use_container_width=True
        )
    st.markdown('</div>', unsafe_allow_html=True)

    # ── Process local form ────────────────────────────────────
    if local_submitted:
        if not destination_local.strip():
            st.error("⚠️ Please enter a destination city.")
        else:
            st.session_state["local_params"] = {
                "destination": destination_local.strip(),
                "style":       local_style,
            }
            prompt = build_local_transport_prompt(
                destination_local.strip(), local_style
            )
            with st.spinner("🚕 Researching local transport options… this may take 15–20 seconds"):
                result = get_gemini_response(prompt, temperature=0.35)

            if result:
                st.session_state["local_result"] = result
            else:
                st.error("❌ Could not fetch local transport info. Please try again.")

    # ── Display local results ─────────────────────────────────
    if st.session_state.get("local_result"):
        result = st.session_state["local_result"]
        p      = st.session_state.get("local_params", {})

        st.markdown("---")
        st.markdown(f"""
        <div class="chip-row">
            <span class="chip">📍 {p.get('destination','')}</span>
            <span class="chip">🧳 {p.get('style','')}</span>
            <span class="chip">🚕 Local Transport Guide</span>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="result-card">', unsafe_allow_html=True)
        st.markdown(result)
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("---")
        col_dl2, col_re2, _ = st.columns([1, 1, 2])
        with col_dl2:
            fname2 = f"local_transport_{p.get('destination','').replace(' ','_').lower()}.txt"
            st.download_button(
                label="⬇️ Download Guide",
                data=result,
                file_name=fname2,
                mime="text/plain",
                use_container_width=True,
            )
        with col_re2:
            if st.button("🔄 Regenerate", key="regen_local", use_container_width=True):
                st.session_state["local_result"] = None
                st.rerun()

        st.info(
            "💡 Now that you know how to get around, use **🍽️ Food Guide** to "
            "discover where to eat, or **🗺️ Explore Map** to plan your routes visually.",
            icon="🚕",
        )

    else:
        # Empty state for tab 2
        st.markdown("---")
        st.markdown("### 🚦 Transport Modes We Check For Your City")
        local_modes = [
            ("🚇", "Metro / Rapid Transit",    "Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kochi, Kolkata, Jaipur…"),
            ("🚂", "Suburban / Local Train",   "Mumbai Local, Chennai Suburban/MRTS, Kolkata Suburban Railway"),
            ("🚌", "City Bus (Govt)",           "DTC Delhi, BEST Mumbai, KSRTC, GSRTC, TSRTC and more"),
            ("🛺", "Auto Rickshaw",             "Metered vs negotiated — we tell you which applies"),
            ("🚗", "Local Taxi",               "Stand-based or app-based, wherever legal"),
            ("📱", "Ola / Uber / Rapido",       "Confirmed available OR flagged as banned (e.g., Goa)"),
            ("🚢", "Ferry / Water Transport",   "Goa ferries, Kerala backwaters, Mumbai ferry, Andaman boats"),
            ("🛵", "Bike / Scooty Rental",      "Daily rental rates and recommended platforms"),
            ("🚗", "Self-Drive Car Rental",     "Apps like Zoomcar, Revv — where they operate"),
            ("🚲", "Cycle Rental",              "Available in tourist-friendly cities"),
        ]
        cols2 = st.columns(2)
        for i, (icon, name, desc) in enumerate(local_modes):
            with cols2[i % 2]:
                st.markdown(f"""
                <div style="background:rgba(255,255,255,0.04);
                            border:1px solid rgba(0,230,118,0.15);
                            border-radius:10px;padding:0.8rem 1rem;
                            margin-bottom:0.65rem;display:flex;
                            align-items:flex-start;gap:0.8rem;">
                    <span style="font-size:1.5rem;min-width:1.8rem">{icon}</span>
                    <div>
                        <div style="color:#69F0AE;font-weight:600;
                                    font-size:0.92rem">{name}</div>
                        <div style="color:rgba(255,255,255,0.5);
                                    font-size:0.78rem;margin-top:0.15rem">{desc}</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("""
        <div style="text-align:center;color:rgba(255,255,255,0.42);
                    font-size:0.9rem;padding:1rem 0;">
            🚕 Enter your destination above and click
            <strong>Find Local Transport</strong> for city-accurate transport info
        </div>
        """, unsafe_allow_html=True)
