"""
YatraSathi ✈️ — Page 8: Live Weather
Real-time weather powered by OpenWeatherMap + AI travel analysis
"""

import streamlit as st
from utils.weather_helper import get_weather, get_forecast
from utils.gemini_helper  import get_gemini_response

from utils.styles import load_global_css, sidebar_branding
load_global_css()
sidebar_branding()


# ─────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Live Weather — YatraSathi",
    page_icon="🌤️",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────
WIND_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
             "S","SSW","SW","WSW","W","WNW","NW","NNW"]

def deg_to_dir(deg: int) -> str:
    return WIND_DIRS[round(deg / 22.5) % 16]

def weather_theme(description: str) -> dict:
    """Return gradient colours + accent based on weather description."""
    desc = description.lower()
    if any(w in desc for w in ["clear","sunny","sun"]):
        return {
            "bg1": "#1a0a00", "bg2": "#2d1600", "bg3": "#1a0a00",
            "card_from": "rgba(255,167,38,0.18)", "card_to": "rgba(255,111,0,0.10)",
            "border": "rgba(255,167,38,0.35)", "accent": "#FFB300",
            "grad_card": "linear-gradient(135deg,rgba(255,193,7,0.15),rgba(255,152,0,0.08))",
        }
    elif any(w in desc for w in ["rain","drizzle","shower","thunder","storm"]):
        return {
            "bg1": "#00101f", "bg2": "#001a35", "bg3": "#000d18",
            "card_from": "rgba(3,169,244,0.18)", "card_to": "rgba(0,96,170,0.10)",
            "border": "rgba(3,169,244,0.38)", "accent": "#29B6F6",
            "grad_card": "linear-gradient(135deg,rgba(3,169,244,0.15),rgba(0,96,170,0.08))",
        }
    elif any(w in desc for w in ["cloud","overcast","mist","fog","haze","smoke","dust"]):
        return {
            "bg1": "#0d0d14", "bg2": "#151520", "bg3": "#090910",
            "card_from": "rgba(120,120,160,0.18)", "card_to": "rgba(80,80,120,0.10)",
            "border": "rgba(150,150,200,0.30)", "accent": "#90A4AE",
            "grad_card": "linear-gradient(135deg,rgba(120,130,160,0.15),rgba(80,90,120,0.08))",
        }
    elif any(w in desc for w in ["snow","sleet","blizzard","ice"]):
        return {
            "bg1": "#00101a", "bg2": "#001525", "bg3": "#000d14",
            "card_from": "rgba(176,224,230,0.18)", "card_to": "rgba(100,181,246,0.10)",
            "border": "rgba(176,224,230,0.38)", "accent": "#B2EBF2",
            "grad_card": "linear-gradient(135deg,rgba(176,224,230,0.15),rgba(100,181,246,0.08))",
        }
    else:  # default blue
        return {
            "bg1": "#001025", "bg2": "#001d40", "bg3": "#000a1e",
            "card_from": "rgba(2,119,189,0.18)", "card_to": "rgba(3,169,244,0.10)",
            "border": "rgba(3,169,244,0.35)", "accent": "#4FC3F7",
            "grad_card": "linear-gradient(135deg,rgba(3,169,244,0.15),rgba(1,87,155,0.08))",
        }

