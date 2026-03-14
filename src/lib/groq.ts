import Groq from "groq-sdk";
import type {
  TripPlan,
  BudgetBreakdown,
  Hotel,
  FoodItem,
  TransportOption,
  SafetyTip,
  BestTimeInfo,
  WeatherData,
  WeatherForecast,
  WeatherAnalysis,
} from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const getClient = (): Groq => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY is not set in environment variables.");
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (prompt: string, retries = MAX_RETRIES): Promise<string> => {
  const client = getClient();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are YatraSathi, an expert AI travel planner. Always respond with valid JSON only. No markdown, no explanation outside JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq API.");
      return content.trim();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error("Max retries exceeded.");
};

const parseJSON = <T>(raw: string): T => {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Failed to parse AI response as JSON. Please try again.");
  }
};

// ─── Trip Planner ────────────────────────────────────────────────────────────

export interface TripPlanInput {
  source: string;
  destination: string;
  duration: number;
  travelers: number;
  budgetLevel: string;
  travelStyle: string;
  interests: string[];
  foodPreference: string;
  specialRequirements?: string;
}

export const generateTripPlan = async (input: TripPlanInput): Promise<TripPlan> => {
  const prompt = `You are YatraSathi, an expert AI travel planner with deep knowledge of Indian and international destinations.

Plan a ${input.duration}-day trip from ${input.source} to ${input.destination} for ${input.travelers} traveler(s).
Travel Style: ${input.travelStyle}
Budget Level: ${input.budgetLevel}
Interests: ${input.interests.join(", ") || "General sightseeing"}
Food Preference: ${input.foodPreference}
Special Requirements: ${input.specialRequirements || "None"}

Create a detailed, practical, and exciting travel plan with local insider tips, hidden gems, and authentic experiences. Tailor every recommendation to the travel style, budget and interests above.

Return a JSON object with this EXACT structure (valid JSON only, no markdown, no extra text):
{
  "source": "${input.source}",
  "destination": "${input.destination}",
  "duration": ${input.duration},
  "travelers": ${input.travelers},
  "budget": "${input.budgetLevel}",
  "travelStyle": "${input.travelStyle}",
  "overview": "A 2-3 sentence exciting summary of this trip and what makes it special",
  "totalEstimatedCost": <total cost in INR for all ${input.travelers} traveler(s) combined>,
  "budgetBreakdown": [
    { "category": "Flights & Intercity Transport", "amount": <number>, "percentage": <number> },
    { "category": "Accommodation", "amount": <number>, "percentage": <number> },
    { "category": "Food & Dining", "amount": <number>, "percentage": <number> },
    { "category": "Activities & Sightseeing", "amount": <number>, "percentage": <number> },
    { "category": "Local Transport", "amount": <number>, "percentage": <number> },
    { "category": "Shopping & Miscellaneous", "amount": <number>, "percentage": <number> }
  ],
  "tips": [
    "Practical insider tip 1",
    "Practical insider tip 2",
    "Practical insider tip 3",
    "Practical insider tip 4",
    "Practical insider tip 5"
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Arrival & First Impressions",
      "travel": "Specific transport details for this day — mode, route, estimated time and cost",
      "stay": "Recommended hotel/resort name, area, and approximate cost per night (₹ range)",
      "morning": "2-3 detailed morning activities with place names and what to expect",
      "afternoon": "2-3 detailed afternoon activities with place names and what to expect",
      "evening": "Evening plan including dinner, nightlife or relaxation activities",
      "food": [
        "Breakfast: Restaurant name – dish to try (price range)",
        "Lunch: Restaurant name – dish to try (price range)",
        "Dinner: Restaurant name – dish to try (price range)"
      ],
      "estimatedCost": <cost in INR for this day per traveler>,
      "activities": [
        { "time": "09:00 AM", "name": "Activity Name", "description": "Short description", "location": "Place, City", "cost": 500, "duration": "2 hours" }
      ],
      "meals": [
        { "type": "breakfast", "restaurant": "Name", "cuisine": "Cuisine Type", "priceRange": "₹200-400" }
      ]
    }
  ]
}

Repeat the itinerary array for each of the ${input.duration} days. Make each day unique and progressively better. End the trip on a high note.`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<TripPlan>(raw);
};

// ─── Budget Estimator ─────────────────────────────────────────────────────────

export interface BudgetInput {
  destination: string;
  source: string;
  days: number;
  travelers: number;
  travelStyle: string;
  accommodation: string;
  transport: string;
  includeFlights: boolean;
}

