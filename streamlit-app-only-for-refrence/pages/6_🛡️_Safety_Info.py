"""
YatraSathi ✈️ — Page 6: Safety Info
AI-powered destination safety guide with emergency contacts & scam alerts
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
    page_title="Safety Info — YatraSathi",
    page_icon="🛡️",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #0a001a, #1a0030, #0a001a);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.safety-hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(156,39,176,0.15), rgba(244,67,54,0.12));
    border-radius: 20px;
    border: 1px solid rgba(156,39,176,0.28);
    margin-bottom: 1.5rem;
}
.safety-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #CE93D8, #EF5350);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.safety-hero p { color: rgba(255,255,255,0.72); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(156,39,176,0.22);
    border-radius: 16px;
    padding: 1.6rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.result-card {
    background: rgba(10,0,26,0.90);
    border: 1px solid rgba(156,39,176,0.25);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    margin-top: 1.5rem;
    line-height: 1.8;
}
.chip-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0 0.5rem; }
.chip {
    background: rgba(156,39,176,0.15);
    border: 1px solid rgba(156,39,176,0.38);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.82rem;
    color: #CE93D8;
    font-weight: 500;
}
.emergency-table {
    background: rgba(244,67,54,0.08);
    border: 1px solid rgba(244,67,54,0.25);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
}
.checklist-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(156,39,176,0.18);
    border-radius: 10px;
    padding: 0.8rem 1rem;
    margin-bottom: 0.65rem;
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
}
.stDownloadButton > button {
    background: linear-gradient(135deg, #9C27B0, #EF5350) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
}
.stFormSubmitButton > button {
    background: linear-gradient(135deg, #9C27B0, #EF5350) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    width: 100%;
}
hr { border-color: rgba(156,39,176,0.18) !important; }
[data-testid="stExpander"] {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(156,39,176,0.2) !important;
    border-radius: 12px !important;
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────────────────────
TRAVELER_TYPES = [
    "Solo Male",
    "Solo Female",
    "Couple",
    "Family with Kids",
    "Senior Citizens",
    "Group of Friends",
    "LGBTQ+ Traveler",
    "Foreign Tourist",
]

CONCERN_OPTIONS = [
    "General Safety",
    "Women's Safety",
    "Night Safety",
    "Theft / Scams",
    "Natural Disasters",
    "Health / Medical",
    "Road Safety",
    "Political Stability",
    "Wildlife Dangers",
    "Water / Swimming Safety",
    "Cyber Safety / Public WiFi",
]

INDIA_EMERGENCY_NUMBERS = [
    ("🚔", "Police",                       "100"),
    ("🚑", "Ambulance",                    "108"),
    ("🚒", "Fire Brigade",                 "101"),
    ("🆘", "National Emergency",           "112"),
    ("👩", "Women's Helpline",             "1091"),
    ("👶", "Child Helpline",               "1098"),
    ("🧠", "Mental Health (iCall)",        "9152987821"),
    ("🏨", "Tourist Helpline",             "1800-11-1363"),
    ("🏦", "Cyber Crime",                  "1930"),
    ("🚨", "Anti-Poison Helpline",         "1800-116-117"),
    ("✈️", "Airport Security",             "011-24673900"),
    ("🌍", "Ministry of External Affairs", "1800-118-797"),
]

# ─────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="safety-hero">
    <h1>🛡️ Destination Safety Guide</h1>
    <p>Travel informed — know the safety profile of your destination before you go</p>
</div>
""", unsafe_allow_html=True)

st.info(
    "ℹ️ **Disclaimer:** Safety information is AI-generated based on general knowledge "
    "and may not reflect very recent events. Always verify with the latest **Government "
    "of India travel advisories** (mea.gov.in) or your country's foreign ministry before travel.",
    icon="ℹ️",
)

