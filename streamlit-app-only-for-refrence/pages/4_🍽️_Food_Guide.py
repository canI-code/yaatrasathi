"""
YatraSathi ✈️ — Page 4: Food Guide
AI-powered local food, restaurant & street food discovery
"""

import streamlit as st
from utils.gemini_helper import get_gemini_response
from utils.constants import FOOD_PREFERENCES

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()


# ─────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Food Guide — YatraSathi",
    page_icon="🍽️",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #1a0a00, #3d1a00, #1a0a00);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.food-hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(255,87,34,0.18), rgba(255,193,7,0.13));
    border-radius: 20px;
    border: 1px solid rgba(255,152,0,0.3);
    margin-bottom: 2rem;
}
.food-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #FF6F00, #FF8F00, #FFC107);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.food-hero p { color: rgba(255,255,255,0.72); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,152,0,0.22);
    border-radius: 16px;
    padding: 1.6rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.result-card {
    background: rgba(26,10,0,0.88);
    border: 1px solid rgba(255,152,0,0.28);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    margin-top: 1.5rem;
    line-height: 1.8;
}
.chip-row { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0 0.5rem; }
.chip {
    background: rgba(255,152,0,0.15);
    border: 1px solid rgba(255,152,0,0.38);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.82rem;
    color: #FFCC02;
    font-weight: 500;
}
.surprise-box {
    background: linear-gradient(135deg,
        rgba(255,87,34,0.12), rgba(255,193,7,0.10));
    border: 1px solid rgba(255,152,0,0.3);
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    margin-top: 1.5rem;
}
.stDownloadButton > button {
    background: linear-gradient(135deg, #FF6F00, #FFC107) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
}
.stFormSubmitButton > button {
    background: linear-gradient(135deg, #FF6F00, #FFC107) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    width: 100%;
}
hr { border-color: rgba(255,152,0,0.15) !important; }
[data-testid="stExpander"] {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,152,0,0.18) !important;
    border-radius: 12px !important;
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────────────────────
BUDGET_OPTIONS = [
    "Street Food Budget (₹50–200/meal)",
    "Casual Dining (₹200–500/meal)",
    "Mid-Range (₹500–1,500/meal)",
    "Fine Dining (₹1,500+/meal)",
    "Show All Ranges",
]

MEAL_TYPES = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Street Food",
    "Desserts",
    "Beverages / Drinks",
]

FOOD_VENUE_TYPES = [
    "Famous Restaurants",
    "Street Food Stalls",
    "Cafés",
    "Local Dhabas",
    "Fine Dining",
    "Rooftop Restaurants",
    "Canteens / Thali Places",
    "Bakeries",
    "Sweet Shops",
    "Night Food Markets",
]

PREF_ICONS = {
    "Vegetarian":     "🥦",
    "Non-Vegetarian": "🍗",
    "Vegan":          "🌱",
    "Jain":           "🕉️",
    "No Preference":  "🍴",
}

# ─────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="food-hero">
    <h1>🍽️ Local Food Guide</h1>
    <p>Discover the flavors of your destination — from street food to fine dining</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  PROMPT BUILDERS
# ─────────────────────────────────────────────────────────────
def build_food_prompt(destination, food_preference, budget,
                      food_types, meal_types):
    types_str = ", ".join(food_types) if food_types else "All types"
    meals_str = ", ".join(meal_types) if meal_types else "All meals"
    pref_icon = PREF_ICONS.get(food_preference, "🍴")
    return f"""You are a food and travel expert specialising in local cuisines across India and internationally.

Destination: {destination}
Food Preference: {food_preference} {pref_icon}
Budget Level: {budget}
Looking For: {types_str}
Meal Types: {meals_str}

Create a COMPREHENSIVE, honest food guide using ONLY real dish names and real restaurant/stall names that exist in {destination}.

## 🍽️ FOOD GUIDE: {destination}

---

### 🌟 MUST-TRY DISHES
List 8-10 iconic dishes specific to {destination} (or its region). For each, strictly note if it suits {food_preference} diet:

| # | Dish Name | Veg / Non-Veg | Where to Try (Specific Place) | Avg Cost (₹) | ⭐ Rating |
|---|-----------|--------------|-------------------------------|-------------|---------|

---

### 🏪 TOP RESTAURANTS & EATERIES
For EACH venue type the user selected ({types_str}), list 2-3 real places:

#### [Emoji] [Venue Type]

**1. [Real Restaurant / Stall Name]**
- 📍 Location: [specific area or landmark in {destination}]
- 💰 Average Cost: ₹XXX per person
- ⭐ Rating: X.X / 5
- 🍽️ Must Order: [2-3 specific dish names]
- ⏰ Timings: [opening - closing hours]
- 🎯 Known For: [one-line specialty]
- {food_preference} Friendly: ✅ / ❌ / ⚠️ (partial)

**2. [Next Place]** (same format)

---

### 🥤 DRINKS & BEVERAGES TO TRY IN {destination}
List 5 local drinks/beverages with specific stall or shop names and cost.

---

### 🍨 DESSERTS & SWEETS
List 5 local sweets or desserts with specific sweet shop names, area, and cost per piece/portion.

---

### 📍 FOOD WALKS & FOOD STREETS
List 2-3 famous food streets or food areas in {destination}:
- Street/Area name
- Best time to visit
- Signature items available there
- Approximate spend per person for a food walk

---

### 💡 FOODIE TIPS FOR {destination}
Provide 5 practical food tips including:
- Best time of day for street food
- Platforms / apps to find restaurant deals (Zomato, Swiggy, etc. — only if they operate in {destination})
- How to spot a hygienic street food stall
- Bargaining / bill-checking norms
- Any local dining customs or etiquette

---

### ⚠️ FOOD SAFETY & CAUTION
- Water safety: tap vs bottled water in {destination}
- Foods/drinks tourists should be careful with and why
- Common stomach issues for first-time visitors and how to avoid them
- Trusted vs tourist-trap areas for food

STRICT RULES:
- For {food_preference} preference — clearly mark every dish/restaurant as suitable or not
- Jain: no root vegetables (onion, garlic, potato, carrot, beet), no eating after sunset — flag accordingly
- Vegan: strictly no dairy or eggs — flag accordingly
- Use ONLY real venue names that genuinely exist in {destination}
- All prices in Indian Rupees (₹); for international destinations add local currency equivalent
- Prices must reflect realistic 2026 estimates
- If a requested venue type (e.g., Fine Dining) does not meaningfully exist in {destination}, say so honestly
"""


def build_surprise_prompt(destination, food_preference):
    return f"""You are a fun food discovery guide.

The traveller is visiting {destination} and their food preference is {food_preference}.

Give them ONE single surprise must-try food experience — a dish, street food item, or beverage that is:
- Unique to {destination} or its region
- Unexpected / underrated / not commonly known to tourists
- Suitable for {food_preference} diet (strictly follow this)

Format your response like this:

## 🎲 YOUR SURPRISE FOOD CHALLENGE!

**[Dish/Drink Name]** 🍴

📍 **Where:** [Specific stall/restaurant/market name and area in {destination}]
💰 **Cost:** ₹[amount]
🌶️ **Taste Profile:** [Describe the flavours in a fun, exciting way — 2 sentences]
🤔 **Why You MUST Try It:** [1 fun reason — make it enthusiastic]
📸 **Pro Tip:** [One tip for the best experience — e.g., 'go at midnight when the oil is freshest']

Keep the tone fun, adventurous, and exciting — like a friend daring you to try something!
Use ONLY a real dish that genuinely exists in {destination}.
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("food_result", "surprise_result", "food_params"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  FILTER FORM
# ─────────────────────────────────────────────────────────────
st.markdown('<div class="filter-card">', unsafe_allow_html=True)

with st.form("food_form"):

    # Row 1
    col1, col2 = st.columns(2)
    with col1:
        destination = st.text_input(
            "🌍 Destination",
            placeholder="e.g. Goa, Kolkata, Bangkok, Naples…",
            help="Enter the city or town you're visiting",
        )
    with col2:
        food_preference = st.selectbox(
            "🥗 Food Preference",
            options=FOOD_PREFERENCES,
            index=0,
            help="The AI will filter all recommendations strictly to your preference",
        )

    # Row 2
    col3, col4 = st.columns(2)
    with col3:
        budget = st.selectbox(
            "💰 Budget per Meal",
            options=BUDGET_OPTIONS,
            index=4,
        )
    with col4:
        meal_types = st.multiselect(
            "🕐 Meal Types",
            options=MEAL_TYPES,
            default=MEAL_TYPES,
        )

    # Row 3
    food_types = st.multiselect(
        "🏪 What Are You Looking For?",
        options=FOOD_VENUE_TYPES,
        default=FOOD_VENUE_TYPES,
        help="Deselect any venue types you're not interested in",
    )

    submitted = st.form_submit_button("🍽️ Explore Food", use_container_width=True)

st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  FORM PROCESSING
# ─────────────────────────────────────────────────────────────
if submitted:
    if not destination.strip():
        st.error("⚠️ Please enter a destination.")
    elif not food_types:
        st.error("⚠️ Please select at least one venue type.")
    elif not meal_types:
        st.error("⚠️ Please select at least one meal type.")
    else:
        st.session_state["food_params"] = {
            "destination":     destination.strip(),
            "food_preference": food_preference,
        }
        # Reset surprise on new search
        st.session_state["surprise_result"] = None

        prompt = build_food_prompt(
            destination.strip(), food_preference,
            budget, food_types, meal_types,
        )

        with st.spinner("🍽️ Discovering the best local food… this may take 15–20 seconds"):
            result = get_gemini_response(prompt, temperature=0.65)

        if result:
            st.session_state["food_result"] = result
        else:
            st.error("❌ Could not fetch food recommendations. Please try again.")

# ─────────────────────────────────────────────────────────────
#  RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state.get("food_result"):
    result = st.session_state["food_result"]
    params = st.session_state.get("food_params", {})
    dst    = params.get("destination", "your destination")
    pref   = params.get("food_preference", "")

    st.markdown("---")

    st.markdown(f"""
    <div class="chip-row">
        <span class="chip">📍 {dst}</span>
        <span class="chip">{PREF_ICONS.get(pref, "🍴")} {pref}</span>
        <span class="chip">🍽️ Food Guide</span>
        <span class="chip">💡 AI Recommendations</span>
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
            label="⬇️ Download Food Guide",
            data=result,
            file_name=f"food_guide_{dst.replace(' ', '_').lower()}.txt",
            mime="text/plain",
            use_container_width=True,
        )
    with col_re:
        if st.button("🔄 Regenerate", use_container_width=True, key="regen_food"):
            st.session_state["food_result"]    = None
            st.session_state["surprise_result"] = None
            st.rerun()

    # ─────────────────────────────────────────────────────────
    #  🎲 RANDOM FOOD CHALLENGE
    # ─────────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown('<div class="surprise-box">', unsafe_allow_html=True)

    st.markdown("""
    ### 🎲 Random Food Challenge
    *Feeling adventurous? Let AI dare you to try something unexpected!*
    """)

    if st.session_state.get("surprise_result"):
        st.markdown(st.session_state["surprise_result"])
        col_s1, col_s2 = st.columns([1, 3])
        with col_s1:
            if st.button("🎲 Try Another!", key="surprise_again",
                         use_container_width=True):
                st.session_state["surprise_result"] = None
                s_prompt = build_surprise_prompt(dst, pref)
                with st.spinner("🎲 Spinning the food roulette…"):
                    s_result = get_gemini_response(s_prompt, temperature=0.9)
                if s_result:
                    st.session_state["surprise_result"] = s_result
                    st.rerun()
                else:
                    st.error("❌ Could not get a surprise. Try again!")
    else:
        st.info(
            "🎲 **Surprise Me!** — Click below and the AI will pick one "
            "unexpected, underrated local dish you absolutely must try!",
            icon="🍴",
        )
        if st.button("🎲 Surprise Me!", key="surprise_btn", use_container_width=False):
            s_prompt = build_surprise_prompt(dst, pref)
            with st.spinner("🎲 Spinning the food roulette…"):
                s_result = get_gemini_response(s_prompt, temperature=0.9)
            if s_result:
                st.session_state["surprise_result"] = s_result
                st.rerun()
            else:
                st.error("❌ Could not get a surprise. Try again!")

    st.markdown('</div>', unsafe_allow_html=True)

    # ── Cross-page tip ────────────────────────────────────────
    st.markdown("---")
    st.info(
        "💡 **Hungry for more?** Use **🏨 Hotels & Stays** to find accommodation "
        "near the best food streets, or **🤖 AI Trip Planner** to build a "
        "full itinerary with meal stops built in.",
        icon="🍽️",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")

    # Food preference cards
    st.markdown("### 🥗 Dietary Preferences Supported")
    pref_data = [
        ("🥦", "Vegetarian",     "All plant-based dishes, dairy & eggs OK"),
        ("🍗", "Non-Vegetarian", "All cuisines, meat & seafood included"),
        ("🌱", "Vegan",          "100% plant-based, no dairy or eggs"),
        ("🕉️", "Jain",           "No root vegetables, garlic or onion"),
        ("🍴", "No Preference",  "Open to every flavour and cuisine!"),
    ]
    cols = st.columns(5, gap="small")
    for i, (icon, name, desc) in enumerate(pref_data):
        with cols[i]:
            st.markdown(f"""
            <div style="
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,152,0,0.22);
                border-radius: 12px;
                padding: 1rem 0.6rem;
                text-align: center;
                margin-bottom: 0.8rem;
            ">
                <div style="font-size:2rem">{icon}</div>
                <div style="color:#FFCC02;font-weight:600;
                            margin:0.3rem 0;font-size:0.9rem">{name}</div>
                <div style="color:rgba(255,255,255,0.55);
                            font-size:0.75rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # Venue type preview grid
    st.markdown("### 🏪 What You Can Discover")
    venue_data = [
        ("🍽️", "Famous Restaurants",       "Iconic establishments with must-try signatures"),
        ("🛺", "Street Food Stalls",        "The real local experience, best eaten standing up"),
        ("☕", "Cafés",                     "Chill spots for breakfast, coffee & light bites"),
        ("🍛", "Local Dhabas",              "No-frills roadside food, maximum flavour"),
        ("🥂", "Fine Dining",               "Curated menus, ambience and chef specials"),
        ("🌆", "Rooftop Restaurants",       "Views + food — the ultimate combo"),
        ("🍱", "Canteens / Thali Places",   "Unlimited meals at unbeatable value"),
        ("🥐", "Bakeries",                  "Fresh bread, pastries and local baked goods"),
        ("🍮", "Sweet Shops",               "Mithai, halwa, local desserts and more"),
        ("🌙", "Night Food Markets",        "When the city eats after dark"),
    ]
    cols2 = st.columns(3)
    for i, (icon, name, desc) in enumerate(venue_data):
        with cols2[i % 3]:
            st.markdown(f"""
            <div style="
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,152,0,0.18);
                border-radius: 12px;
                padding: 0.9rem 1rem;
                margin-bottom: 0.75rem;
            ">
                <span style="font-size:1.4rem">{icon}</span>
                <span style="color:#FFCC02;font-weight:600;
                             margin-left:0.5rem">{name}</span>
                <div style="color:rgba(255,255,255,0.55);
                            font-size:0.8rem;margin-top:0.3rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;color:rgba(255,255,255,0.42);
                font-size:0.9rem;padding:1rem 0;">
        🍽️ Enter your destination above and click <strong>Explore Food</strong>
        to get your personalised local food guide
    </div>
    """, unsafe_allow_html=True)
