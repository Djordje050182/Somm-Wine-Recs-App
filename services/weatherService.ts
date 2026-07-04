// Weather service — live conditions from Open-Meteo (free, keyless, CORS-open),
// with each region's mock data as the offline/failure fallback. The forecast
// feeds the trip planner: you plan a Saturday, you should see Saturday.

import { Region, WeatherData } from '../types';

export type { WeatherData };

export interface DayForecast {
  date: string;      // ISO yyyy-mm-dd
  dayName: string;   // 'Sat'
  maxTemp: number;
  minTemp: number;
  condition: WeatherData['condition'];
  rainChance: number; // %
}

// WMO weather codes → the app's five moods
const codeToCondition = (code: number): WeatherData['condition'] => {
  if (code === 0 || code === 1) return 'Sunny';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'Cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
  if (code >= 95) return 'Storm';
  return 'Cloudy';
};

const tastingLine = (condition: WeatherData['condition'], temp: number): string => {
  if (condition === 'Rain') return 'A day for long tastings indoors — the cellar doors get quieter, the pours get longer.';
  if (condition === 'Storm') return 'Wild out there. Pick two estates, stay long at each, and let the weather do its worst.';
  if (temp >= 30) return 'Hot one. Start early, keep to the whites while the sun is high, and save the reds for late afternoon.';
  if (temp <= 12) return 'Crisp and cool — big red weather. Ask for the Shiraz first and find a fireplace.';
  if (condition === 'Sunny') return 'A day for tasting outdoors. Start with a young Semillon while the morning is still cool, and save the Shiraz for the shade of mid-afternoon.';
  return 'Soft light, easy tasting weather. A day to take the back roads between cellar doors.';
};

const cachedWeather = new Map<string, { at: number; data: WeatherData }>();
const cachedForecast = new Map<string, { at: number; data: DayForecast[] }>();
const TTL = 30 * 60 * 1000;

export const getCurrentWeather = async (region: Region): Promise<WeatherData> => {
  const hit = cachedWeather.get(region.id);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  try {
    const { lat, lng } = region.centre;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&timezone=auto`
    );
    if (!res.ok) throw new Error(String(res.status));
    const d = await res.json();
    const c = d.current;
    const condition = codeToCondition(c.weather_code);
    const temp = Math.round(c.temperature_2m);
    const data: WeatherData = {
      temp,
      condition,
      humidity: Math.round(c.relative_humidity_2m),
      uvIndex: Math.round(c.uv_index ?? 0),
      windSpeed: Math.round(c.wind_speed_10m),
      forecast: region.weather.mock.forecast,
      recommendation: tastingLine(condition, temp),
    };
    cachedWeather.set(region.id, { at: Date.now(), data });
    return data;
  } catch {
    return region.weather.mock;
  }
};

export const getForecast = async (region: Region): Promise<DayForecast[]> => {
  const hit = cachedForecast.get(region.id);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  try {
    const { lat, lng } = region.centre;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=7&timezone=auto`
    );
    if (!res.ok) throw new Error(String(res.status));
    const d = await res.json();
    const days: DayForecast[] = d.daily.time.map((date: string, i: number) => ({
      date,
      dayName: new Date(date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'short' }),
      maxTemp: Math.round(d.daily.temperature_2m_max[i]),
      minTemp: Math.round(d.daily.temperature_2m_min[i]),
      condition: codeToCondition(d.daily.weather_code[i]),
      rainChance: d.daily.precipitation_probability_max?.[i] ?? 0,
    }));
    cachedForecast.set(region.id, { at: Date.now(), data: days });
    return days;
  } catch {
    return [];
  }
};

export const getWeatherContextString = async (region: Region): Promise<string> => {
  const w = await getCurrentWeather(region);
  return `Current weather in ${region.name}: ${w.temp}°C, ${w.condition}. Wind: ${w.windSpeed}km/h. Recommendation: ${w.recommendation}`;
};
