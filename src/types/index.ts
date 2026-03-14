export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

export interface BudgetBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface TripPlan {
  source: string;
  destination: string;
  duration: number;
  travelers: number;
  budget: string;
  travelStyle: string;
  overview: string;
  itinerary: ItineraryDay[];
  totalEstimatedCost: number;
  budgetBreakdown: BudgetBreakdownItem[];
  tips: string[];
}

export interface ItineraryDay {
  day: number;
  theme: string;
  travel: string;
  stay: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string[];
  activities: Activity[];
  meals: Meal[];
  estimatedCost: number;
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
}

export interface Meal {
  type: "breakfast" | "lunch" | "dinner";
  restaurant: string;
  cuisine: string;
  priceRange: string;
}

export interface Hotel {
  name: string;
  stars: number;
  location: string;
  pricePerNight: number;
  amenities: string[];
  rating: number;
  image?: string;
}

export interface FoodItem {
  name: string;
  description: string;
  isVegetarian: boolean;
  spiceLevel: "mild" | "medium" | "hot" | "very hot";
  priceRange: string;
  whereToFind: string[];
}

export interface TransportOption {
  type: string;
  name: string;
  description: string;
  cost: string;
  duration: string;
  pros: string[];
  cons: string[];
}

export interface BudgetBreakdown {
  destination: string;
  days: number;
  travelers: number;
  travelStyle: string;
  currency: string;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  total: number;
  perPersonTotal: number;
  perDayTotal: number;
  summary: string;
  tips: string[];
  cheaperAlternatives: CheaperAlternative[];
}

export interface CheaperAlternative {
  category: string;
  original: string;
  cheaper: string;
  savings: number;
}

export interface SafetyTip {
  category: string;
  tips: string[];
  emergency?: string;
}

export interface BestTimeInfo {
  season: string;
  months: string[];
  weather: string;
  pros: string[];
  cons: string[];
  rating: number;
}

export interface WeatherAnalysis {
  overview: string;
  travelImpact: string;
  clothingRecommendations: string[];
  itemsToCarry: string[];
  recommendedActivities: string[];
  activitiesToAvoid: string[];
  bestTimeOfDay: string;
  weekTrend: string;
}

export interface MapLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  category: string;
  // extended tourist fields
  type?: "attraction" | "hotel" | "food" | "transport";
  emoji?: string;
  address?: string;
  rating?: number;
  tips?: string;
}

export type TravelStyle = "budget" | "comfort" | "luxury" | "adventure" | "cultural";

export type NavLink = {
  label: string;
  path: string;
};