def inject_css(theme: dict) -> None:
    a = theme["accent"]
    st.markdown(f"""
<style>
[data-testid="stAppViewContainer"] {{
    background: linear-gradient(135deg, {theme['bg1']}, {theme['bg2']}, {theme['bg3']});
    min-height: 100vh;
}}
[data-testid="stSidebar"] {{ background: rgba(255,255,255,0.04); }}

.wth-hero {{
    text-align: center;
    padding: 2.6rem 1rem 1.6rem;
    background: linear-gradient(135deg, {theme['card_from']}, {theme['card_to']});
    border-radius: 20px;
    border: 1px solid {theme['border']};
    margin-bottom: 2rem;
}}
.wth-hero h1 {{
    font-size: 2.8rem; font-weight: 800;
    background: linear-gradient(135deg, {a}, #fff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 0.3rem;
}}
.wth-hero p {{ color: rgba(255,255,255,0.72); font-size: 1.1rem; }}

.weather-card {{
    border-radius: 18px;
    padding: 1.5rem 1.2rem;
    text-align: center;
    background: {theme['grad_card']};
    border: 1px solid {theme['border']};
    margin-bottom: 0.75rem;
    transition: transform .15s;
}}
.weather-card:hover {{ transform: translateY(-2px); }}
.wc-icon   {{ font-size: 2rem; margin-bottom: 0.3rem; }}
.wc-val    {{ font-size: 1.9rem; font-weight: 900; color: #fff; line-height: 1; }}
.wc-delta  {{ font-size: 0.78rem; color: {a}; margin: 0.2rem 0; }}
.wc-label  {{ font-size: 0.72rem; color: rgba(255,255,255,0.45);
              text-transform: uppercase; letter-spacing: .06em; }}

.forecast-card {{
    background: {theme['grad_card']};
    border: 1px solid {theme['border']};
    border-radius: 14px;
    padding: 1rem 0.8rem;
    text-align: center;
}}
.fcast-day  {{ color: {a}; font-weight: 700; font-size: 0.88rem; }}
.fcast-desc {{ color: rgba(255,255,255,0.58); font-size: 0.74rem; margin: 0.25rem 0; }}
.fcast-hi   {{ color: #fff; font-weight: 700; font-size: 1rem; }}
.fcast-lo   {{ color: rgba(255,255,255,0.42); font-size: 0.82rem; }}

.analysis-card {{
    background: rgba(0,8,20,0.92);
    border: 1px solid {theme['border']};
    border-radius: 16px;
    padding: 1.8rem 2.2rem;
    line-height: 1.85;
    margin-top: 0.5rem;
}}

/* Button */
div.stButton > button {{
    background: linear-gradient(135deg, {theme['bg2']}, {a}22) !important;
    color: #fff !important;
    border: 1px solid {theme['border']} !important;
    border-radius: 12px !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    padding: 0.6rem 2rem !important;
    transition: all .2s !important;
}}
div.stButton > button:hover {{
    background: linear-gradient(135deg, {a}55, {a}22) !important;
    border-color: {a} !important;
}}
hr {{ border-color: {theme['border']} !important; }}
</style>
""", unsafe_allow_html=True)

def build_ai_prompt(city: str, country: str, temp: float, feels: float,
                    hum: int, wind_kmh: float, desc: str, fc: list) -> str:
    forecast_lines = ""
    if fc:
        for f in fc[:5]:
            forecast_lines += (f"\n  • {f['day_name']} {f['date']}: "
                               f"{f['temp_min']}–{f['temp_max']}°C, {f['description']}")
    return f"""Current weather in {city}, {country}:
Temperature {temp}°C (feels like {feels}°C), Humidity {hum}%, Wind {wind_kmh} km/h, Condition: {desc}.

5-day forecast:{forecast_lines}

Based on this CURRENT weather, provide:

## 🌤️ WEATHER ANALYSIS FOR {city}

### 👕 WHAT TO WEAR TODAY
- Specific clothing recommendations based on the current {temp}°C / {desc} conditions (3-4 bullet points)

### 🎒 WHAT TO CARRY
- Umbrella needed? Sunscreen? Jacket? Water bottle? (3-4 bullet points — be specific)

### 📍 WEATHER-APPROPRIATE ACTIVITIES
- 5 activities that are PERFECT for today's weather in {city} (mention indoor alternatives if weather is bad)

### ⚠️ WEATHER WARNINGS
- Any precautions or health tips based on current conditions (humidity, wind, UV, etc.)

### 📅 COMING WEEK OUTLOOK
- Brief summary of what the 5-day forecast means for a traveller in {city}

Keep it concise and practical. 3-4 lines per section max.
"""

# ─────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────
for _k in ("wx_city","wx_data","wx_forecast","wx_analysis"):
    if _k not in st.session_state:
        st.session_state[_k] = None

