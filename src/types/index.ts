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

// Rich safety report (new)
export type SafetyLevel = "safe" | "moderate" | "high" | "avoid";

export interface SafetyAspect {
  name: string;
  level: SafetyLevel;
  situation: string;
  tips: string[];
}

export interface SafetyScam {
  title: string;
  howItWorks: string;
  redFlags: string;
  howToAvoid: string;
}

export interface SafetyAreaGuide {
  area: string;
  rating: SafetyLevel;
  bestTime: string;
  notes: string;
}

export interface SafetyEmergencyContact {
  service: string;
  number: string;
}

export interface SafetyReport {
  destination: string;
  travelerType: string;
  overallScore: number;          // 1–10
  overallLevel: SafetyLevel;
  summary: string;
  aspects: SafetyAspect[];
  scams: SafetyScam[];
  emergencyContacts: SafetyEmergencyContact[];
  areaGuide: SafetyAreaGuide[];
  nightSafety: {
    safeAreas: string[];
    avoidAreas: string[];
    transportTips: string[];
    cautionAfter: string;
  };
  travelerSpecificTips: string[];
  dos: string[];
  donts: string[];
  finalVerdict: string;
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

// --- User Plans Feature Types ---

export type SectionType =
  | 'planner'
  | 'budget'
  | 'hotels'
  | 'food'
  | 'transport'
  | 'safety'
  | 'best-time'
  | 'weather';

export interface Plan {
  id: string;
  user_id: string;
  name: string;
  destination?: string;
  created_at: string;
  updated_at: string;
  sections?: PlanSection[];
  versions?: PlanVersion[];          // all versions across all section types
  latestAnalysis?: PlanAnalysis;
  weatherSnapshot?: WeatherSnapshot;
}

export interface PlanSection {
  id: string;
  plan_id: string;
  section_type: SectionType;
  data: unknown;
  saved_at: string;
}

export interface PlanVersion {
  id: string;
  plan_id: string;
  section_type: SectionType;   // which section this version belongs to
  snapshot: unknown;           // the data snapshot for that section
  created_at: string;
}

export interface PlanAnalysis {
  id: string;
  plan_id: string;
  content: string;
  created_at: string;
}

export interface WeatherSnapshot {
  id: string;
  plan_id: string;
  source_data?: WeatherData;
  dest_data?: WeatherData;
  captured_at: string;
}
