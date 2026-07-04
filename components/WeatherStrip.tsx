import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Zap, Droplets } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { getForecast, DayForecast } from '../services/weatherService';

// The week over the vines — a quiet forecast strip for anywhere a day is
// being planned. Live from Open-Meteo; silently absent when offline.

const ICONS: Record<DayForecast['condition'], React.ReactNode> = {
  Sunny: <Sun className="w-4 h-4 text-brass" />,
  Cloudy: <Cloud className="w-4 h-4 text-ink/40" />,
  Rain: <CloudRain className="w-4 h-4 text-vine" />,
  Storm: <Zap className="w-4 h-4 text-claret" />,
  Windy: <Cloud className="w-4 h-4 text-ink/40" />,
};

const WeatherStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { region } = useRegion();
  const [days, setDays] = useState<DayForecast[]>([]);

  useEffect(() => {
    let alive = true;
    getForecast(region).then(d => {
      if (alive) setDays(d);
    });
    return () => {
      alive = false;
    };
  }, [region]);

  if (days.length === 0) return null;

  return (
    <div className={`border border-hairline rounded-sm bg-paper ${className}`}>
      <div className="px-4 pt-3 pb-1 flex items-baseline justify-between">
        <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-brass">
          The week over the vines
        </p>
        <p className="font-ui text-[10px] text-ink/30">{region.shortName}</p>
      </div>
      <div className="flex overflow-x-auto no-scrollbar px-2 pb-3">
        {days.map((d, i) => (
          <div
            key={d.date}
            className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[72px] ${
              i === 0 ? 'bg-parchment rounded-sm' : ''
            }`}
          >
            <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/50">
              {i === 0 ? 'Today' : d.dayName}
            </span>
            {ICONS[d.condition]}
            <span className="font-ui text-xs font-semibold text-ink">
              {d.maxTemp}° <span className="text-ink/35 font-normal">{d.minTemp}°</span>
            </span>
            {d.rainChance >= 30 && (
              <span className="flex items-center gap-0.5 font-ui text-[9px] text-ink/40">
                <Droplets className="w-2.5 h-2.5" /> {d.rainChance}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherStrip;
