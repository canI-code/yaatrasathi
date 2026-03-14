import type { WeatherData, WeatherForecast } from "../types";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

interface ForecastCacheEntry {
  data: WeatherForecast[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const forecastCache = new Map<string, ForecastCacheEntry>();

const getApiKey = (): string => {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY as string;
  if (!key) throw new Error("VITE_OPENWEATHER_API_KEY is not set in environment variables.");
  return key;
};

const isCacheValid = (entry: CacheEntry): boolean =>
  Date.now() - entry.timestamp < CACHE_TTL_MS;

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const cacheKey = city.toLowerCase().trim();

  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  const apiKey = getApiKey();
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
    }
    if (response.status === 401) {
      throw new Error("Invalid OpenWeather API key. Please check your configuration.");
    }
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const json = await response.json() as {
    name: string;
    sys: { country: string; sunrise: number; sunset: number };
    main: { temp: number; feels_like: number; humidity: number };
    weather: Array<{ description: string; icon: string }>;
    wind: { speed: number };
    visibility: number;
  };

  const data: WeatherData = {
    city: json.name,
    country: json.sys.country,
    temperature: json.main.temp,
    feelsLike: json.main.feels_like,
    description: json.weather[0]?.description ?? "N/A",
    icon: json.weather[0]?.icon ?? "",
    humidity: json.main.humidity,
    windSpeed: json.wind.speed,
    visibility: json.visibility,
    sunrise: json.sys.sunrise,
    sunset: json.sys.sunset,
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

export const fetchForecast = async (city: string): Promise<WeatherForecast[]> => {
  const cacheKey = `forecast_${city.toLowerCase().trim()}`;

  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = getApiKey();
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=40`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) throw new Error(`City "${city}" not found.`);
    if (response.status === 401) throw new Error("Invalid OpenWeather API key.");
    throw new Error(`Forecast API error: ${response.statusText}`);
  }

  const json = await response.json() as {
    list: Array<{
      dt_txt: string;
      main: { temp_min: number; temp_max: number };
      weather: Array<{ description: string; icon: string }>;
    }>;
  };

  // Group by day — pick one entry per day (noon slot preferred)
  const dayMap = new Map<string, WeatherForecast>();
  for (const item of json.list) {
    const date = item.dt_txt.split(" ")[0]; // "2025-01-15"
    const hour = item.dt_txt.split(" ")[1]; // "12:00:00"
    if (!dayMap.has(date) || hour === "12:00:00") {
      dayMap.set(date, {
        date,
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),
        description: item.weather[0]?.description ?? "",
        icon: item.weather[0]?.icon ?? "",
      });
    }
  }

  const data = Array.from(dayMap.values()).slice(0, 5);
  forecastCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

export const clearWeatherCache = () => { cache.clear(); forecastCache.clear(); };
