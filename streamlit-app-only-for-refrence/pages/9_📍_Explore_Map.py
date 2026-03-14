"""
YatraSathi ✈️ — Page 9: Explore Map
Interactive map with AI-discovered attractions, geopy geocoding & place table
"""

import streamlit as st
from utils.gemini_helper import get_gemini_response

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()


try:
    import folium
    from streamlit_folium import st_folium
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut, GeocoderServiceError
    _FOLIUM_OK = True
except ImportError:
    _FOLIUM_OK = False

# ─────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Explore Map — YatraSathi",
    page_icon="📍",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(135deg, #00120d, #001f15, #000e09);
    min-height: 100vh;
}
[data-testid="stSidebar"] { background: rgba(255,255,255,0.04); }

.map-hero {
    text-align: center;
    padding: 2.6rem 1rem 1.6rem;
    background: linear-gradient(135deg,
        rgba(0,150,136,0.16), rgba(76,175,80,0.10));
    border-radius: 20px;
    border: 1px solid rgba(0,200,150,0.28);
    margin-bottom: 2rem;
}
.map-hero h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #80CBC4, #A5D6A7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}
.map-hero p { color: rgba(255,255,255,0.70); font-size: 1.1rem; }

.filter-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(0,200,150,0.20);
    border-radius: 16px;
    padding: 1.5rem 1.8rem 1rem;
    margin-bottom: 1.5rem;
}
.place-row {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(0,200,150,0.18);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
}
div.stButton > button {
    background: linear-gradient(135deg, #00695C, #388E3C) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    padding: 0.55rem 2rem !important;
}
hr { border-color: rgba(0,200,150,0.15) !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────────────────────
CATEGORY_OPTIONS = [
    "Tourist Places",
    "Hotels",
    "Restaurants",
    "Hospitals",
    "Police Stations",
    "Railway Station",
    "Airport",
    "Bus Stand",
]

CAT_COLOR = {
    "tourist":  "blue",
    "hotel":    "green",
    "restaur":  "orange",
    "food":     "orange",
    "hospital": "red",
    "police":   "darkblue",
    "railway":  "purple",
    "train":    "purple",
    "airport":  "purple",
    "bus":      "purple",
    "transport":"purple",
}

CAT_EMOJI = {
    "tourist":  "🏛️",
    "hotel":    "🏨",
    "restaur":  "🍽️",
    "food":     "🍽️",
    "hospital": "🏥",
    "police":   "👮",
    "railway":  "🚉",
    "train":    "🚉",
    "airport":  "✈️",
    "bus":      "🚌",
    "transport":"🚌",
}

CAT_BADGE = {
    "blue":     ("#1565C0", "#E3F2FD"),
    "green":    ("#2E7D32", "#E8F5E9"),
    "orange":   ("#E65100", "#FFF3E0"),
    "red":      ("#B71C1C", "#FFEBEE"),
    "darkblue": ("#0D47A1", "#E8EAF6"),
    "purple":   ("#4A148C", "#F3E5F5"),
}


def resolve_color(category: str) -> str:
    c = category.lower()
    for kw, col in CAT_COLOR.items():
        if kw in c:
            return col
    return "blue"


def resolve_emoji(category: str) -> str:
    c = category.lower()
    for kw, em in CAT_EMOJI.items():
        if kw in c:
            return em
    return "📍"


# ─────────────────────────────────────────────────────────────
#  GEOCODER
# ─────────────────────────────────────────────────────────────
@st.cache_data(ttl=86400, show_spinner=False)
def geocode_city(city: str):
    try:
        geo = Nominatim(user_agent="yatrasathi_map_v2", timeout=10)
        loc = geo.geocode(city)
        if loc:
            return (loc.latitude, loc.longitude)
        return None
    except (GeocoderTimedOut, GeocoderServiceError):
        return None
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────
#  AI PROMPTS
# ─────────────────────────────────────────────────────────────
def build_places_prompt(destination: str, selected: list) -> str:
    cats_str = ", ".join(selected)
    return (
        f"List 10-15 famous places in {destination} covering these categories: {cats_str}.\n\n"
        "Return ONLY in this EXACT pipe-delimited format — NO other text, NO markdown, NO numbering:\n"
        "PLACE_NAME|LATITUDE|LONGITUDE|CATEGORY|SHORT_DESCRIPTION\n\n"
        "Rules:\n"
        f"- LATITUDE and LONGITUDE must be real decimal GPS coordinates for {destination}\n"
        "- CATEGORY must be one of: Tourist Place, Hotel, Restaurant, Hospital, "
        "Police Station, Railway Station, Airport, Bus Stand\n"
        "- SHORT_DESCRIPTION must be one sentence (max 15 words)\n"
        f"- Only include categories the user selected: {cats_str}\n"
        "- Every line must have exactly 5 pipe-separated fields\n\n"
        "Example line:\n"
        "Gateway of India|18.9220|72.8347|Tourist Place|Iconic arch monument overlooking the Arabian Sea\n\n"
        f"Now list 10-15 places in {destination}:"
    )


def build_overview_prompt(destination: str) -> str:
    return (
        f"Give a brief 5-line overview of {destination} as a travel destination. "
        "Include: what it is famous for, what it is best known as, "
        "the must-do activity, best time to visit, and one fun fact. "
        "Keep it conversational and engaging."
    )


# ─────────────────────────────────────────────────────────────
#  PARSER
# ─────────────────────────────────────────────────────────────
def parse_places(raw: str):
    places, bad = [], []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) != 5:
            bad.append(line)
            continue
        name, lat_s, lon_s, cat, desc = parts
        try:
            lat = float(lat_s)
            lon = float(lon_s)
        except ValueError:
            bad.append(line)
            continue
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            bad.append(line)
            continue
        places.append({
            "name":        name,
            "lat":         lat,
            "lon":         lon,
            "category":    cat,
            "description": desc,
            "color":       resolve_color(cat),
            "emoji":       resolve_emoji(cat),
        })
    return places, bad


# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("map_dest", "map_places", "map_raw", "map_center", "map_overview"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  SECTION 1 — HEADER
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="map-hero">
    <h1>📍 Explore on Map</h1>
    <p>Visualize your destination and discover nearby attractions</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  DEPENDENCY CHECK
# ─────────────────────────────────────────────────────────────
if not _FOLIUM_OK:
    st.error(
        "⚠️ Map libraries not installed. Run:\n"
        "```\n.venv\\Scripts\\pip install folium streamlit-folium geopy\n```"
    )
    st.stop()

# ─────────────────────────────────────────────────────────────
#  SECTION 2 — INPUT
# ─────────────────────────────────────────────────────────────
st.markdown('<div class="filter-card">', unsafe_allow_html=True)

col1, col2 = st.columns(2, gap="medium")
with col1:
    destination = st.text_input(
        "🌍 Destination",
        value=st.session_state["map_dest"] or "",
        placeholder="e.g. Jaipur, Mumbai, Paris, Bangkok…",
    )
with col2:
    selected_cats = st.multiselect(
        "🏷️ What to Show on Map",
        options=CATEGORY_OPTIONS,
        default=["Tourist Places", "Hotels", "Restaurants"],
    )

show_clicked = st.button("📍 Show on Map", use_container_width=False)
st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
#  PROCESS ON BUTTON CLICK
# ─────────────────────────────────────────────────────────────
if show_clicked:
    if not destination.strip():
        st.error("⚠️ Please enter a destination city.")
    elif not selected_cats:
        st.error("⚠️ Please select at least one category.")
    else:
        city = destination.strip()
        with st.spinner(f"📡 Locating **{city}** on the map…"):
            coords = geocode_city(city)
        if coords is None:
            st.error(
                f"😔 Could not find **{city}** on the map. "
                "Try using the full English name (e.g. 'Bengaluru' instead of 'Bangalore')."
            )
        else:
            with st.spinner(f"🤖 Discovering places in {city}…"):
                raw = get_gemini_response(
                    build_places_prompt(city, selected_cats), temperature=0.3
                )
            places, _ = parse_places(raw) if raw else ([], [])
            st.session_state.update({
                "map_dest":    city,
                "map_center":  coords,
                "map_places":  places,
                "map_raw":     raw or "",
                "map_overview":None,
            })
            st.rerun()

# ─────────────────────────────────────────────────────────────
#  SECTION 3 — MAP + RESULTS
# ─────────────────────────────────────────────────────────────
if st.session_state.get("map_center"):
    city       = st.session_state["map_dest"]
    lat_c, lon_c = st.session_state["map_center"]
    places     = st.session_state["map_places"] or []
    raw        = st.session_state["map_raw"] or ""

    st.markdown("---")
    st.markdown(f"### 🗺️ {city} — Interactive Map")

    # Category chips
    unique_cats = sorted({p["category"] for p in places})
    if unique_cats:
        chips = " &nbsp; ".join(
            f'<span style="background:rgba(0,200,150,0.12);'
            f'border:1px solid rgba(0,200,150,0.35);border-radius:20px;'
            f'padding:2px 12px;font-size:0.78rem;color:#80CBC4;">'
            f'{resolve_emoji(c)} {c} ({sum(1 for p in places if p["category"]==c)})</span>'
            for c in unique_cats
        )
        st.markdown(f'<div style="margin-bottom:0.8rem">{chips}</div>',
                    unsafe_allow_html=True)

    # Build folium map
    try:
        fmap = folium.Map(
            location=[lat_c, lon_c],
            zoom_start=12,
            tiles="CartoDB dark_matter",
        )

        # City centre marker
        folium.Marker(
            location=[lat_c, lon_c],
            popup=folium.Popup(f"<b>📍 {city} City Centre</b>", max_width=200),
            tooltip=f"📍 {city} Centre",
            icon=folium.Icon(color="cadetblue", icon="home", prefix="glyphicon"),
        ).add_to(fmap)

        # Place markers
        for p in places:
            popup_html = (
                f"<div style='font-family:sans-serif;min-width:180px'>"
                f"<b style='font-size:0.95rem'>{p['emoji']} {p['name']}</b>"
                f"<hr style='margin:4px 0'>"
                f"<span style='background:#eee;padding:1px 8px;border-radius:8px;"
                f"font-size:0.72rem;color:#333'>{p['category']}</span>"
                f"<p style='font-size:0.8rem;color:#444;margin:6px 0 2px'>{p['description']}</p>"
                f"<p style='font-size:0.72rem;color:#888'>"
                f"📌 {p['lat']:.4f}, {p['lon']:.4f}</p>"
                f"</div>"
            )
            folium.Marker(
                location=[p["lat"], p["lon"]],
                popup=folium.Popup(popup_html, max_width=240),
                tooltip=f"{p['emoji']} {p['name']}",
                icon=folium.Icon(
                    color=p["color"],
                    icon="info-sign",
                    prefix="glyphicon",
                ),
            ).add_to(fmap)

        st_folium(fmap, width="100%", height=520, returned_objects=[])

    except Exception as exc:
        st.warning(f"⚠️ Map rendering error: {exc}")

    # Place table
    st.markdown("---")
    st.markdown(f"### 📋 Places Found in {city} ({len(places)})")

    if places:
        tab_labels = ["All"] + unique_cats
        tabs = st.tabs(tab_labels)

        def _render(lst):
            for i, p in enumerate(lst, 1):
                bg, fg = CAT_BADGE.get(p["color"], ("#333", "#fff"))
                st.markdown(
                    f'<div class="place-row">'
                    f'<b style="color:#80CBC4">#{i}</b> &nbsp; '
                    f'{p["emoji"]} <b style="color:#fff">{p["name"]}</b> &nbsp;'
                    f'<span style="background:{bg};color:{fg};padding:1px 9px;'
                    f'border-radius:12px;font-size:0.72rem">{p["category"]}</span>'
                    f'<br><span style="color:rgba(255,255,255,0.5);font-size:0.8rem">'
                    f'{p["description"]}</span>'
                    f'<br><span style="color:rgba(255,255,255,0.28);font-size:0.7rem">'
                    f'📌 {p["lat"]:.5f}, {p["lon"]:.5f}</span>'
                    f'</div>',
                    unsafe_allow_html=True,
                )

        with tabs[0]:
            _render(places)
        for i, cat in enumerate(unique_cats, 1):
            with tabs[i]:
                _render([p for p in places if p["category"] == cat])

    elif raw:
        st.info("ℹ️ Could not parse structured data. Showing raw AI response.")
        st.markdown(raw)
    else:
        st.warning("No places returned. Try a different destination.")

    # Colour legend
    st.markdown("---")
    legend_items = [
        ("🔵", "Tourist Place", "blue"),
        ("🟢", "Hotel",         "green"),
        ("🟠", "Restaurant",    "orange"),
        ("🔴", "Hospital",      "red"),
        ("🔷", "Police Station","darkblue"),
        ("🟣", "Transport",     "purple"),
    ]
    legend_html = " &nbsp;|&nbsp; ".join(
        f'{dot} <span style="color:rgba(255,255,255,0.75);font-size:0.82rem">{lbl}</span>'
        for dot, lbl, _ in legend_items
    )
    st.markdown(
        f'<div style="background:rgba(255,255,255,0.04);border-radius:10px;'
        f'padding:0.6rem 1rem;margin-bottom:0.5rem">'
        f'🗝️ &nbsp; {legend_html}</div>',
        unsafe_allow_html=True,
    )

    # ─────────────────────────────────────────────────────────
    #  SECTION 4 — AI DESTINATION OVERVIEW
    # ─────────────────────────────────────────────────────────
    st.markdown("---")
    with st.expander(f"📖 About {city}", expanded=False):
        if not st.session_state.get("map_overview"):
            with st.spinner(f"📝 Generating overview of {city}…"):
                overview = get_gemini_response(
                    build_overview_prompt(city), temperature=0.6
                )
                st.session_state["map_overview"] = overview or "_Could not load overview._"
        st.markdown(st.session_state["map_overview"])

    st.markdown("---")
    if st.button("🔄 Search Another Destination"):
        for k in ("map_dest","map_places","map_raw","map_center","map_overview"):
            st.session_state[k] = None
        st.rerun()

    st.info(
        "💡 Click any pin on the map for name, category & description. "
        "For itinerary planning, open **🤖 AI Trip Planner**.",
        icon="📍",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")
    st.markdown("### 🗺️ How It Works")

    steps = [
        ("1️⃣", "Enter Destination",  "Type any city — Indian or international"),
        ("2️⃣", "Pick Categories",    "Tourist Places, Hotels, Restaurants & more"),
        ("3️⃣", "AI Discovers",       "Groq AI finds 10–15 real places with GPS coords"),
        ("4️⃣", "Map Renders",        "Folium plots colour-coded pins interactively"),
        ("5️⃣", "Click Pins",         "Each pin shows name, category & description"),
        ("6️⃣", "Read Overview",      "5-line AI travel summary inside the expander"),
    ]
    s_cols = st.columns(3, gap="medium")
    for i, (num, title, desc) in enumerate(steps):
        with s_cols[i % 3]:
            st.markdown(
                f'<div style="background:rgba(255,255,255,0.04);'
                f'border:1px solid rgba(0,200,150,0.18);border-radius:12px;'
                f'padding:1.1rem;text-align:center;margin-bottom:0.75rem;">'
                f'<div style="font-size:1.8rem">{num}</div>'
                f'<div style="color:#80CBC4;font-weight:700;font-size:0.9rem;'
                f'margin:0.3rem 0 0.2rem">{title}</div>'
                f'<div style="color:rgba(255,255,255,0.45);font-size:0.8rem">{desc}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )

    st.markdown("---")
    st.markdown("### 🗝️ Marker Colour Guide")
    leg_cols = st.columns(3, gap="medium")
    leg_info = [
        ("🔵", "Tourist Places", "Monuments, parks, landmarks"),
        ("🟢", "Hotels",         "Stays & accommodation"),
        ("🟠", "Restaurants",    "Food & dining spots"),
        ("🔴", "Hospitals",      "Emergency & healthcare"),
        ("🔷", "Police Stations","Law enforcement"),
        ("🟣", "Transport Hubs", "Railways, airports, bus stands"),
    ]
    for i, (dot, label, desc) in enumerate(leg_info):
        with leg_cols[i % 3]:
            st.markdown(
                f'<div style="background:rgba(255,255,255,0.04);'
                f'border:1px solid rgba(0,200,150,0.14);border-radius:10px;'
                f'padding:0.7rem 1rem;margin-bottom:0.5rem;display:flex;'
                f'align-items:center;gap:0.6rem">'
                f'<span style="font-size:1.2rem">{dot}</span>'
                f'<div><div style="color:#fff;font-weight:600;font-size:0.85rem">{label}</div>'
                f'<div style="color:rgba(255,255,255,0.4);font-size:0.76rem">{desc}</div>'
                f'</div></div>',
                unsafe_allow_html=True,
            )

    st.markdown("---")
    st.markdown(
        '<div style="text-align:center;color:rgba(255,255,255,0.38);'
        'font-size:0.92rem;padding:0.5rem 0 1rem">'
        '🌍 Enter a destination above and click '
        '<strong style="color:rgba(255,255,255,0.65)">📍 Show on Map</strong> '
        'to generate an AI-curated interactive map</div>',
        unsafe_allow_html=True,
    )