# ─────────────────────────────────────────────────────────────
#  DETERMINE THEME (default or from loaded weather)
# ─────────────────────────────────────────────────────────────
_theme = weather_theme(
    st.session_state["wx_data"]["description"]
    if st.session_state.get("wx_data") else "clear"
)
inject_css(_theme)
_accent = _theme["accent"]

# ─────────────────────────────────────────────────────────────
#  SECTION 1 — HEADER
# ─────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="wth-hero">
    <h1>🌤️ Live Weather Check</h1>
    <p>Real-time weather data powered by OpenWeatherMap API</p>
</div>
""", unsafe_allow_html=True)

st.success("🔴 **LIVE** — Real-time data from OpenWeatherMap API · Updates every 10 minutes")

# ─────────────────────────────────────────────────────────────
#  SECTION 2 — INPUT
# ─────────────────────────────────────────────────────────────
col_inp, col_btn = st.columns([5, 1], gap="small")
with col_inp:
    city_input = st.text_input(
        "Destination City",
        value=st.session_state["wx_city"] or "",
        placeholder="Enter a city — Mumbai, Paris, New York, Dubai, Tokyo…",
        label_visibility="collapsed",
        key="wx_city_input",
    )
with col_btn:
    check_clicked = st.button("🌤️ Check Weather", use_container_width=True)

# ─────────────────────────────────────────────────────────────
#  FETCH DATA ON BUTTON CLICK
# ─────────────────────────────────────────────────────────────
if check_clicked:
    city_clean = city_input.strip()
    if not city_clean:
        st.error("⚠️ Please enter a city name.")
    else:
        with st.spinner(f"📡 Fetching live weather for **{city_clean}**…"):
            wx   = get_weather(city_clean)
            fc   = get_forecast(city_clean)

        if wx is None:
            # weather_helper already called st.error — add friendly fallback
            st.error(
                "😔 City not found. Try using the English name of the city "
                "(e.g. 'Mumbai' instead of 'Bombay', 'Chennai' instead of 'Madras')."
            )
        else:
            st.session_state["wx_city"]     = city_clean
            st.session_state["wx_data"]     = wx
            st.session_state["wx_forecast"] = fc or []
            st.session_state["wx_analysis"] = None   # reset AI analysis
            # Re-inject CSS with correct weather theme
            new_theme = weather_theme(wx["description"])
            inject_css(new_theme)
            st.rerun()

# ─────────────────────────────────────────────────────────────
#  SECTION 3 — WEATHER DISPLAY
# ─────────────────────────────────────────────────────────────
if st.session_state.get("wx_data"):
    w   = st.session_state["wx_data"]
    fc  = st.session_state.get("wx_forecast") or []
    a   = _accent
    wind_kmh = round(w["wind_speed"] * 3.6, 1)

    st.markdown("---")

    # ── City banner ─────────────────────────────────────────
    col_city, col_icon = st.columns([3, 1], gap="small")
    with col_city:
        st.markdown(f"""
        <div>
            <div style="font-size:2.2rem;font-weight:900;color:#fff;line-height:1.1">
                {w['city']}
                <span style="font-size:1rem;font-weight:400;
                             color:rgba(255,255,255,0.4);margin-left:0.4rem">
                    {w['country']}
                </span>
            </div>
            <div style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin-top:0.2rem">
                📍 {w['lat']:.4f}°, {w['lon']:.4f}° &nbsp;·&nbsp;
                🌅 {w['sunrise']} &nbsp;·&nbsp; 🌇 {w['sunset']}
            </div>
        </div>
        """, unsafe_allow_html=True)
    with col_icon:
        st.image(w["icon_url"], width=90)

    st.markdown(f"""
    <div style="font-size:4.5rem;font-weight:900;
                background:linear-gradient(135deg,{a},#fff);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                line-height:1;margin:0.5rem 0 0.2rem">
        {w['temp']}°C
    </div>
    <div style="color:rgba(255,255,255,0.55);font-size:1rem;margin-bottom:1.2rem">
        {w['description']} &nbsp;·&nbsp; {w['temp_min']}° / {w['temp_max']}°
    </div>
    """, unsafe_allow_html=True)

    # ── 4 Metric cards (st.metric) ───────────────────────────
    mc1, mc2, mc3, mc4 = st.columns(4, gap="medium")

    with mc1:
        st.markdown(f'<div class="weather-card"><div class="wc-icon">🌡️</div>', unsafe_allow_html=True)
        st.metric(label="Temperature", value=f"{w['temp']}°C",
                  delta=f"Feels like {w['feels_like']}°C")
        st.markdown('</div>', unsafe_allow_html=True)

    with mc2:
        st.markdown(f'<div class="weather-card"><div class="wc-icon">💧</div>', unsafe_allow_html=True)
        st.metric(label="Humidity", value=f"{w['humidity']}%",
                  delta=f"Pressure {w['pressure']} hPa")
        st.markdown('</div>', unsafe_allow_html=True)

    with mc3:
        st.markdown(f'<div class="weather-card"><div class="wc-icon">💨</div>', unsafe_allow_html=True)
        st.metric(label="Wind Speed", value=f"{wind_kmh} km/h",
                  delta=deg_to_dir(w["wind_deg"]))
        st.markdown('</div>', unsafe_allow_html=True)

    with mc4:
        st.markdown(f'<div class="weather-card"><div class="wc-icon">👁️</div>', unsafe_allow_html=True)
        st.metric(label="Condition", value=w["description"].split()[0].title(),
                  delta=f"{w['visibility']} km visibility")
        st.markdown('</div>', unsafe_allow_html=True)

    # ── 5-Day Forecast ───────────────────────────────────────
    if fc:
        st.markdown("---")
        st.markdown("### 📅 5-Day Forecast")
        f_cols = st.columns(len(fc), gap="small")
        for col, day in zip(f_cols, fc):
            with col:
                st.markdown(f"""
                <div class="forecast-card">
                    <div class="fcast-day">{day['day_name'][:3].upper()}</div>
                    <div style="font-size:0.72rem;color:rgba(255,255,255,0.35);">
                        {day['date'][5:]}
                    </div>
                    <img src="{day['icon_url']}" width="52"
                         style="margin:0.35rem 0;display:block;margin-left:auto;margin-right:auto;">
                    <div class="fcast-desc">{day['description']}</div>
                    <div class="fcast-hi">{day['temp_max']}°</div>
                    <div class="fcast-lo">{day['temp_min']}°</div>
                    <div style="color:rgba(255,255,255,0.35);font-size:0.72rem;
                                margin-top:0.3rem">
                        💧{day['humidity']}% &nbsp; 💨{round(day['wind_speed']*3.6)}km/h
                    </div>
                </div>
                """, unsafe_allow_html=True)

    # ─────────────────────────────────────────────────────────
    #  SECTION 4 — AI WEATHER ANALYSIS
    # ─────────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("### 🤖 AI Weather Analysis")

    # Auto-generate if not yet done
    if not st.session_state.get("wx_analysis"):
        with st.spinner("🤖 Generating AI weather analysis…"):
            prompt = build_ai_prompt(
                city=w["city"], country=w["country"],
                temp=w["temp"], feels=w["feels_like"],
                hum=w["humidity"], wind_kmh=wind_kmh,
                desc=w["description"], fc=fc,
            )
            analysis = get_gemini_response(prompt, temperature=0.5)
            if analysis:
                st.session_state["wx_analysis"] = analysis
            else:
                st.warning("⚠️ Weather service temporarily unavailable. Please try again.")

    if st.session_state.get("wx_analysis"):
        st.markdown('<div class="analysis-card">', unsafe_allow_html=True)
        st.markdown(st.session_state["wx_analysis"])
        st.markdown('</div>', unsafe_allow_html=True)

        col_dl, col_re, _ = st.columns([1, 1, 3])
        with col_dl:
            report_text = (
                f"Weather Report — {w['city']}, {w['country']}\n"
                f"{'='*45}\n"
                f"Temperature : {w['temp']}°C (feels {w['feels_like']}°C)\n"
                f"Condition   : {w['description']}\n"
                f"Humidity    : {w['humidity']}%\n"
                f"Wind        : {wind_kmh} km/h {deg_to_dir(w['wind_deg'])}\n"
                f"Visibility  : {w['visibility']} km\n"
                f"Sunrise     : {w['sunrise']}  Sunset: {w['sunset']}\n"
                f"\n{'='*45}\n"
                f"AI ANALYSIS\n{'='*45}\n"
                f"{st.session_state['wx_analysis']}"
            )
            st.download_button(
                "⬇️ Download Report",
                data=report_text,
                file_name=f"weather_{w['city'].lower().replace(' ','_')}.txt",
                mime="text/plain",
                use_container_width=True,
            )
        with col_re:
            if st.button("🔄 Refresh Analysis", use_container_width=True):
                st.session_state["wx_analysis"] = None
                st.rerun()

    st.markdown("---")
    st.info(
        "📅 For **seasonal planning** (best months to visit), open **Best Time To Visit**. "
        "For a full itinerary, try **🤖 AI Trip Planner**.",
        icon="🌤️",
    )

# ─────────────────────────────────────────────────────────────
#  EMPTY STATE — shown before any search
# ─────────────────────────────────────────────────────────────
else:
    st.markdown("---")
    st.markdown("### 🌡️ What You'll See After Searching")

    preview = [
        ("🌡️", "Temperature",    "Current °C, feels-like & min/max"),
        ("💧",  "Humidity",       "% air moisture — key comfort factor"),
        ("💨",  "Wind Speed",     "km/h + compass direction"),
        ("👁️", "Visibility",     "Clear-sky distance in km"),
        ("📅",  "5-Day Forecast", "Daily high/low, condition & rain chance"),
        ("👕",  "What to Wear",  "AI-curated outfit advice for today's weather"),
        ("🎒",  "What to Carry", "Umbrella? Sunscreen? Jacket? — AI decides"),
        ("📍",  "Activities",    "5 weather-perfect things to do in your city"),
    ]
    p_cols = st.columns(4, gap="small")
    for i, (icon, name, desc) in enumerate(preview):
        with p_cols[i % 4]:
            st.markdown(f"""
            <div style="background:rgba(255,255,255,0.04);
                        border:1px solid rgba(3,169,244,0.18);
                        border-radius:12px;padding:1rem;
                        text-align:center;margin-bottom:0.8rem;">
                <div style="font-size:1.9rem;margin-bottom:0.3rem">{icon}</div>
                <div style="color:#4FC3F7;font-weight:600;
                            font-size:0.88rem;margin-bottom:0.2rem">{name}</div>
                <div style="color:rgba(255,255,255,0.42);font-size:0.76rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # Weather card style previews
    st.markdown("### 🎨 Dynamic Weather Themes")
    t_cols = st.columns(4, gap="small")
    themes_preview = [
        ("☀️", "Sunny",  "#FFB300", "Warm amber gradient"),
        ("🌧️", "Rainy",  "#29B6F6", "Cool ocean blue"),
        ("⛅", "Cloudy", "#90A4AE", "Soft grey-slate"),
        ("❄️", "Snow",   "#B2EBF2", "Ice crystal teal"),
    ]
    for col, (icon, label, color, desc) in zip(t_cols, themes_preview):
        with col:
            st.markdown(f"""
            <div style="background:linear-gradient(135deg,{color}22,{color}08);
                        border:1px solid {color}55;border-radius:12px;
                        padding:1rem;text-align:center;">
                <div style="font-size:2rem">{icon}</div>
                <div style="color:{color};font-weight:700;font-size:0.9rem">{label}</div>
                <div style="color:rgba(255,255,255,0.4);font-size:0.74rem;
                            margin-top:0.2rem">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center;color:rgba(255,255,255,0.38);
                font-size:0.92rem;padding:0.5rem 0 1rem">
        🌍 Enter any city above and press
        <strong style="color:rgba(255,255,255,0.65)">🌤️ Check Weather</strong>
        to get live data + AI travel advice
    </div>
    """, unsafe_allow_html=True)


