"""
YatraSathi ✈️ — Page 2: Smart Budget Estimator
Detailed trip cost breakdown powered by Google Gemini
"""

import re
import streamlit as st
from utils.gemini_helper import get_gemini_response
from utils.constants import BUDGET_RANGES, TRAVEL_STYLES, HOTEL_TYPES

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()

# ─────────────────────────────────────────────────────────────
#  Page CSS
# ─────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    .budget-tip {
        background: linear-gradient(135deg, rgba(50,205,50,0.1), rgba(0,206,209,0.08));
        border: 1px solid rgba(50,205,50,0.35);
        border-radius: 12px;
        padding: 13px 20px;
        font-size: 0.91rem;
        color: #90EE90;
        margin-bottom: 1.2rem;
    }
    .result-box {
        background: #1a1a2e;
        border: 1px solid rgba(50,205,50,0.3);
        border-radius: 16px;
        padding: 28px 32px;
        margin-top: 0.5rem;
    }
    .disclaimer {
        background: rgba(255,193,7,0.08);
        border: 1px solid rgba(255,193,7,0.3);
        border-radius: 10px;
        padding: 12px 18px;
        font-size: 0.85rem;
        color: #FFD700;
        margin-top: 1.2rem;
    }
    div[data-testid="stForm"] {
        background: #1a1a2e;
        border: 1px solid rgba(50,205,50,0.2);
        border-radius: 16px;
        padding: 24px 28px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ─────────────────────────────────────────────────────────────
#  HEADER
# ─────────────────────────────────────────────────────────────
st.title("💰 Smart Budget Estimator")
st.markdown(
    "*Know exactly how much your trip will cost before you pack your bags.*"
)
st.divider()

st.markdown(
    '<div class="budget-tip">'
    "💡 <b>Tip:</b> Selecting your actual travel style and accommodation type gives the most accurate estimate. "
    "Always keep a 10–15% buffer for unplanned expenses!"
    "</div>",
    unsafe_allow_html=True,
)

# ─────────────────────────────────────────────────────────────
#  Constants
# ─────────────────────────────────────────────────────────────
ACTIVITIES_LIST = [
    "Sightseeing", "Adventure Sports", "Water Sports", "Trekking",
    "Shopping", "Nightlife", "Spa & Wellness", "Local Tours",
    "Photography Tours", "Food Tours", "Temple/Religious Visits", "Museum Visits",
]

TRAVEL_STYLE_OPTIONS = list(BUDGET_RANGES.keys())  # Backpacker → Luxury

# ─────────────────────────────────────────────────────────────
#  Session state
# ─────────────────────────────────────────────────────────────
_DEFAULTS = {
    "budget_result":   None,
    "budget_shown":    False,
    "b_dest":          "",
    "b_days":          3,
    "b_travelers":     2,
    "b_style":         "Standard",
    "b_source":        "",
    "b_accommodation": HOTEL_TYPES[0],
    "b_activities":    ["Sightseeing", "Food Tours"],
}
for k, v in _DEFAULTS.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────────────────────
#  INPUT FORM
# ─────────────────────────────────────────────────────────────
with st.form("budget_form", clear_on_submit=False):

    # Row 1
    c1, c2 = st.columns(2)
    with c1:
        destination = st.text_input(
            "📍 Destination",
            value=st.session_state["b_dest"],
            placeholder="e.g., Goa, Paris, Manali",
        )
    with c2:
        num_days = st.number_input(
            "📅 Number of Days",
            min_value=1, max_value=30,
            value=st.session_state["b_days"], step=1,
        )

    # Row 2
    c3, c4 = st.columns(2)
    with c3:
        num_travelers = st.number_input(
            "👥 Number of Travelers",
            min_value=1, max_value=20,
            value=st.session_state["b_travelers"], step=1,
        )
    with c4:
        travel_style = st.selectbox(
            "🎒 Travel Style",
            options=TRAVEL_STYLE_OPTIONS,
            index=TRAVEL_STYLE_OPTIONS.index(st.session_state["b_style"])
            if st.session_state["b_style"] in TRAVEL_STYLE_OPTIONS else 2,
            format_func=lambda k: f"{k}  —  {BUDGET_RANGES[k]}",
        )

    # Row 3
    c5, c6 = st.columns(2)
    with c5:
        source = st.text_input(
            "🏠 Source City  (for travel cost)",
            value=st.session_state["b_source"],
            placeholder="e.g., Delhi, Mumbai",
        )
    with c6:
        accommodation = st.selectbox(
            "🏨 Accommodation Type",
            options=HOTEL_TYPES,
            index=HOTEL_TYPES.index(st.session_state["b_accommodation"])
            if st.session_state["b_accommodation"] in HOTEL_TYPES else 0,
        )

    # Row 4
    activities = st.multiselect(
        "🎯 Activities Planned",
        options=ACTIVITIES_LIST,
        default=[a for a in st.session_state["b_activities"] if a in ACTIVITIES_LIST],
    )

    st.write("")
    submitted = st.form_submit_button(
        "💰 Calculate Budget",
        use_container_width=True,
        type="primary",
    )

# ─────────────────────────────────────────────────────────────
#  BUILD PROMPT
# ─────────────────────────────────────────────────────────────
def build_budget_prompt(src, dst, days, travelers, style, accommodation, activities):
    acts_str = ", ".join(activities) if activities else "General sightseeing"
    src_str  = src.strip() if src.strip() else "their city"
    return f"""You are a travel budget expert for Indian travelers.
Calculate a DETAILED budget breakdown.

Trip: {src_str} to {dst}
Duration: {days} days
Travelers: {travelers}
Style: {style}  ({BUDGET_RANGES[style]})
Stay: {accommodation}
Activities: {acts_str}

Provide budget in this EXACT format:

## 💰 BUDGET BREAKDOWN FOR {dst}

### 🚗 TRAVEL COSTS (To & From)
| Mode | Cost per person (₹) | Duration | Recommended? |
|------|---------------------|----------|--------------|
| Flight | ₹X,XXX - ₹X,XXX | X hrs | ✅/❌ |
| Train | ₹X,XXX - ₹X,XXX | X hrs | ✅/❌ |
| Bus | ₹X,XXX - ₹X,XXX | X hrs | ✅/❌ |
| Car/Road | ₹X,XXX - ₹X,XXX | X hrs | ✅/❌ |

### 🏨 ACCOMMODATION ({days} nights)
| Type | Cost/Night (₹) | {days}-Night Total (₹) |
|------|----------------|----------------------|
| Budget Option | ₹X,XXX | ₹X,XXX |
| Mid-Range Option | ₹X,XXX | ₹X,XXX |
| Premium Option | ₹X,XXX | ₹X,XXX |
RECOMMENDED for {style}: [specific hotel/stay suggestion]

### 🍽️ FOOD & DRINKS (Per Day Per Person)
| Meal | Budget (₹) | Mid-Range (₹) | Premium (₹) |
|------|-----------|---------------|-------------|
| Breakfast | | | |
| Lunch | | | |
| Dinner | | | |
| Snacks & Drinks | | | |
| **Daily Total** | | | |
| **{days}-Day Total** | | | |

### 🎯 ACTIVITIES & SIGHTSEEING
| Activity | Cost/Person (₹) | Notes |
|----------|-----------------|-------|
(List based on selected activities + popular activities at {dst})

### 🚕 LOCAL TRANSPORT (Per Day)
⚠️ CRITICAL ACCURACY RULE: List ONLY transport modes that are ACTUALLY available and legally operating in {dst}.
- DO NOT assume Ola/Uber/Rapido operate everywhere — they are BANNED in some states (e.g., Goa bans app-based cab aggregators; only local taxis and GoaMiles app work there)
- CHECK if {dst} has a Metro system (Delhi Metro, Mumbai Metro, Namma Metro Bengaluru, Hyderabad Metro, Chennai Metro, Kolkata Metro, Kochi Metro, Jaipur Metro, etc.) and include it if applicable
- CHECK if {dst} has suburban/local trains (Mumbai Local, Chennai MRTS/Suburban, Kolkata Suburban, etc.) and include if applicable
- Mention any city-specific transport apps (e.g., GoaMiles for Goa, TS Metro App for Hyderabad, etc.)
- List auto-rickshaws only if they meter/negotiate in that city
- Include ferries/boats if relevant (e.g., Goa ferries, backwaters Kerala, Andaman boats)

| Mode | Available in {dst}? | Cost Estimate (₹/day) | Booking |  
|------|--------------------|-----------------------|---------|  
(Fill ONLY modes actually available — add or remove rows as needed)

RECOMMENDED for {style} budget in {dst}: [specific suggestion with practical tips]

### 🛍️ MISCELLANEOUS
| Item | Estimate (₹) |
|------|-------------|
| Shopping/Souvenirs | |
| Tips | |
| Emergency Fund | |
| SIM Card/Internet | |

## 📊 TOTAL BUDGET SUMMARY

| Category | Min (₹) | Max (₹) |
|----------|---------|---------|
| Travel | | |
| Accommodation | | |
| Food & Drinks | | |
| Activities | | |
| Local Transport | | |
| Miscellaneous | | |
| **TOTAL PER PERSON** | **₹** | **₹** |
| **TOTAL FOR {travelers} PEOPLE** | **₹** | **₹** |

## 💡 MONEY-SAVING TIPS FOR {dst}
Give 5 specific tips to save money at this destination.

## 📌 SUMMARY NUMBERS (for display cards — keep this section at the very end)
MIN_PER_PERSON: [number only, no ₹ symbol]
MAX_PER_PERSON: [number only, no ₹ symbol]
RECOMMENDED_PER_PERSON: [number only, no ₹ symbol]

ALL COSTS IN INDIAN RUPEES.
Be realistic with current 2026 prices.
For {style} style, highlight the most appropriate options.
⚠️ TRANSPORT ACCURACY IS CRITICAL: Never guess that ride-hailing apps (Ola/Uber/Rapido) work everywhere. Research the actual ground transport situation for {dst}. Include local train/metro lines if they exist in {dst}.
"""


# ─────────────────────────────────────────────────────────────
#  Extract summary numbers from AI text
# ─────────────────────────────────────────────────────────────
def extract_summary_numbers(text: str) -> tuple[int | None, int | None, int | None]:
    """Extract MIN/MAX/RECOMMENDED per-person numbers from the AI response."""
    def _get(label):
        m = re.search(rf"{label}:\s*([\d,]+)", text, re.IGNORECASE)
        if m:
            return int(m.group(1).replace(",", ""))
        return None
    return (
        _get("MIN_PER_PERSON"),
        _get("MAX_PER_PERSON"),
        _get("RECOMMENDED_PER_PERSON"),
    )


def _fmt(val: int | None) -> str:
    if val is None:
        return "—"
    return f"₹{val:,}"


# ─────────────────────────────────────────────────────────────
#  SUBMISSION HANDLER
# ─────────────────────────────────────────────────────────────
if submitted:
    # Persist
    st.session_state["b_dest"]          = destination
    st.session_state["b_days"]          = int(num_days)
    st.session_state["b_travelers"]     = int(num_travelers)
    st.session_state["b_style"]         = travel_style
    st.session_state["b_source"]        = source
    st.session_state["b_accommodation"] = accommodation
    st.session_state["b_activities"]    = activities

    # Validate
    if not destination.strip():
        st.warning("⚠️ Please enter a **Destination** to estimate budget.")
        st.stop()

    prompt = build_budget_prompt(
        source, destination.strip(),
        int(num_days), int(num_travelers),
        travel_style, accommodation, activities,
    )

    with st.spinner("💰 AI is calculating your budget breakdown…"):
        result = get_gemini_response(prompt, temperature=0.5)

    if result is None:
        st.error(
            "😔 Oops! AI is taking a break. Please try again in a moment."
        )
        st.stop()

    st.session_state["budget_result"] = result
    st.session_state["budget_shown"]  = True

# ─────────────────────────────────────────────────────────────
#  RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state["budget_shown"] and st.session_state["budget_result"]:
    result   = st.session_state["budget_result"]
    dst_city = st.session_state["b_dest"]
    days_val = st.session_state["b_days"]
    pax      = st.session_state["b_travelers"]
    style    = st.session_state["b_style"]

    st.divider()
    st.success("✅ Budget calculated successfully!")

    # ── Metric cards ──────────────────────────────────────
    mn, mx, rec = extract_summary_numbers(result)

    m1, m2, m3 = st.columns(3, gap="medium")
    with m1:
        st.metric(
            label="💚 Min Budget / Person",
            value=_fmt(mn),
            help="Lowest realistic estimate travelling economy",
        )
    with m2:
        st.metric(
            label="❤️ Max Budget / Person",
            value=_fmt(mx),
            help="Upper-end estimate with premium choices",
        )
    with m3:
        st.metric(
            label="⭐ Recommended / Person",
            value=_fmt(rec),
            help=f"Best value for {style} travel style",
        )

    if pax > 1 and mn and mx:
        st.caption(
            f"👥 **Total for {pax} travelers** → "
            f"Min: **{_fmt(mn * pax)}**  |  Max: **{_fmt(mx * pax)}**"
            + (f"  |  Recommended: **{_fmt(rec * pax)}**" if rec else "")
        )

    st.write("")

    # ── Download button ───────────────────────────────────
    dl_col, _ = st.columns([1, 3])
    with dl_col:
        fname = f"YatraSathi_Budget_{dst_city}_{days_val}days.txt"
        st.download_button(
            label="📥 Download Budget Report",
            data=result,
            file_name=fname,
            mime="text/plain",
            use_container_width=True,
        )

    st.write("")

    # ── Strip the SUMMARY NUMBERS section before rendering ──
    display_text = re.sub(
        r"##\s*📌 SUMMARY NUMBERS.*$", "", result, flags=re.DOTALL
    ).strip()

    # ── Main result card ──────────────────────────────────
    st.markdown('<div class="result-box">', unsafe_allow_html=True)
    st.markdown(display_text)
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Disclaimer ────────────────────────────────────────
    st.markdown(
        '<div class="disclaimer">'
        "💡 <b>Note:</b> Prices are AI-estimated based on 2025 averages and may vary by season, "
        "availability and platform. Always keep a <b>10–15% buffer</b> for unplanned expenses."
        "</div>",
        unsafe_allow_html=True,
    )

    # ── Expander tip ──────────────────────────────────────
    st.write("")
    with st.expander("🔍 Want a detailed day-by-day cost breakdown?"):
        st.markdown(
            "Use our **🤖 AI Trip Planner** for a full itinerary with "
            "per-day cost estimates, specific restaurant picks and hotel recommendations.\n\n"
            "👈 Select **AI Trip Planner** from the sidebar to get started!"
        )

    # ── Footer caption ────────────────────────────────────
    st.write("")
    st.caption(
        f"💰 Budget estimate for **{dst_city}** | {days_val} days | "
        f"{pax} traveller(s) | Style: {style} | Powered by Google Gemini"
    )
