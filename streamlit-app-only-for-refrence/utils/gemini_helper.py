# ============================================================
#  YatraSathi — Groq AI Helper
#  Uses Groq SDK with Llama 3.3 70B (free tier: 14,400 req/day)
#  Get your free API key at: https://console.groq.com
# ============================================================

import os
import streamlit as st
from groq import Groq

# ── API Key ──────────────────────────────────────────────────
# Priority: Streamlit secrets → environment variable → hardcoded key
try:
    GROQ_API_KEY = st.secrets["GROQ_API_KEY"]
except Exception:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ── Model ────────────────────────────────────────────────────
# Options (all free tier):
#   llama-3.3-70b-versatile   — best quality (recommended)
#   llama-3.1-8b-instant      — fastest responses
#   mixtral-8x7b-32768        — great for long prompts
MODEL_NAME = "llama-3.3-70b-versatile"

# A single client instance reused across all calls
_client = Groq(api_key=GROQ_API_KEY)


def get_gemini_response(prompt: str, temperature: float = 0.7) -> str | None:
    """
    Send *prompt* to Groq and return the response text.
    Function name kept as get_gemini_response for backward compatibility.

    Parameters
    ----------
    prompt : str
        The full prompt to send to the model.
    temperature : float, optional
        Creativeness of the response (0.0 – 1.0).  Default is 0.7.

    Returns
    -------
    str | None
        The model's text response, or ``None`` if an error occurred.
        Errors are surfaced via ``st.error()`` so the caller need not
        display them again.
    """
    try:
        response = _client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
        )
        return response.choices[0].message.content
    except Exception as exc:
        st.error(f"🔴 Groq API error: {exc}")
        return None


def get_gemini_response_stream(prompt: str, temperature: float = 0.7):
    """
    Stream a Groq response chunk-by-chunk.
    Function name kept as get_gemini_response_stream for backward compatibility.

    Yields successive text *chunks* so the caller can display them
    progressively (e.g. inside ``st.write_stream``).

    Parameters
    ----------
    prompt : str
        The full prompt string.
    temperature : float, optional
        Generation temperature.  Default is 0.7.

    Yields
    ------
    str
        A text chunk from the streaming response.
    """
    try:
        stream = _client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as exc:
        st.error(f"🔴 Groq streaming error: {exc}")


# ── Prompt Templates ────────────────────────────────────────
def build_itinerary_prompt(
    destination: str,
    duration: str,
    budget: str,
    travel_style: str,
    interests: list[str],
    food_pref: str,
    special_requests: str = "",
) -> str:
    """Return a structured itinerary-generation prompt."""
    interests_str = ", ".join(interests) if interests else "General sightseeing"
    return f"""
You are YatraSathi, an expert AI travel planner for India and international destinations.

Create a detailed {duration} travel itinerary for **{destination}**.

Traveller Profile:
- Travel Style  : {travel_style}
- Budget Tier   : {budget}
- Interests     : {interests_str}
- Food Preference: {food_pref}
- Special Notes : {special_requests or "None"}

Instructions:
1. Divide the plan into clear Day-wise sections (Day 1, Day 2, …).
2. For each day include: Morning / Afternoon / Evening activities.
3. Mention specific attraction names, estimated timings and entry fees.
4. Recommend one breakfast, lunch and dinner spot per day suited to the food preference and budget.
5. Add local tips, hidden gems and cultural etiquette notes.
6. End with a packing list and emergency contacts for the destination.
7. ⚠️ TRANSPORT ACCURACY — Include a dedicated local transport section for {destination}. NEVER assume Ola/Uber/Rapido are available everywhere (e.g. they are banned in Goa). Mention only transport modes that actually operate there: local taxi stands, city-specific apps (GoaMiles for Goa), metro lines (Delhi/Bengaluru/Hyderabad/Chennai/Kochi/Kolkata Metro etc.), suburban trains (Mumbai Local, Chennai Suburban), ferries (Goa, Kerala, Andaman), local buses, auto-rickshaws — whichever apply.

Format the output in clean Markdown with headers and bullet points.
""".strip()


def build_budget_prompt(
    destination: str,
    duration: str,
    budget_tier: str,
    travel_style: str,
    num_travellers: int,
) -> str:
    """Return a budget-estimation prompt."""
    return f"""
You are YatraSathi, an AI travel budget expert.

Estimate a detailed travel budget for:
- Destination   : {destination}
- Duration      : {duration}
- Budget Tier   : {budget_tier}
- Travel Style  : {travel_style}
- Travellers    : {num_travellers}

Provide a breakdown table in Markdown covering:
| Category | Per Person / Day | Total ({num_travellers} pax, {duration}) |
Include: Accommodation, Food, Local Transport, Entry Fees, Shopping, Miscellaneous.
⚠️ LOCAL TRANSPORT ACCURACY: For the Local Transport row, list ONLY modes that genuinely operate in {destination}. State clearly if Ola/Uber/Rapido are available or banned there. Include metro lines and local/suburban trains if present. Mention city-specific apps (e.g. GoaMiles for Goa).
Add money-saving tips at the end.
""".strip()
