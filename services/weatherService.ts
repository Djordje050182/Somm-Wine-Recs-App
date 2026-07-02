// Weather service — mock data lives on each Region config, so every region
// brings its own weather. Swap getCurrentWeather's body for a real API
// (OpenWeatherMap / BOM) without touching any caller.

import { Region, WeatherData } from '../types';

export type { WeatherData };

export const getCurrentWeather = async (region: Region): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return region.weather.mock;
};

export const getWeatherContextString = async (region: Region): Promise<string> => {
  const w = await getCurrentWeather(region);
  return `Current weather in ${region.name}: ${w.temp}°C, ${w.condition}. Wind: ${w.windSpeed}km/h. Recommendation: ${w.recommendation}`;
};
