import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { MapPin, Thermometer, History, X } from 'lucide-react';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { Winery, Experience } from '../types';
import { Kicker, SectionHeading } from './ui';
import ImageWithLoader from './ImageWithLoader';
import MapLayer from './MapLayer';
import GuideModal from './GuideModal';

// The land — the Guide's portrait of the region itself: the map, the
// subregions, the grapes, the vintages, the seasons and the soil.
// Everything here is driven by the region config; nothing is hardcoded.

// Chart palette per DESIGN.md: claret / brass / vine / ink only.
const CHART_COLOURS = ['#5E1A26', '#96742E', '#4A5D3A', '#211A16'];
const HAIRLINE = '#E2D9C8';
const INK = '#211A16';

const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#FFFDF8',
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 2,
  fontFamily: 'Archivo, system-ui, sans-serif',
  fontSize: 12,
  color: INK,
};

const axisTick = { fontSize: 11, fontFamily: 'Archivo, system-ui, sans-serif', fill: INK, opacity: 0.55 };

type MapSelection = { item: Winery | Experience; type: 'winery' | 'experience' } | null;

const RegionExplorer: React.FC = () => {
  const { region } = useRegion();
  const { wineries, experiences } = useCatalog();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSubregion, setSelectedSubregion] = useState<string | null>(null);
  const [selectedMapItem, setSelectedMapItem] = useState<MapSelection>(null);

  useEffect(() => {
    getCurrentWeather(region).then(setWeather);
  }, [region]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const firstVines = useMemo(
    () => (wineries.length ? Math.min(...wineries.map(w => w.established)) : null),
    [wineries]
  );

  const mapStops = useMemo(() => {
    const items: Array<(Winery | Experience) & { type: 'winery' | 'experience' }> = [
      ...wineries.map(w => ({ ...w, type: 'winery' as const })),
      ...experiences.map(e => ({ ...e, type: 'experience' as const })),
    ];
    const visible = selectedSubregion ? items.filter(i => i.subregion === selectedSubregion) : items;
    return visible.map(item => ({
      id: item.id,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      image: item.image,
      type: item.type,
    }));
  }, [wineries, experiences, selectedSubregion]);

  const handleMarkerClick = (stop: { id: number | string; type?: 'winery' | 'experience' }) => {
    const original =
      stop.type === 'experience'
        ? experiences.find(e => e.id === stop.id)
        : wineries.find(w => w.id === stop.id);
    if (original) setSelectedMapItem({ item: original, type: stop.type ?? 'winery' });
  };

  return (
    <div className="py-10 animate-fade-in space-y-16 md:space-y-20">
      {selectedMapItem && (
        <GuideModal item={selectedMapItem.item} type={selectedMapItem.type} onClose={() => setSelectedMapItem(null)} />
      )}

      {/* Portrait + interactive map */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        <div className="w-full lg:w-1/3 space-y-6">
          <Kicker className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> {region.state}, {region.country}
          </Kicker>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-ink leading-tight">{region.name}</h2>
          <p className="font-body text-lg text-ink/60 italic leading-relaxed">{region.strapline}</p>
          <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-sm">
            <div className="bg-paper p-4">
              <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> First vines
              </p>
              <p className="font-display text-2xl text-ink">{firstVines ?? '—'}</p>
            </div>
            <div className="bg-paper p-4">
              <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mb-1 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Right now
              </p>
              <p className="font-display text-2xl text-ink">{weather ? `${weather.temp}°C` : '—'}</p>
            </div>
          </div>
          {weather && (
            <p className="font-body text-sm italic text-ink/60 leading-relaxed border-l-2 border-brass pl-4">
              {weather.recommendation}
            </p>
          )}
        </div>

        <div className="w-full lg:flex-1 h-[400px] md:h-[500px] bg-paper border border-hairline rounded-sm relative overflow-hidden">
          <div className="absolute top-3 left-3 z-[400] bg-paper border border-hairline px-3 py-2 rounded-sm font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/70">
            {selectedSubregion ?? 'The whole valley'}
          </div>
          {selectedSubregion && (
            <button
              onClick={() => setSelectedSubregion(null)}
              className="absolute top-3 right-3 z-[400] bg-paper border border-hairline p-2 rounded-sm text-ink/60 hover:text-claret hover:border-claret transition-colors"
              aria-label="Show the whole valley"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <MapLayer stops={mapStops} onMarkerClick={handleMarkerClick} />

          <div className="absolute bottom-3 right-3 z-[400] bg-paper border border-hairline px-3 py-2 rounded-sm font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/60 flex flex-col gap-1">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-claret" /> Winery</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-vine" /> Experience</span>
          </div>
        </div>
      </div>

      {/* Subregions */}
      <section>
        <SectionHeading
          kicker="Lay of the land"
          title="The corners of the valley"
          standfirst="Choose a corner to narrow the map above."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline mt-8">
          {region.subregions.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubregion(selectedSubregion === sub.name ? null : sub.name)}
              className={`text-left p-6 transition-colors ${
                selectedSubregion === sub.name ? 'bg-claret text-parchment' : 'bg-paper hover:bg-parchment'
              }`}
            >
              <h4 className={`font-display text-xl leading-snug ${selectedSubregion === sub.name ? 'text-parchment' : 'text-ink'}`}>
                {sub.name}
              </h4>
              <p className={`font-body text-sm mt-2 leading-relaxed ${selectedSubregion === sub.name ? 'text-parchment/80' : 'text-ink/60'}`}>
                {sub.blurb}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4">
                {sub.features.map(f => (
                  <span
                    key={f}
                    className={`font-ui text-[10px] font-semibold uppercase tracking-kicker ${
                      selectedSubregion === sub.name ? 'text-parchment/70' : 'text-brass'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* The grapes and the years */}
      <section>
        <SectionHeading kicker="In the glass" title="The grapes and the years" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline mt-8">
          <div className="bg-paper p-6 md:p-8">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/40 mb-6">What grows here</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={region.varietyMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 55 : 70}
                    outerRadius={isMobile ? 78 : 95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#FFFDF8"
                    strokeWidth={2}
                  >
                    {region.varietyMix.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLOURS[index % CHART_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, undefined]} />
                  <Legend
                    verticalAlign={isMobile ? 'bottom' : 'middle'}
                    align={isMobile ? 'center' : 'right'}
                    layout={isMobile ? 'horizontal' : 'vertical'}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontFamily: 'Archivo, system-ui, sans-serif', fontSize: 12, color: INK }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-paper p-6 md:p-8">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/40 mb-6">The vintages, rated</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={region.vintages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={HAIRLINE} strokeWidth={1} vertical={false} />
                  <XAxis dataKey="year" axisLine={{ stroke: HAIRLINE }} tickLine={false} tick={axisTick} />
                  <YAxis domain={[60, 100]} hide />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, _name, entry: any) => [`${value}/100 — ${entry?.payload?.quality ?? ''}`, undefined]}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#5E1A26" strokeWidth={2} fill="#5E1A26" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {region.vintages.length > 1 && (
              <div className="flex justify-between font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mt-4">
                <span>{region.vintages[0].year} · {region.vintages[0].quality}</span>
                <span>{region.vintages[region.vintages.length - 1].year} · {region.vintages[region.vintages.length - 1].quality}</span>
              </div>
            )}
          </div>
        </div>

        {/* The years worth hunting on a list or at the cellar door */}
        <div className="bg-paper border border-hairline mt-px p-6 md:p-8">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/40 mb-2">The ones to hunt</p>
          <p className="font-body text-sm text-ink/60 leading-relaxed mb-6 max-w-2xl">
            When a list or a museum-release shelf offers you a choice of years, these are the ones
            the Somm reaches for.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {region.vintages
              .filter(v => v.note)
              .sort((a, b) => b.rating - a.rating)
              .map(v => (
                <div key={v.year} className="flex gap-4 items-baseline border-b border-hairline pb-3">
                  <span className="font-display text-2xl text-claret shrink-0 w-16">{v.year}</span>
                  <div className="min-w-0">
                    <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-brass block">{v.quality} · {v.rating}/100</span>
                    <p className="font-body text-sm text-ink/70 leading-relaxed mt-0.5">{v.note}</p>
                  </div>
                </div>
              ))}
          </div>
          <p className="font-body text-sm italic text-ink/50 leading-relaxed mt-6">
            The standing rule: young Semillon is a promise, aged Semillon is the payoff. If a cellar
            door offers anything with ten years on it, say yes before they change their mind.
          </p>
        </div>
      </section>

      {/* The seasons — the one dark panel, kept flat */}
      <section className="bg-ink rounded-sm p-8 md:p-12 text-parchment">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass-soft mb-2">The year in the valley</p>
        <h3 className="font-display text-3xl font-medium mb-10">When to come</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {region.seasons.map(season => (
            <div key={season.name} className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-parchment/15 pb-2">
                <span className="font-display italic text-2xl">{season.name}</span>
                <span className="font-ui text-sm font-semibold text-brass-soft">{season.avgTemp}</span>
              </div>
              <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-parchment/50">{season.range}</p>
              <p className="font-body text-sm text-parchment/70 leading-relaxed">{season.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terroir */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <SectionHeading kicker="Underfoot" title="The terroir" />
          <p className="font-body text-lg text-ink/70 leading-relaxed">{region.terroir.story}</p>
          <div className="space-y-4 border-t border-hairline pt-6">
            <div>
              <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass mb-1">The soils</p>
              <p className="font-body text-sm text-ink/60 leading-relaxed">{region.terroir.soils}</p>
            </div>
            <div>
              <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass mb-1">The climate</p>
              <p className="font-body text-sm text-ink/60 leading-relaxed">{region.terroir.climate}</p>
            </div>
          </div>
        </div>
        <div className="relative h-[300px] md:h-[400px] border border-hairline rounded-sm overflow-hidden">
          <ImageWithLoader asset={region.heroImage} className="w-full h-full" showCredit />
        </div>
      </section>
    </div>
  );
};

export default RegionExplorer;
