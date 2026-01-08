
// Mock Live Weather Service for Hunter Valley (Pokolbin)
// In a real app, this would fetch from OpenWeatherMap or BOM API

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm' | 'Windy';
  humidity: number;
  uvIndex: number; // 0-11
  windSpeed: number; // km/h
  forecast: string;
  recommendation: string; // Dynamic Sommelier advice based on weather
}

export const getCurrentWeather = async (): Promise<WeatherData> => {
  // Simulating an API call latency
  await new Promise(resolve => setTimeout(resolve, 300));

  // MOCK DATA: A beautiful Hunter Valley Spring Day
  return {
    temp: 24,
    condition: 'Sunny',
    humidity: 45,
    uvIndex: 6,
    windSpeed: 12,
    forecast: "Clear skies continuing into the evening. Perfect sunset potential.",
    recommendation: "Perfect conditions for a veranda tasting. We recommend starting with a crisp Semillon before it warms up."
  };
};

export const getWeatherContextString = async (): Promise<string> => {
  const w = await getCurrentWeather();
  return `Current Weather in Hunter Valley: ${w.temp}°C, ${w.condition}. Wind: ${w.windSpeed}km/h. Recommendation: ${w.recommendation}`;
};