export const generateBudgetEstimate = async (input: BudgetInput): Promise<BudgetBreakdown> => {
  const prompt = `You are YatraSathi, an expert AI travel budget planner with deep knowledge of Indian travel costs.

Estimate a detailed travel budget in INR for the following trip:
- From: ${input.source}
- To: ${input.destination}
- Duration: ${input.days} days
- Travelers: ${input.travelers} person(s)
- Travel Style: ${input.travelStyle}
- Accommodation Type: ${input.accommodation}
- Transport Preference: ${input.transport}
- Include Flights/Trains: ${input.includeFlights ? "Yes" : "No"}

Provide realistic, research-based cost estimates for ${new Date().getFullYear()}. Account for local price levels, seasonality, and the travel style specified.

Return a JSON object with this EXACT structure (valid JSON only, no markdown, no extra text):
{
  "destination": "${input.destination}",
  "days": ${input.days},
  "travelers": ${input.travelers},
  "travelStyle": "${input.travelStyle}",
  "currency": "INR",
  "accommodation": <total accommodation cost for all travelers for all ${input.days} nights>,
  "food": <total food cost for all travelers for ${input.days} days>,
  "transport": <total transport cost including intercity travel for all travelers>,
  "activities": <total sightseeing and activities cost for all travelers>,
  "shopping": <estimated shopping budget for all travelers>,
  "miscellaneous": <misc costs like tips, toiletries, emergency buffer for all travelers>,
  "total": <sum of all above>,
  "perPersonTotal": <total divided by number of travelers>,
  "perDayTotal": <total divided by number of days>,
  "summary": "A 2-sentence overview of what this budget covers and why it's realistic for ${input.travelStyle} style",
  "tips": [
    "Specific money-saving tip 1 for ${input.destination}",
    "Specific money-saving tip 2 for ${input.destination}",
    "Specific money-saving tip 3 for ${input.destination}",
    "Specific money-saving tip 4 for ${input.destination}",
    "Specific money-saving tip 5 for ${input.destination}",
    "Specific money-saving tip 6 for ${input.destination}"
  ],
  "cheaperAlternatives": [
    { "category": "Accommodation", "original": "Current option description", "cheaper": "Cheaper alternative description", "savings": <savings amount in INR> },
    { "category": "Food", "original": "Current option", "cheaper": "Cheaper alternative", "savings": <savings amount> },
    { "category": "Transport", "original": "Current option", "cheaper": "Cheaper alternative", "savings": <savings amount> },
    { "category": "Activities", "original": "Current option", "cheaper": "Cheaper alternative", "savings": <savings amount> }
  ]
}`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<BudgetBreakdown>(raw);
};

// ─── Weather Analysis ─────────────────────────────────────────────────────────

export const generateWeatherAnalysis = async (
  weather: WeatherData,
  forecast: WeatherForecast[]
): Promise<WeatherAnalysis> => {
  const forecastSummary = forecast
    .map(
      (f) =>
        `${f.date}: ${f.description}, Low ${f.tempMin}°C / High ${f.tempMax}°C`
    )
    .join("; ");

  const prompt = `You are YatraSathi, an expert AI travel and weather analyst.

Current weather in ${weather.city}, ${weather.country}:
- Temperature: ${Math.round(weather.temperature)}°C (feels like ${Math.round(weather.feelsLike)}°C)
- Condition: ${weather.description}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} m/s
- Visibility: ${(weather.visibility / 1000).toFixed(1)} km

5-day forecast: ${forecastSummary}

Provide a comprehensive travel-focused weather analysis and recommendations.

Return a JSON object with EXACTLY this structure (valid JSON only, no markdown):
{
  "overview": "2-3 sentence vivid analysis of current conditions and what they mean for a traveler",
  "travelImpact": "2-3 sentences on how this weather affects travel plans, outdoor sightseeing, transit",
  "clothingRecommendations": [
    "Specific clothing item 1",
    "Specific clothing item 2",
    "Specific clothing item 3",
    "Specific clothing item 4",
    "Specific clothing item 5"
  ],
  "itemsToCarry": [
    "Essential item 1",
    "Essential item 2",
    "Essential item 3",
    "Essential item 4",
    "Essential item 5"
  ],
  "recommendedActivities": [
    "Activity 1 suitable for this weather",
    "Activity 2 suitable for this weather",
    "Activity 3 suitable for this weather",
    "Activity 4 suitable for this weather"
  ],
  "activitiesToAvoid": [
    "Activity to avoid 1 and why",
    "Activity to avoid 2 and why",
    "Activity to avoid 3 and why"
  ],
  "bestTimeOfDay": "A specific recommendation on the best time window for outdoor activities today (e.g. morning 7-10am before afternoon heat)",
  "weekTrend": "2-sentence summary of the 5-day weather trend and what travelers should plan for"
}`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<WeatherAnalysis>(raw);
};

