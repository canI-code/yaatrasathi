# ============================================================
#  YatraSathi — OpenWeatherMap API Helper
# ============================================================

import os
import requests
import streamlit as st
from datetime import datetime

# ── API Key ──────────────────────────────────────────────────
try:
    WEATHER_API_KEY = st.secrets["WEATHER_API_KEY"]
except Exception:
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "cfc8b6fe4b1c70997b78b57d4454eaa2")

# ── Base URLs ────────────────────────────────────────────────
BASE_URL      = "https://api.openweathermap.org/data/2.5"
CURRENT_URL   = f"{BASE_URL}/weather"
FORECAST_URL  = f"{BASE_URL}/forecast"
GEOCODING_URL = "http://api.openweathermap.org/geo/1.0/direct"
ICON_URL      = "https://openweathermap.org/img/wn/{icon}@2x.png"

# ── Default Request Timeout (seconds) ───────────────────────
TIMEOUT = 10


# ─────────────────────────────────────────────────────────────
#  Current Weather
# ─────────────────────────────────────────────────────────────
@st.cache_data(ttl=600, show_spinner=False)   # cache 10 minutes
def get_weather(city_name: str) -> dict | None:
    """
    Fetch current weather data for *city_name*.

    Returns
    -------
    dict with keys:
        city, country, temp, feels_like, temp_min, temp_max,
        humidity, pressure, description, icon, icon_url,
        wind_speed, wind_deg, visibility, sunrise, sunset,
        lat, lon
    Returns ``None`` on failure (error shown via ``st.error``).
    """
    params = {
        "q":     city_name,
        "appid": WEATHER_API_KEY,
        "units": "metric",
    }
    try:
        resp = requests.get(CURRENT_URL, params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        icon_code = data["weather"][0]["icon"]
        return {
            "city":        data["name"],
            "country":     data["sys"]["country"],
            "lat":         data["coord"]["lat"],
            "lon":         data["coord"]["lon"],
            "temp":        round(data["main"]["temp"], 1),
            "feels_like":  round(data["main"]["feels_like"], 1),
            "temp_min":    round(data["main"]["temp_min"], 1),
            "temp_max":    round(data["main"]["temp_max"], 1),
            "humidity":    data["main"]["humidity"],
            "pressure":    data["main"]["pressure"],
            "description": data["weather"][0]["description"].title(),
            "icon":        icon_code,
            "icon_url":    ICON_URL.format(icon=icon_code),
            "wind_speed":  data["wind"]["speed"],
            "wind_deg":    data["wind"].get("deg", 0),
            "visibility":  data.get("visibility", 0) // 1000,   # km
            "sunrise":     datetime.fromtimestamp(data["sys"]["sunrise"]).strftime("%H:%M"),
            "sunset":      datetime.fromtimestamp(data["sys"]["sunset"]).strftime("%H:%M"),
        }
    except requests.exceptions.HTTPError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            st.error(f"🔴 City **{city_name}** not found. Please check the spelling.")
        else:
            st.error(f"🔴 Weather API HTTP error: {exc}")
        return None
    except requests.exceptions.ConnectionError:
        st.error("🔴 No internet connection. Please check your network.")
        return None
    except requests.exceptions.Timeout:
        st.error("🔴 Weather API timed out. Please try again.")
        return None
    except Exception as exc:
        st.error(f"🔴 Unexpected weather error: {exc}")
        return None


# ─────────────────────────────────────────────────────────────
#  5-Day / 3-Hour Forecast  →  aggregated to daily summaries
# ─────────────────────────────────────────────────────────────
@st.cache_data(ttl=1800, show_spinner=False)   # cache 30 minutes
def get_forecast(city_name: str) -> list[dict] | None:
    """
    Fetch the 5-day / 3-hour forecast and aggregate to daily summaries.

    Returns
    -------
    list of dicts (up to 5 days), each with:
        date, day_name, temp_min, temp_max, humidity,
        description, icon, icon_url, wind_speed
    Returns ``None`` on failure.
    """
    params = {
        "q":     city_name,
        "appid": WEATHER_API_KEY,
        "units": "metric",
        "cnt":   40,        # 5 days × 8 slots
    }
    try:
        resp = requests.get(FORECAST_URL, params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        # Aggregate 3-hour slots into daily buckets
        daily: dict[str, dict] = {}
        for item in data["list"]:
            dt      = datetime.fromtimestamp(item["dt"])
            day_key = dt.strftime("%Y-%m-%d")
            temp    = item["main"]["temp"]
            if day_key not in daily:
                daily[day_key] = {
                    "date":        day_key,
                    "day_name":    dt.strftime("%A"),
                    "temps":       [],
                    "humidity":    item["main"]["humidity"],
                    "description": item["weather"][0]["description"].title(),
                    "icon":        item["weather"][0]["icon"],
                    "wind_speed":  item["wind"]["speed"],
                }
            daily[day_key]["temps"].append(temp)

        results = []
        for day_key, info in daily.items():
            temps = info.pop("temps")
            icon_code = info["icon"]
            info["temp_min"]  = round(min(temps), 1)
            info["temp_max"]  = round(max(temps), 1)
            info["icon_url"]  = ICON_URL.format(icon=icon_code)
            results.append(info)

        return results[:5]   # ensure max 5 days

    except requests.exceptions.HTTPError as exc:
        if exc.response is not None and exc.response.status_code == 404:
            st.error(f"🔴 City **{city_name}** not found. Please check the spelling.")
        else:
            st.error(f"🔴 Forecast API HTTP error: {exc}")
        return None
    except requests.exceptions.ConnectionError:
        st.error("🔴 No internet connection. Please check your network.")
        return None
    except requests.exceptions.Timeout:
        st.error("🔴 Forecast API timed out. Please try again.")
        return None
    except Exception as exc:
        st.error(f"🔴 Unexpected forecast error: {exc}")
        return None
