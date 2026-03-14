"""
YatraSathi ✈️ — Page 3: Hotels & Stays
AI-powered accommodation finder for every budget
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
    page_title="Hotels & Stays — YatraSathi",
    page_icon="🏨",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.hotel-hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(255,183,77,0.15), rgba(255,100,130,0.12));
    border-radius: 20px;
    border: 1px solid rgba(255,183,77,0.25);
    margin-bottom: 2rem;
}
.hotel-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #FFB74D, #FF6584);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.hotel-hero p { color: rgba(255,255,255,0.72); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,183,77,0.2);
    border-radius: 16px;
    padding: 1.6rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.result-card {
    background: rgba(15,12,41,0.85);
    border: 1px solid rgba(255,183,77,0.25);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    margin-top: 1.5rem;
    line-height: 1.75;
}
.chip-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0 0.5rem; }
.chip {
    background: rgba(255,183,77,0.15);
    border: 1px solid rgba(255,183,77,0.35);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.82rem;
    color: #FFD180;
    font-weight: 500;
}
.stDownloadButton > button {
    background: linear-gradient(135deg, #FFB74D, #FF6584) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
}
.stFormSubmitButton > button {
    background: linear-gradient(135deg, #FFB74D, #FF6584) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    width: 100%;
}
hr { border-color: rgba(255,183,77,0.15) !important; }
[data-testid="stExpander"] {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,183,77,0.18) !important;
    border-radius: 12px !important;
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────────────────────
BUDGET_OPTIONS = [
    "Under ₹500",
    "₹500 – ₹1,500",
    "₹1,500 – ₹3,000",
    "₹3,000 – ₹5,000",
    "₹5,000 – ₹10,000",
    "₹10,000 – ₹20,000",
    "₹20,000+",
]

ACCOMMODATION_TYPES = [
    "Budget Hotels",
    "3-Star Hotels",
    "4-Star Hotels",
    "5-Star Hotels",
    "Hostels / Dormitories",
    "Homestays",
    "Resorts",
    "Villas",
    "PG / Guest Houses",
    "Dharamshala / Ashram",
    "Camping / Glamping",
]

AMENITIES_LIST = [
    "WiFi",
    "AC",
    "Parking",
    "Swimming Pool",
    "Gym",
    "Restaurant",
    "Room Service",
    "Pet Friendly",
    "Family Friendly",
    "Couple Friendly",
    "Wheelchair Accessible",
    "Kitchen / Kitchenette",
]

# ─────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="hotel-hero">
    <h1>🏨 Hotels & Stays Finder</h1>
    <p>Find the perfect place to stay — from budget hostels to luxury resorts</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  PROMPT BUILDERS
# ─────────────────────────────────────────────────────────────
def build_hotel_prompt(destination, nights, budget_range, travel_style,
                       accommodation_types, amenities):
    types_str     = ", ".join(accommodation_types) if accommodation_types else "Any"
    amenities_str = ", ".join(amenities) if amenities else "No specific requirements"
    return f"""You are an expert accommodation advisor for travelers in India and internationally.

Find the best stays at: {destination}
Duration: {nights} night(s)
Budget per night: {budget_range}
Travel Style: {travel_style}
Accommodation Types Wanted: {types_str}
Amenities Needed: {amenities_str}

Provide recommendations in EXACTLY this format:

## 🏨 ACCOMMODATION OPTIONS IN {destination}

For EACH accommodation type requested, list 2-3 real, specific options that match the budget:

### [Type Emoji] [Accommodation Type]

**1. [Real Hotel/Stay Name]**
- 📍 Location/Area: [specific neighbourhood or area in the city]
- 💰 Price Range: ₹X,XXX – ₹X,XXX per night
- ⭐ Approximate Rating: X.X / 5
- ✅ Amenities Available: [list the requested amenities this property has]
- 🎯 Best For: [Solo / Couple / Family / Group / etc.]
- 📝 Why Stay Here: [2 sentences on what makes this property worth choosing]
- 🔗 How to Book: [Booking.com / MakeMyTrip / Goibibo / Direct / Airbnb / etc.]

**2. [Next Option]**
(same format)

---

After listing all types, add:

## 🏆 OUR TOP PICK FOR {travel_style}
Recommend ONE single best option from all the above that fits the budget ({budget_range}), travel style ({travel_style}), and amenities needed. Why in 3 clear lines.

## 💡 BOOKING TIPS FOR {destination}
- 5 destination-specific tips for getting the best room deals (mention actual platforms, seasons, advance booking windows)
- Best areas/neighbourhoods to stay in {destination} and why (2-3 specific area names)
- Areas to AVOID staying in {destination} and why (be specific and honest)