// ─── Tourist Places (Map) ────────────────────────────────────────────────────

export const generateTouristPlaces = async (city: string): Promise<import("../types").MapLocation[]> => {
  const prompt = `You are YatraSathi, an expert travel guide with precise geographical knowledge.

List exactly 15 must-visit tourist places in ${city}. These will be plotted on a map so coordinates MUST be accurate real-world GPS coordinates.

Return a JSON array with EXACTLY this structure (valid JSON only, no markdown):
[
  {
    "id": "place_1",
    "name": "Exact Place Name",
    "coordinates": [longitude, latitude],
    "description": "2-sentence engaging description for travelers",
    "category": "attraction",
    "type": "attraction",
    "emoji": "🏛️",
    "address": "Short street or area address",
    "rating": 4.5,
    "tips": "One practical insider tip"
  }
]

Rules:
- coordinates MUST be in [longitude, latitude] order (NOT lat,lng)
- Include EXACTLY: 6 attractions, 3 hotels, 3 food spots, 3 transport hubs
- type must be one of: "attraction", "hotel", "food", "transport"
- category must match type
- emoji: use one relevant emoji per place
- rating: realistic number between 3.5 and 5.0
- All 15 places must be WITHIN the city of ${city} with accurate GPS coordinates
- Do NOT invent places. Use real, well-known locations only.`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<import("../types").MapLocation[]>(raw);
};

// ─── Hotels ───────────────────────────────────────────────────────────────────

interface HotelInput {
  destination: string;
  stars?: number;
}

export const generateHotelRecommendations = async (input: HotelInput): Promise<Hotel[]> => {
  const prompt = `Recommend 8 hotels in ${input.destination}${input.stars ? ` with ${input.stars} stars` : ""}.

Return JSON array:
[
  {
    "name": "string",
    "stars": number,
    "location": "string",
    "pricePerNight": number,
    "amenities": ["string"],
    "rating": number
  }
]`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<Hotel[]>(raw);
};

// ─── Food Guide ───────────────────────────────────────────────────────────────

export const generateFoodGuide = async (destination: string): Promise<FoodItem[]> => {
  const prompt = `List 10 must-try local foods in ${destination}.

Return JSON array:
[
  {
    "name": "string",
    "description": "string",
    "isVegetarian": boolean,
    "spiceLevel": "mild|medium|hot|very hot",
    "priceRange": "string",
    "whereToFind": ["string"]
  }
]`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<FoodItem[]>(raw);
};

// ─── Transport Options ────────────────────────────────────────────────────────

export const generateTransportOptions = async (from: string, to: string): Promise<TransportOption[]> => {
  const prompt = `List all transport options to travel from ${from} to ${to}.

Return JSON array:
[
  {
    "type": "flight|train|bus|car|ferry",
    "name": "string",
    "description": "string",
    "cost": "string",
    "duration": "string",
    "pros": ["string"],
    "cons": ["string"]
  }
]`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<TransportOption[]>(raw);
};

// ─── Safety Guide ─────────────────────────────────────────────────────────────

export const generateSafetyGuide = async (destination: string): Promise<SafetyTip[]> => {
  const prompt = `Provide safety tips for travelers visiting ${destination}. Cover categories: General, Health, Transport, Scams, Emergency, Women Safety.

Return JSON array:
[
  {
    "category": "string",
    "tips": ["string"],
    "emergency": "string (optional emergency number or info)"
  }
]`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<SafetyTip[]>(raw);
};

// ─── Best Time ────────────────────────────────────────────────────────────────

export const generateBestTimeInfo = async (destination: string): Promise<BestTimeInfo[]> => {
  const prompt = `Provide seasonal travel information for ${destination}. Cover all major seasons.

Return JSON array:
[
  {
    "season": "string",
    "months": ["string"],
    "weather": "string",
    "pros": ["string"],
    "cons": ["string"],
    "rating": number (1-5)
  }
]`;

  const raw = await fetchWithRetry(prompt);
  return parseJSON<BestTimeInfo[]>(raw);
};
