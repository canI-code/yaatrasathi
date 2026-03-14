# ============================================================
#  YatraSathi — Constants & Configuration
# ============================================================

APP_NAME = "YatraSathi"
APP_TAGLINE = "Plan smarter. Travel better. Explore endlessly."

# ── 50 Major Indian Cities ───────────────────────────────────
INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
    "Amritsar", "Allahabad", "Ranchi", "Haora", "Coimbatore",
    "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
    "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
    "Hubli", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh",
]

# ── 30 Popular International Destinations ────────────────────
INTERNATIONAL_CITIES = [
    "Paris, France", "London, UK", "New York, USA", "Tokyo, Japan",
    "Dubai, UAE", "Singapore", "Bangkok, Thailand", "Bali, Indonesia",
    "Rome, Italy", "Barcelona, Spain", "Amsterdam, Netherlands",
    "Sydney, Australia", "Toronto, Canada", "Istanbul, Turkey",
    "Prague, Czech Republic", "Vienna, Austria", "Zurich, Switzerland",
    "Kyoto, Japan", "Seoul, South Korea", "Kuala Lumpur, Malaysia",
    "Maldives", "Mauritius", "Cape Town, South Africa",
    "New Zealand (Queenstown)", "Los Angeles, USA", "Phuket, Thailand",
    "Santorini, Greece", "Lisbon, Portugal", "Budapest, Hungary",
    "Colombo, Sri Lanka",
]

# All cities combined
ALL_CITIES = sorted(INDIAN_CITIES) + INTERNATIONAL_CITIES

# ── Trip Interests ───────────────────────────────────────────
INTERESTS = [
    "History & Culture",
    "Nature & Wildlife",
    "Adventure Sports",
    "Food & Cuisine",
    "Shopping",
    "Nightlife",
    "Spiritual & Religious",
    "Photography",
    "Beach & Water Sports",
    "Hill Stations",
    "Art & Architecture",
    "Local Markets",
]

# ── Budget Ranges ────────────────────────────────────────────
BUDGET_RANGES = {
    "Backpacker":  "Under ₹5,000/day",
    "Budget":      "₹5,000–10,000/day",
    "Standard":    "₹10,000–20,000/day",
    "Premium":     "₹20,000–40,000/day",
    "Luxury":      "₹40,000+/day",
}

# ── Travel Styles ────────────────────────────────────────────
TRAVEL_STYLES = [
    "Solo",
    "Couple",
    "Family with Kids",
    "Friends Group",
    "Senior Citizens",
    "Business",
]

# ── Food Preferences ─────────────────────────────────────────
FOOD_PREFERENCES = [
    "Vegetarian",
    "Non-Vegetarian",
    "Vegan",
    "Jain",
    "No Preference",
]

# ── Hotel Types ──────────────────────────────────────────────
HOTEL_TYPES = [
    "Budget Hotels",
    "3-Star",
    "4-Star",
    "5-Star",
    "Hostels",
    "Homestays",
    "Resorts",
    "Dharamshala/Ashram",
]

# ── Trip Durations ───────────────────────────────────────────
TRIP_DURATIONS = [
    "1 Day (Day-trip)",
    "2-3 Days (Weekend)",
    "4-5 Days",
    "1 Week",
    "10 Days",
    "2 Weeks",
    "3 Weeks",
    "1 Month+",
]

# ── Transport Modes ──────────────────────────────────────────
TRANSPORT_MODES = [
    "Flight ✈️",
    "Train 🚆",
    "Bus 🚌",
    "Car / Self-Drive 🚗",
    "Bike 🏍️",
    "Cruise 🚢",
]

# ── Season Months ────────────────────────────────────────────
MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
]

# ── Feature Cards for Landing Page ──────────────────────────
FEATURES = [
    {
        "icon": "🤖",
        "title": "AI Trip Planner",
        "desc": "Get a personalised day-by-day itinerary powered by Google Gemini.",
        "page": "pages/1_🤖_AI_Trip_Planner.py",
    },
    {
        "icon": "💰",
        "title": "Budget Estimator",
        "desc": "Estimate your total trip cost including transport, stay & food.",
        "page": "pages/2_💰_Budget_Estimator.py",
    },
    {
        "icon": "🏨",
        "title": "Hotels & Stays",
        "desc": "Discover the best hotels, hostels and homestays for every budget.",
        "page": "pages/3_🏨_Hotels_&_Stays.py",
    },
    {
        "icon": "🍽️",
        "title": "Food Guide",
        "desc": "Explore must-try local dishes, restaurants and street food spots.",
        "page": "pages/4_🍽️_Food_Guide.py",
    },
    {
        "icon": "🚗",
        "title": "Travel Options",
        "desc": "Compare flights, trains, buses and road trip routes.",
        "page": "pages/5_🚗_Travel_Options.py",
    },
    {
        "icon": "🛡️",
        "title": "Safety Info",
        "desc": "Know before you go — emergency contacts, safety tips & advisories.",
        "page": "pages/6_🛡️_Safety_Info.py",
    },
    {
        "icon": "📅",
        "title": "Best Time To Visit",
        "desc": "Find the perfect season and avoid crowds or bad weather.",
        "page": "pages/7_📅_Best_Time_To_Visit.py",
    },
    {
        "icon": "🌤️",
        "title": "Live Weather",
        "desc": "Real-time weather and 5-day forecast for any destination.",
        "page": "pages/8_🌤️_Live_Weather.py",
    },
    {
        "icon": "📍",
        "title": "Explore Map",
        "desc": "Interactive map with attractions, restaurants and hidden gems.",
        "page": "pages/9_📍_Explore_Map.py",
    },
]