# ─────────────────────────────────────────────────────────────
#  UNIVERSAL EMERGENCY NUMBERS EXPANDER (always visible)
# ─────────────────────────────────────────────────────────────
with st.expander("📞 Universal Emergency Numbers in India — Always Accessible", expanded=False):
    st.markdown("### 🚨 All-India Emergency Contacts")
    st.markdown(
        "These numbers work across **all states and union territories** of India. "
        "Save them on your phone before you travel."
    )
    cols_em = st.columns(2)
    for i, (icon, service, number) in enumerate(INDIA_EMERGENCY_NUMBERS):
        with cols_em[i % 2]:
            st.markdown(f"""
            <div class="emergency-table" style="margin-bottom:0.5rem;">
                <span style="font-size:1.2rem">{icon}</span>
                <span style="color:#EF9A9A;font-weight:600;margin:0 0.5rem">{service}</span>
                <span style="color:#fff;font-size:1.1rem;font-weight:700">📞 {number}</span>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    **💡 Quick Tips:**
    - **112** works even without a SIM card or signal (like 911/999 internationally)
    - **108** is the national ambulance number run by state governments — free service
    - **1930** for cyber crime — report immediately if you lose money to online fraud
    - Save your hotel's address in local language on your phone for emergencies
    """)

# ─────────────────────────────────────────────────────────────
#  PROMPT BUILDER
# ─────────────────────────────────────────────────────────────
def build_safety_prompt(destination, traveler_type, concerns):
    concerns_str = ", ".join(concerns) if concerns else "General Safety"
    return f"""You are a professional travel safety analyst with deep knowledge of destinations across India and internationally.

Provide a COMPREHENSIVE, honest (not alarmist) safety report for:

Destination: {destination}
Traveler Type: {traveler_type}
Specific Concerns: {concerns_str}

## 🛡️ SAFETY REPORT: {destination}

---

### 📊 OVERALL SAFETY RATING

**Safety Score: [X]/10** — [One-line verdict e.g. "Generally safe with standard precautions"]

| Aspect | Rating |
|--------|--------|
| Overall Safety | 🟢/🟡/🔴 |
| For {traveler_type} | 🟢/🟡/🔴 |
| Day Safety | 🟢/🟡/🔴 |
| Night Safety | 🟢/🟡/🔴 |
| Tourist Infrastructure | 🟢/🟡/🔴 |

Brief 3-4 line summary of the overall safety situation in {destination}.

---

### 🔍 SAFETY BREAKDOWN BY CONCERN

For EACH concern in ({concerns_str}), provide a dedicated section:

#### [Concern Emoji] [Concern Name]
- **Status:** 🟢 Safe / 🟡 Moderate Caution / 🔴 High Caution
- **Situation:** [3-4 specific, factual lines about this concern in {destination}]
- **Tips for {traveler_type}:**
  1. [Specific actionable tip]
  2. [Specific actionable tip]
  3. [Specific actionable tip]

---

### 🚨 COMMON SCAMS & HOW TO AVOID THEM

List 5 scams that are common in {destination} (be specific to this destination, not generic):

**1. [Scam Name]**
- How it works: [brief explanation]
- Red flags: [what to watch for]
- How to avoid: [specific action]

(Same format for all 5)

---

### 🏥 EMERGENCY CONTACTS FOR {destination}

| Service | Number / Details |
|---------|-----------------|
| Local Police Station | |
| Ambulance | |
| Fire Brigade | |
| Tourist Police / Helpline | |
| Women's Helpline | |
| Nearest Major Government Hospital | |
| Nearest Private Hospital (if known) | |
| Anti-Poison / Medical Emergency | |
| Local Emergency App | |

For international destinations: also list the Indian Embassy/Consulate number.

---

### 📍 AREA-WISE SAFETY GUIDE

List 8-10 well-known areas/localities/neighborhoods of {destination} with safety status:

| Area / Locality | Safety Rating | Best Time to Visit | Notes |
|----------------|---------------|--------------------|-------|
(Use: 🟢 Safe | 🟡 Caution Advised | 🔴 Avoid at Night / Avoid Entirely)

Add 2-3 lines summarizing which areas are tourist-friendly vs which to avoid.

---

### 🌙 NIGHT SAFETY IN {destination}

- **Safe areas after dark:** [specific areas]
- **Areas to avoid at night:** [specific areas with reasons]
- **Night transport tips:** [how to get home safely — correct transport modes for {destination}]
- **General night safety hour:** [time after which extra caution is needed]

---

### 👤 SPECIFIC TIPS FOR {traveler_type}

Provide 5-6 tips that are SPECIFICALLY relevant for a {traveler_type} visiting {destination}:
1. 
2. 
3. 
4. 
5. 
6. 

---

### ✅ DO's AND DON'Ts IN {destination}

| ✅ DO | ❌ DON'T |
|-------|---------|
| | |
(6 rows — be specific to {destination}, not generic)

---

### 📱 SAFETY APPS TO DOWNLOAD

List 3-4 apps useful for safety when visiting {destination}:
| App | Purpose | Platform |
|-----|---------|----------|

---

### 🔚 FINAL VERDICT

2-3 lines summarising whether {destination} is recommended for a {traveler_type}, what level of preparation is needed, and the single most important safety tip.

IMPORTANT RULES:
- Be honest but not alarmist — most popular destinations are safe with basic precautions
- Be SPECIFIC to {destination} — avoid generic travel advice that applies everywhere
- For Women's Safety, be especially specific and honest about ground reality
- For LGBTQ+ Traveler, mention local laws and social attitudes honestly
- Emergency numbers must be real and verified for {destination}
- Area safety ratings should reflect real-world knowledge, not assumptions
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("safety_result", "safety_params"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  INPUT FORM
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown('<div class="filter-card">', unsafe_allow_html=True)

with st.form("safety_form"):

    col1, col2 = st.columns(2)
    with col1:
        destination = st.text_input(
            "🌍 Destination",
            placeholder="e.g. Goa, Delhi, Bangkok, Istanbul…",
            help="Enter the city, state or country you're travelling to",
        )
    with col2:
        traveler_type = st.selectbox(
            "👤 Traveler Type",
            options=TRAVELER_TYPES,
            index=0,
            help="Safety tips will be tailored to your traveler profile",
        )

    concerns = st.multiselect(
        "🔍 Specific Safety Concerns",
        options=CONCERN_OPTIONS,
        default=["General Safety", "Theft / Scams", "Night Safety"],
        help="Select all concerns you want the AI to address in detail",
    )

    submitted = st.form_submit_button("🛡️ Get Safety Report", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  FORM PROCESSING
# ─────────────────────────────────────────────────────────────
if submitted:
    if not destination.strip():
        st.error("⚠️ Please enter a destination.")
    elif not concerns:
        st.error("⚠️ Please select at least one safety concern.")
    else:
        st.session_state["safety_params"] = {
            "destination":   destination.strip(),
            "traveler_type": traveler_type,
            "concerns":      concerns,
        }

        prompt = build_safety_prompt(
            destination.strip(), traveler_type, concerns
        )

        with st.spinner("🛡️ Generating your safety report… this may take 15–20 seconds"):
            result = get_gemini_response(prompt, temperature=0.35)

        if result:
            st.session_state["safety_result"] = result
        else:
            st.error("❌ Could not generate safety report. Please try again.")

# ─────────────────────────────────────────────────────────────
#  RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state.get("safety_result"):
    result = st.session_state["safety_result"]
    p      = st.session_state.get("safety_params", {})
    dst    = p.get("destination", "your destination")
    ttype  = p.get("traveler_type", "")

    st.markdown("---")

    st.markdown(f"""
    <div class="chip-row">
        <span class="chip">📍 {dst}</span>
        <span class="chip">👤 {ttype}</span>
        <span class="chip">🛡️ Safety Report</span>
        <span class="chip">🤖 AI Generated</span>
    </div>
    """, unsafe_allow_html=True)

    # Safety colour legend
    st.markdown("""
    <div style="background:rgba(255,255,255,0.04);border-radius:10px;
                padding:0.7rem 1.2rem;margin:0.5rem 0 1rem;
                display:flex;gap:1.5rem;flex-wrap:wrap;font-size:0.85rem;">
        <span>🟢 <span style="color:rgba(255,255,255,0.7)">Safe</span></span>
        <span>🟡 <span style="color:rgba(255,255,255,0.7)">Moderate Caution</span></span>
        <span>🔴 <span style="color:rgba(255,255,255,0.7)">High Caution / Avoid</span></span>
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
            label="⬇️ Download Safety Report",
            data=result,
            file_name=f"safety_report_{dst.replace(' ', '_').lower()}.txt",
            mime="text/plain",
            use_container_width=True,
        )
    with col_re:
        if st.button("🔄 Regenerate", key="regen_safety", use_container_width=True):
            st.session_state["safety_result"] = None
            st.rerun()

    # ── Official resource links ───────────────────────────────
    st.markdown("---")
    st.markdown("### 🔗 Official Safety Resources")
    res_cols = st.columns(3)
    resources = [
        ("🇮🇳 MEA Travel Advisories",  "https://mea.gov.in"),
        ("🌍 WHO Travel Health",         "https://www.who.int/travel-advice"),
        ("📋 Smart Traveller (AU Govt)", "https://www.smartraveller.gov.au"),
    ]
    for i, (label, url) in enumerate(resources):
        with res_cols[i]:
            st.markdown(
                f'<a href="{url}" target="_blank" style="'
                'display:block;text-align:center;padding:0.7rem;'
                'background:rgba(156,39,176,0.12);border:1px solid rgba(156,39,176,0.3);'
                'border-radius:10px;color:#CE93D8;text-decoration:none;font-size:0.88rem;'
                f'font-weight:600">{label} ↗</a>',
                unsafe_allow_html=True,
            )

    st.markdown("---")
    st.info(
        "💡 **Plan with safety in mind:** Use **🤖 AI Trip Planner** to build an "
        "itinerary that avoids risky areas, or **🚗 Travel Options** to choose the "
        "safest transport mode for your journey.",
        icon="🛡️",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")
    st.markdown("### 🔍 What This Safety Report Covers")

    coverage = [
        ("📊", "Overall Safety Score",    "Rated /10 with a breakdown table by time of day & traveler type"),
        ("🔍", "Concern-by-Concern",      "Each selected concern addressed with situation, rating & 3 tips"),
        ("🚨", "Top 5 Local Scams",        "Destination-specific scams: how they work & how to avoid them"),
        ("🏥", "Emergency Contacts",       "Real local police, hospital, ambulance & helpline numbers"),
        ("📍", "Area Safety Map",          "8–10 localities rated 🟢/🟡/🔴 with night-safety notes"),
        ("🌙", "Night Safety Guide",       "Safe zones, areas to avoid, correct night transport options"),
        ("👤", "Traveler-Type Tips",       "6 tips specific to Solo Female / Family / LGBTQ+ / Senior etc."),
        ("✅", "Do's & Don'ts",            "6 destination-specific do's and don'ts — not generic advice"),
        ("📱", "Safety Apps",              "Apps that actually help in an emergency at this destination"),
    ]

    cols = st.columns(3)
    for i, (icon, title, desc) in enumerate(coverage):
        with cols[i % 3]:
            st.markdown(f"""
            <div style="background:rgba(255,255,255,0.04);
                        border:1px solid rgba(156,39,176,0.2);
                        border-radius:12px;padding:1rem;
                        margin-bottom:0.75rem;">
                <div style="font-size:1.6rem;margin-bottom:0.3rem">{icon}</div>
                <div style="color:#CE93D8;font-weight:600;
                            margin-bottom:0.25rem">{title}</div>
                <div style="color:rgba(255,255,255,0.52);
                            font-size:0.8rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # Quick pre-travel checklist
    st.markdown("### ✅ Pre-Travel Safety Checklist")
    checklist = [
        ("📋", "Travel Documents",    "Carry physical + digital copies of passport, visa, insurance"),
        ("💊", "Health Prep",         "Check vaccinations needed, carry prescription meds with doctor's note"),
        ("📞", "Emergency Contacts",  "Save local police, hospital and your embassy number offline"),
        ("💳", "Money Safety",        "Notify your bank, carry limited cash, have a backup card"),
        ("🔒", "Digital Security",    "Use VPN on public WiFi, enable 2FA, back up photos to cloud"),
        ("🗺️", "Offline Access",     "Download offline maps (Google Maps / Maps.me) for your destination"),
        ("🏥", "Travel Insurance",    "Ensure your policy covers medical evacuation and trip cancellation"),
        ("📱", "Emergency Apps",      "Install 112 India app, your embassy's app, and a first-aid guide"),
    ]
    chk_cols = st.columns(2)
    for i, (icon, title, desc) in enumerate(checklist):
        with chk_cols[i % 2]:
            st.markdown(f"""
            <div class="checklist-item">
                <span style="font-size:1.3rem;min-width:1.6rem">{icon}</span>
                <div>
                    <div style="color:#CE93D8;font-weight:600;
                                font-size:0.9rem">{title}</div>
                    <div style="color:rgba(255,255,255,0.55);
                                font-size:0.78rem;margin-top:0.1rem">{desc}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;color:rgba(255,255,255,0.42);
                font-size:0.9rem;padding:1rem 0;">
        🛡️ Enter your destination and traveler type above, then click
        <strong>Get Safety Report</strong> for a personalised safety brief
    </div>
    """, unsafe_allow_html=True)
st.caption("👈 Full feature coming soon!")