## ⚠️ IMPORTANT NOTES
- Standard check-in / check-out times at hotels in {destination}
- GST / local tourism tax applicable in {destination} (mention the percentage)
- Key cancellation policy advice
- Any local norms guests should know (e.g., ID proof requirements, unmarried couples policy, dress code for religious stays)

## 📊 PRICE COMPARISON BY AREA
| Area/Neighbourhood | Price Range/Night (₹) | Vibe | Distance from Centre |
|--------------------|-----------------------|------|----------------------|
(List 5-6 real areas — cheapest to most expensive)
Add 2-3 lines explaining which area suits which type of traveller.

STRICT RULES:
- Use ONLY real hotel/hostel/stay names that actually exist in {destination}
- Prices must be realistic 2026 estimates
- For international destinations, mention prices in both local currency and approximate INR
- If a requested accommodation type does not exist in {destination}, say so clearly
- For budgets under ₹1,500 — focus on hostels, dormitories, dharamshalas, government guesthouses
- For Dharamshala/Ashram type — only recommend if actually open to tourists; mention if advance registration needed
- Mention if any type requires advance booking well ahead of time
"""


def build_area_prompt(destination, budget_range):
    return f"""You are a local accommodation expert for {destination}.

Give a detailed price comparison of different areas/neighbourhoods to stay in {destination}.
Budget context: approximately {budget_range} per night.

Format as:

## 📊 AREA-WISE PRICE GUIDE: {destination}

| Area/Neighbourhood | Typical Price/Night (₹) | Best For | Pros | Cons |
|--------------------|-------------------------|----------|------|------|
(List 7-8 real areas, cheapest to most expensive)

### 🗺️ AREA GUIDE
For each area, write 2-3 lines on:
- What type of traveller it suits
- Proximity to main attractions
- Safety and overall vibe

### 🏅 VERDICT BY TRAVELLER TYPE
- Best area for solo backpackers: [area + reason]
- Best area for couples: [area + reason]
- Best area for families: [area + reason]
- Best area for business travellers: [area + reason]
- Most budget-friendly area: [area + reason]
- Best area for nightlife: [area + reason]

