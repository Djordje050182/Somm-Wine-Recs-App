import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, Navigation, ExternalLink, Share2, Check, UtensilsCrossed, Wine, Compass } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import MapLayer from '../../components/MapLayer';
import ImageWithLoader from '../../components/ImageWithLoader';
import { Kicker, Button } from '../../components/ui';
import { decodeShareableRun, googleMapsUrl } from '../../services/itinerary';

// A shared run — the memento of the day. Someone threads a route, sends the
// link, and this page draws the whole thing for the group: the map, the
// times, the Somm's notes. Read-only by design; "Make it your own" copies
// the stops into the visitor's planner.

const SharedRun: React.FC = () => {
  const { region, regionId } = useRegion();
  const { wineries, experiences } = useCatalog();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const run = useMemo(() => {
    const encoded = searchParams.get('run');
    return encoded ? decodeShareableRun(encoded) : null;
  }, [searchParams]);

  const stops = useMemo(() => {
    if (!run) return [];
    return run.stops
      .map(s => {
        const winery = wineries.find(w => w.id === s.id);
        const experience = winery ? undefined : experiences.find(e => e.id === s.id);
        const item = winery ?? experience;
        if (!item) return null;
        return {
          ...s,
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          image: item.image,
          description: item.description,
          sommNote: winery?.sommNote,
          type: winery ? ('winery' as const) : ('experience' as const),
          specialty: winery?.specialty ?? experience?.category,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      arrival: string;
      isLunchStop: boolean;
      name: string;
      lat: number;
      lng: number;
      image: any;
      description: string;
      sommNote?: string;
      type: 'winery' | 'experience';
      specialty?: string;
    }>;
  }, [run, wineries, experiences]);

  if (!run || stops.length === 0) {
    return (
      <div className="py-24 text-center animate-fade-in">
        <p className="font-display text-3xl text-ink mb-3">This trail has gone cold.</p>
        <p className="font-body text-ink/50 mb-8">
          The link is missing its stops, or they belong to a different region.
        </p>
        <Link
          to={`/${regionId}/plan`}
          className="inline-block font-ui text-sm font-semibold bg-claret text-parchment px-6 py-3 rounded-sm hover:bg-claret-deep transition-colors"
        >
          Plan your own day
        </Link>
      </div>
    );
  }

  const mapsUrl = googleMapsUrl(run.start, stops);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const makeItYourOwn = () => {
    localStorage.setItem(`sommPlannerIds-${region.id}`, JSON.stringify(stops.map(s => s.id)));
    localStorage.removeItem(`sommItinerary-${region.id}`);
  };

  const stopIcon = (s: { type: string; isLunchStop: boolean }) =>
    s.isLunchStop ? (
      <UtensilsCrossed className="w-3.5 h-3.5 text-brass" />
    ) : s.type === 'winery' ? (
      <Wine className="w-3.5 h-3.5 text-claret" />
    ) : (
      <Compass className="w-3.5 h-3.5 text-vine" />
    );

  return (
    <div className="py-10 max-w-4xl mx-auto animate-fade-in">
      {/* The memento header */}
      <div className="bg-ink text-parchment rounded-sm p-6 md:p-10">
        <Kicker className="!text-brass-soft mb-3">A day in {region.shortName} · drawn by the Somm</Kicker>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          {stops.length} stops, one <span className="italic">good</span> day
        </h1>
        <p className="font-body text-parchment/70 mt-4 leading-relaxed">
          Setting off from {run.start.name} at ten. {stops.map(s => s.name).join(' → ')}.
          Glasses down by {run.estimatedEnd}.
        </p>
        <div className="flex gap-5 mt-5 font-ui text-xs font-semibold uppercase tracking-kicker text-brass-soft">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Finish {run.estimatedEnd}
          </span>
          <span className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4" /> {stops.length} stops
          </span>
        </div>
      </div>

      {/* The route, drawn */}
      <div className="mt-6 bg-paper border border-hairline rounded-sm h-[360px] md:h-[420px] relative overflow-hidden">
        <MapLayer stops={stops.map((s, i) => ({ ...s, id: i + 1 }))} />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={() => window.open(mapsUrl, '_blank')}>
          <ExternalLink className="w-4 h-4" /> Open in Google Maps
        </Button>
        <Button variant="secondary" onClick={copyLink}>
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link copied' : 'Share the day'}
        </Button>
        <Link
          to={`/${regionId}/plan`}
          onClick={makeItYourOwn}
          className="flex items-center justify-center gap-2 font-ui text-sm font-semibold border border-hairline bg-paper text-ink px-4 py-3 rounded-sm hover:border-ink/40 transition-colors"
        >
          Make it your own
        </Link>
      </div>

      {/* The stops, hour by hour */}
      <div className="mt-10 space-y-0 border-l border-hairline ml-3">
        {stops.map((s, i) => (
          <div key={s.id} className="relative pl-8 pb-10 last:pb-2">
            <span className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-claret text-parchment font-ui text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="sm:w-44 shrink-0">
                <ImageWithLoader asset={s.image} className="aspect-[4/3] rounded-sm" />
              </div>
              <div className="min-w-0">
                <p className="font-ui text-xs font-semibold text-brass">{s.arrival}</p>
                <h3 className="font-display text-2xl text-ink leading-snug mt-0.5 flex items-center gap-2">
                  {s.name} {stopIcon(s)}
                </h3>
                {s.specialty && (
                  <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40 mt-1">
                    {s.specialty}{s.isLunchStop ? ' · lunch here' : ''}
                  </p>
                )}
                <p className="font-body text-sm text-ink/60 mt-2 leading-relaxed">{s.description}</p>
                {s.sommNote && (
                  <p className="font-body text-sm italic text-ink/50 mt-2 leading-relaxed">
                    “{s.sommNote}”
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center font-ui text-[10px] uppercase tracking-kicker text-ink/30">
        Somm · {region.name} · the world's great wine regions, walked properly
      </p>
    </div>
  );
};

export default SharedRun;
