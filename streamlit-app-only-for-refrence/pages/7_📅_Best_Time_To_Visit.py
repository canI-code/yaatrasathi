"""
YatraSathi ✈️ — Page 7: Best Time To Visit
AI-powered seasonal analysis — weather, crowds, festivals & pricing
"""

import streamlit as st
from utils.gemini_helper import get_gemini_response

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()


# ─────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Best Time To Visit — YatraSathi",
    page_icon="📅",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #001428, #002952, #001428);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.btv-hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(33,150,243,0.15), rgba(0,188,212,0.12));
    border-radius: 20px;
    border: 1px solid rgba(33,150,243,0.28);
    margin-bottom: 2rem;
}
.btv-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #64B5F6, #00E5FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.btv-hero p { color: rgba(255,255,255,0.72); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(33,150,243,0.22);
    border-radius: 16px;
    padding: 1.6rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.result-card {
    background: rgba(0,20,40,0.90);
    border: 1px solid rgba(33,150,243,0.22);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    margin-top: 1.5rem;
    line-height: 1.8;
}
.chip-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0 0.5rem; }
.chip {
    background: rgba(33,150,243,0.15);
    border: 1px solid rgba(33,150,243,0.38);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.82rem;
    color: #90CAF9;
    font-weight: 500;
}
.season-card {
    border-radius: 12px;
    padding: 1rem 1.1rem;
    margin-bottom: 0.75rem;
}
.stDownloadButton > button {
    background: linear-gradient(135deg, #1565C0, #00ACC1) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
}
.stFormSubmitButton > button {
    background: linear-gradient(135deg, #1565C0, #00ACC1) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    width: 100%;
}
hr { border-color: rgba(33,150,243,0.15) !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────────────────────
PRIORITY_OPTIONS = [
    "Overall Best",
    "Best Weather",
    "Least Crowded",
    "Cheapest Prices",
    "Festival Season",
    "Adventure Activities",
]

ACTIVITY_OPTIONS = [
    "Sightseeing",
    "Trekking",
    "Beach",
    "Snow Activities",
    "Water Sports",
    "Wildlife Safari",
    "Photography",
    "Camping",
    "Paragliding",
    "Rafting",
    "Skiing",
    "Desert Safari",
]

INDIA_SEASONS = [
    {
        "emoji": "☀️",
        "season": "Summer",
        "months": "March – June",
        "best_for": "Hill stations — Shimla, Manali, Darjeeling, Coorg",
        "avoid": "Plains, Rajasthan deserts, coastal cities",
        "color": "#FF8C00",
    },
    {
        "emoji": "🌧️",
        "season": "Monsoon",
        "months": "July – September",
        "best_for": "Kerala backwaters, Coorg, Meghalaya, Goa (green & lush)",
        "avoid": "Himalayan treks, Rajasthan roads, Andaman",
        "color": "#1E90FF",
    },
    {
        "emoji": "🍂",
        "season": "Autumn / Post-Monsoon",
        "months": "October – November",
        "best_for": "Rajasthan, Goa, Himalayan treks, wildlife safaris",
        "avoid": "North-East India (lingering floods)",
        "color": "#FFA500",
    },
    {
        "emoji": "❄️",
        "season": "Winter",
        "months": "December – February",
        "best_for": "Goa, Kerala, Tamil Nadu, Rajasthan, Delhi sightseeing",
        "avoid": "Kashmir passes (heavy snowfall), high-altitude routes",
        "color": "#00CED1",
    },
]

# ─────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="btv-hero">
    <h1>📅 Best Time to Visit</h1>
    <p>AI analyzes weather, festivals, crowds, and costs to find your perfect travel window</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  PROMPT BUILDER
# ─────────────────────────────────────────────────────────────
def build_btv_prompt(destination, priority, activities):
    acts_str = ", ".join(activities) if activities else "General sightseeing"
    return f"""You are an expert travel timing analyst with deep knowledge of seasonal patterns, festivals, weather, and crowd cycles for destinations across India and internationally.

Destination: {destination}
Visitor's Priority: {priority}
Planned Activities: {acts_str}

Provide a COMPREHENSIVE best-time-to-visit analysis. Use real seasonal data — temperatures, rainfall, crowd levels, and pricing that are accurate for {destination}.

## 📅 BEST TIME TO VISIT {destination}

---

### 🏆 QUICK ANSWER

**✅ Best Months:** [list the top 2-4 months]
**⚠️ Months to Avoid:** [list 1-3 months with one-line reason each]
**🎯 If you have ONE day to plan:** [single best month + one-line reason]

---

### 📊 MONTH-BY-MONTH ANALYSIS

Fill this table for ALL 12 months with data specific to {destination}:

| Month | Temp (°C) | Weather | Crowd Level | Price Level | Overall ⭐ | Best For |
|-------|-----------|---------|-------------|-------------|-----------|----------|
| January | | ☀️/🌧️/❄️/⛅ | Low/Med/High/Peak | ₹/₹₹/₹₹₹ | ⭐⭐⭐⭐⭐ | |
| February | | | | | | |
| March | | | | | | |
| April | | | | | | |
| May | | | | | | |
| June | | | | | | |
| July | | | | | | |
| August | | | | | | |
| September | | | | | | |
| October | | | | | | |
| November | | | | | | |
| December | | | | | | |

(Crowd: Low / Moderate / High / Peak — Price: ₹ Budget / ₹₹ Moderate / ₹₹₹ Expensive)

---

### 🌤️ SEASONAL BREAKDOWN

For EACH season applicable to {destination}, provide:

#### [Season Emoji] [Season Name] ([Month Range])
- **🌡️ Weather:** [temperature range, rainfall details, conditions]
- **😊 Crowd Level:** Low / Moderate / High / Peak
- **💰 Price Impact:** [how prices change from baseline — % cheaper or more expensive]
- **✅ Good For:** [activities and types of travellers who should visit this season]
- **❌ Not Ideal For:** [what doesn't work this season]
- **🏆 Verdict:** 🟢 GO | 🟡 OKAY | 🔴 AVOID + one-line reason

(Cover all relevant seasons: Winter, Spring, Summer, Monsoon, Autumn — skip irrelevant ones)

---

### 🎉 FESTIVALS & EVENTS CALENDAR

List major festivals, events, and cultural celebrations at {destination} throughout the year:

| Month | Festival / Event | Type | Why Visit For This |
|-------|-----------------|------|-------------------|
(List 10-15 real festivals/events at {destination} — be specific, not generic)

Also note:
- **Peak Festival Period:** [busiest/most expensive festival time]
- **Hidden Gem Festival:** [a less-known but worthwhile local event]

---

### 🎯 BEST TIMING FOR YOUR PLANNED ACTIVITIES

For EACH activity in ({acts_str}), give specific timing:

**[Activity Name]**
- ✅ Best months: [specific months]
- 🌡️ Reason: [why these months are ideal for this activity at {destination}]
- ⚠️ Avoid: [which months don't work for this activity and why]

---

### ⚠️ TIMES TO AVOID & WHY

List specific periods to avoid with clear reasons:
- **[Month/Period]:** [reason — e.g., cyclone season, extreme heat, flooding, road closures]
- Include natural disaster seasons, extreme weather windows, and any local events causing chaos

---

### 💡 PRO TIMING TIPS FOR {destination}

Give 5 specific, insider tips about timing your visit to {destination}:
1. 
2. 
3. 
4. 
5. 

---

### 🏆 FINAL RECOMMENDATION

Based on priority ({priority}) and planned activities ({acts_str}):

**Our top pick:** [Specific month(s)]
**Why:** [3-4 lines of reasoning covering weather, crowds, cost, and activity suitability]
**Book:** [How far in advance to book for this window — flights, hotels, special permits if any]

ACCURACY RULES:
- Use real temperature ranges for {destination} — not generic estimates
- Monsoon months must reflect {destination}'s actual monsoon pattern (not a one-size-fits-all June-Sep)
- International destinations: use local season names (e.g., Southern Hemisphere has reversed seasons)
- Festival dates must be real and specific to {destination}
- If {destination} is best known for a specific season (e.g., Tulip Garden Srinagar in April, Rann of Kutch festival in winter), highlight it prominently
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("btv_result", "btv_params"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  INPUT FORM
# ─────────────────────────────────────────────────────────────
st.markdown('<div class="filter-card">', unsafe_allow_html=True)

with st.form("btv_form"):

    col1, col2 = st.columns(2)
    with col1:
        destination = st.text_input(
            "🌍 Destination",
            placeholder="e.g. Goa, Manali, Rajasthan, Bali, Iceland…",
            help="Enter any city, region or country",
        )
    with col2:
        priority = st.selectbox(
            "🎯 What Matters Most to You?",
            options=PRIORITY_OPTIONS,
            index=0,
            help="The AI will optimise its recommendation around this priority",
        )

    activities = st.multiselect(
        "🏃 Activities Planned",
        options=ACTIVITY_OPTIONS,
        default=["Sightseeing", "Photography"],
        help="Select all activities you plan to do — the AI will give timing for each",
    )

    submitted = st.form_submit_button("📅 Find Best Time", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  FORM PROCESSING
# ─────────────────────────────────────────────────────────────
if submitted:
    if not destination.strip():
        st.error("⚠️ Please enter a destination.")
    else:
        st.session_state["btv_params"] = {
            "destination": destination.strip(),
            "priority":    priority,
            "activities":  activities,
        }

        prompt = build_btv_prompt(destination.strip(), priority, activities)

        with st.spinner("📅 Analysing seasons, festivals and crowd patterns… this may take 15–20 seconds"):
            result = get_gemini_response(prompt, temperature=0.45)

        if result:
            st.session_state["btv_result"] = result
        else:
            st.error("❌ Could not generate the analysis. Please try again.")

# ─────────────────────────────────────────────────────────────
#  RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state.get("btv_result"):
    result = st.session_state["btv_result"]
    p      = st.session_state.get("btv_params", {})
    dst    = p.get("destination", "your destination")
    pri    = p.get("priority", "")
    acts   = p.get("activities", [])

    st.markdown("---")

    st.markdown(f"""
    <div class="chip-row">
        <span class="chip">📍 {dst}</span>
        <span class="chip">🎯 {pri}</span>
        <span class="chip">📅 Seasonal Analysis</span>
        {"".join(f'<span class="chip">🏃 {a}</span>' for a in acts[:4])}
    </div>
    """, unsafe_allow_html=True)

    # Rating legend
    st.markdown("""
    <div style="background:rgba(255,255,255,0.04);border-radius:10px;
                padding:0.6rem 1.2rem;margin:0.5rem 0 1rem;
                display:flex;gap:1.5rem;flex-wrap:wrap;font-size:0.85rem;">
        <span>🟢 <span style="color:rgba(255,255,255,0.65)">Go</span></span>
        <span>🟡 <span style="color:rgba(255,255,255,0.65)">Okay</span></span>
        <span>🔴 <span style="color:rgba(255,255,255,0.65)">Avoid</span></span>
        <span>☀️ Sunny &nbsp;|&nbsp; 🌧️ Rain &nbsp;|&nbsp; ❄️ Snow &nbsp;|&nbsp; ⛅ Mixed</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="result-card">', unsafe_allow_html=True)
    st.markdown(result)
    st.markdown('</div>', unsafe_allow_html=True)

    # ── Actions ──────────────────────────────────────────────
    st.markdown("---")
    col_dl, col_re, _ = st.columns([1, 1, 2])

    with col_dl:
        st.download_button(
            label="⬇️ Download Analysis",
            data=result,
            file_name=f"best_time_{dst.replace(' ', '_').lower()}.txt",
            mime="text/plain",
            use_container_width=True,
        )
    with col_re:
        if st.button("🔄 Regenerate", key="regen_btv", use_container_width=True):
            st.session_state["btv_result"] = None
            st.rerun()

    st.markdown("---")
    st.info(
        "💡 **Ready to plan?** Use **🤖 AI Trip Planner** to build a full itinerary "
        "for your chosen travel window, or **🏨 Hotels & Stays** to check seasonal pricing "
        "and availability for those dates.",
        icon="📅",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")

    # Indian seasons overview
    st.markdown("### 🗓️ Indian Travel Seasons at a Glance")
    cols_s = st.columns(2, gap="medium")
    for i, s in enumerate(INDIA_SEASONS):
        with cols_s[i % 2]:
            st.markdown(f"""
            <div style="background:rgba(255,255,255,0.04);
                        border-left:3px solid {s['color']};
                        border-radius:12px;padding:1rem 1.2rem;
                        margin-bottom:0.9rem;">
                <div style="font-size:1.1rem;font-weight:700;color:#fff;
                            margin-bottom:0.4rem">
                    {s['emoji']} {s['season']} — <span style="color:{s['color']}">{s['months']}</span>
                </div>
                <div style="color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.25rem">
                    ✅ <b>Best for:</b> {s['best_for']}
                </div>
                <div style="color:rgba(255,255,255,0.45);font-size:0.82rem">
                    ⚠️ <b>Avoid:</b> {s['avoid']}
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # What the analysis covers
    st.markdown("### 📊 What This Analysis Covers")
    features = [
        ("🏆", "Quick Answer",              "Best months, avoid months, single best pick — at a glance"),
        ("📊", "Month-by-Month Table",       "All 12 months: temp, weather, crowds, price level, rating"),
        ("🌤️", "Seasonal Breakdown",        "Each season rated 🟢/🟡/🔴 with weather, crowd & cost data"),
        ("🎉", "Festivals & Events",         "10–15 real local festivals with why to visit for each"),
        ("🏃", "Activity-Wise Timing",       "Exact best months for YOUR chosen activities"),
        ("⚠️", "Times to Avoid",             "Monsoon, cyclones, extreme heat, road closures flagged"),
        ("💡", "Pro Timing Tips",            "5 insider tips for timing your visit perfectly"),
        ("🏆", "Final Recommendation",       "Single best window based on your priority + activities"),
    ]
    cols_f = st.columns(3)
    for i, (icon, title, desc) in enumerate(features):
        with cols_f[i % 3]:
            st.markdown(f"""
            <div style="background:rgba(255,255,255,0.04);
                        border:1px solid rgba(33,150,243,0.18);
                        border-radius:12px;padding:1rem;
                        margin-bottom:0.75rem;text-align:center;">
                <div style="font-size:1.6rem;margin-bottom:0.3rem">{icon}</div>
                <div style="color:#90CAF9;font-weight:600;
                            margin-bottom:0.2rem;font-size:0.9rem">{title}</div>
                <div style="color:rgba(255,255,255,0.5);
                            font-size:0.78rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;color:rgba(255,255,255,0.42);
                font-size:0.9rem;padding:1rem 0;">
        📅 Enter your destination above and click <strong>Find Best Time</strong>
        for a full AI-powered seasonal analysis
    </div>
    """, unsafe_allow_html=True)