Use ONLY real neighbourhood names of {destination}.
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("hotel_result", "hotel_area_result", "hotel_params"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  FILTER FORM
# ─────────────────────────────────────────────────────────────
st.markdown('<div class="filter-card">', unsafe_allow_html=True)

with st.form("hotel_form"):

    # Row 1
    col1, col2 = st.columns([2, 1])
    with col1:
        destination = st.text_input(
            "🌍 Destination",
            placeholder="e.g. Goa, Jaipur, Bali, Paris…",
            help="Enter any city, town or tourist destination",
        )
    with col2:
        nights = st.number_input(
            "🌙 Number of Nights",
            min_value=1, max_value=30, value=3, step=1,
        )

    # Row 2
    col3, col4 = st.columns(2)
    with col3:
        budget_per_night = st.selectbox(
            "💰 Budget per Night",
            options=BUDGET_OPTIONS,
            index=2,
        )
    with col4:
        travel_style = st.selectbox(
            "🧳 Travel Style",
            options=TRAVEL_STYLES,
            index=0,
        )

    # Row 3
    accommodation_types = st.multiselect(
        "🏠 Accommodation Types to Show",
        options=ACCOMMODATION_TYPES,
        default=ACCOMMODATION_TYPES,
        help="Deselect any types you don't want to see",
    )

    # Row 4
    amenities = st.multiselect(
        "✅ Amenities Needed",
        options=AMENITIES_LIST,
        default=["WiFi", "AC"],
    )

    submitted = st.form_submit_button("🔍 Find Stays", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  FORM PROCESSING
# ─────────────────────────────────────────────────────────────
if submitted:
    if not destination.strip():
        st.error("⚠️ Please enter a destination to search for stays.")
    elif not accommodation_types:
        st.error("⚠️ Please select at least one accommodation type.")
    else:
        st.session_state["hotel_params"] = {
            "destination": destination.strip(),
            "budget":      budget_per_night,
        }

        prompt = build_hotel_prompt(
            destination.strip(), nights, budget_per_night,
            travel_style, accommodation_types, amenities,
        )

        with st.spinner("🏨 Searching for the best stays… this may take 15–20 seconds"):
            result = get_gemini_response(prompt, temperature=0.6)

        if result:
            st.session_state["hotel_result"]      = result
            st.session_state["hotel_area_result"] = None   # reset area cache on new search
        else:
            st.error("❌ Could not fetch hotel recommendations. Please try again.")

# ─────────────────────────────────────────────────────────────
#  RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state.get("hotel_result"):
    result = st.session_state["hotel_result"]
    params = st.session_state.get("hotel_params", {})
    dst    = params.get("destination", "your destination")

    st.markdown("---")

    st.markdown(f"""
    <div class="chip-row">
        <span class="chip">📍 {dst}</span>
        <span class="chip">🏨 Hotels & Stays</span>
        <span class="chip">💡 AI Recommendations</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="result-card">', unsafe_allow_html=True)
    st.markdown(result)
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("---")
    col_dl, col_re, _ = st.columns([1, 1, 2])

    with col_dl:
        st.download_button(
            label="⬇️ Download Results",
            data=result,
            file_name=f"hotels_{dst.replace(' ', '_').lower()}.txt",
            mime="text/plain",
            use_container_width=True,
        )
    with col_re:
        if st.button("🔄 Regenerate", use_container_width=True, key="regen_hotels"):
            st.session_state["hotel_result"]      = None
            st.session_state["hotel_area_result"] = None
            st.rerun()

    # ── Extra feature: Area price comparison ─────────────────
    st.markdown("---")
    with st.expander("📊 Price Comparison by Area — Detailed Neighbourhood Guide",
                     expanded=False):

        st.markdown(
            "Get a deep-dive into **which areas of the city** are cheapest, "
            "safest, and best suited for your trip style."
        )

        if st.session_state.get("hotel_area_result"):
            st.markdown(st.session_state["hotel_area_result"])
            st.download_button(
                label="⬇️ Download Area Guide",
                data=st.session_state["hotel_area_result"],
                file_name=f"area_guide_{dst.replace(' ', '_').lower()}.txt",
                mime="text/plain",
                key="dl_area_cached",
            )
        else:
            if st.button("🗺️ Generate Area Price Guide", key="area_btn",
                         use_container_width=True):
                budget_ctx  = params.get("budget", "moderate budget")
                area_prompt = build_area_prompt(dst, budget_ctx)

                with st.spinner("🗺️ Analysing neighbourhoods and price zones…"):
                    area_result = get_gemini_response(area_prompt, temperature=0.5)

                if area_result:
                    st.session_state["hotel_area_result"] = area_result
                    st.markdown(area_result)
                    st.download_button(
                        label="⬇️ Download Area Guide",
                        data=area_result,
                        file_name=f"area_guide_{dst.replace(' ', '_').lower()}.txt",
                        mime="text/plain",
                        key="dl_area_new",
                    )
                else:
                    st.error("❌ Could not generate area guide. Please try again.")

    st.markdown("---")
    st.info(
        "💡 **Next Steps:** Once you've chosen your stay, use "
        "**🍽️ Food Guide** to discover the best restaurants near your hotel, "
        "or **🤖 AI Trip Planner** to build your full day-by-day itinerary.",
        icon="🏨",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")
    st.markdown("### 🏠 What We Help You Find")

    type_data = [
        ("🛏️",  "Budget Hotels",           "Great value, clean rooms, essential amenities"),
        ("⭐⭐⭐", "3-Star Hotels",            "Comfortable stays with added services"),
        ("⭐⭐⭐⭐","4-Star Hotels",            "Premium comfort, pools and dining"),
        ("⭐⭐⭐⭐⭐","5-Star Hotels",           "World-class luxury and personalised service"),
        ("🎒",  "Hostels / Dormitories",    "Social, affordable — perfect for solo backpackers"),
        ("🏡",  "Homestays",               "Local immersion, home-cooked meals, family warmth"),
        ("🌴",  "Resorts",                 "All-inclusive relaxation, beach or hill"),
        ("🏠",  "Villas",                  "Private spaces for groups and families"),
        ("🚪",  "PG / Guest Houses",       "Long-stay budget option for solo travellers"),
        ("🕉️", "Dharamshala / Ashram",     "Spiritual retreats — peaceful and minimal"),
        ("⛺",  "Camping / Glamping",       "Outdoor adventures with a touch of comfort"),
    ]

    cols = st.columns(3)
    for i, (emoji, name, desc) in enumerate(type_data):
        with cols[i % 3]:
            st.markdown(f"""
            <div style="
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,183,77,0.2);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 0.8rem;
                text-align: center;
            ">
                <div style="font-size:1.8rem">{emoji}</div>
                <div style="color:#FFD180;font-weight:600;margin:0.3rem 0">{name}</div>
                <div style="color:rgba(255,255,255,0.6);font-size:0.82rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;color:rgba(255,255,255,0.45);
                font-size:0.9rem;padding:1rem 0;">
        🔍 Enter your destination above and click <strong>Find Stays</strong>
        to get AI-curated recommendations
    </div>
    """, unsafe_allow_html=True)
