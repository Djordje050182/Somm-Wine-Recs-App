import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, AlertCircle, RefreshCcw, Wine, UtensilsCrossed, Compass, Car,
  MapPin, ExternalLink, Share2, Check, Route,
} from 'lucide-react';
import { generateTripItinerary, isAIEnabled, TripCandidate } from '../services/claudeService';
import { draftTrip } from '../services/sommPlanner';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import {
  asRoutable, matchByName, threadRoute, encodeShareableRun, shareUrlForRun,
  googleMapsUrl, resolveStartPoint,
} from '../services/itinerary';
import { Itinerary } from '../types';
import MapLayer from './MapLayer';
import { SectionHeading, Button, Card, Kicker } from './ui';

// The concierge IS the Somm: tell them the shape of the trip — chips or your
// own words — and they sketch the whole thing, draw the route on the map,
// and hand you a link the group can open.

const OPTIONS = {
  days: [1, 2, 3],
  group: ['Solo', 'Couple', 'Small group', 'Family with kids', 'Corporate'],
  vibe: ['Relaxed', 'Adventure', 'Romantic', 'Foodie', 'Education'],
  style: ['Mix', 'Reds', 'Whites', 'Sparkling'],
  budget: ['Any', 'Save', 'Moderate', 'Splurge'],
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  winery: <Wine className="w-3.5 h-3.5 text-claret" />,
  dining: <UtensilsCrossed className="w-3.5 h-3.5 text-brass" />,
  experience: <Compass className="w-3.5 h-3.5 text-vine" />,
  travel: <Car className="w-3.5 h-3.5 text-ink/40" />,
};

const Concierge: React.FC = () => {
  const { region, regionId } = useRegion();
  const { wineries, experiences } = useCatalog();

  const [params, setParams] = useState({ days: 1, group: 'Couple', vibe: 'Relaxed', style: 'Mix', budget: 'Any' });
  const [freeText, setFreeText] = useState('');
  const [trip, setTrip] = useState<any>(null);
  const [routed, setRouted] = useState<{ itinerary: Itinerary; shareUrl: string; mapsUrl: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const aiEnabled = isAIEnabled();

  const set = (key: string) => (val: any) => setParams(p => ({ ...p, [key]: val }));

  const buildCandidates = (): TripCandidate[] => {
    const wineryCards: TripCandidate[] = wineries.map(w => ({
      name: w.name,
      kind: 'winery',
      notes: [
        w.specialty,
        w.kidFriendly ? 'kid-friendly' : 'adults-first',
        w.hasRestaurant ? 'has restaurant' : '',
        `tasting $${w.tastingFee}`,
        w.priceRange,
      ].filter(Boolean).join(', '),
    }));
    const experienceCards: TripCandidate[] = experiences.map(e => ({
      name: e.name,
      kind: 'experience',
      notes: [e.category, (e as any).kidFriendly ? 'kid-friendly' : ''].filter(Boolean).join(', '),
    }));
    return [...wineryCards, ...experienceCards];
  };

  const generate = async () => {
    setGenerating(true);
    setTrip(null);
    setRouted(null);
    setError(null);
    try {
      // Claude sketches when the proxy is live; otherwise the Somm drafts
      // instantly from his own book. The UI cannot tell the difference.
      const result = aiEnabled
        ? await generateTripItinerary(
            region, params.days, params.group, params.vibe, params.style, params.budget,
            freeText.trim(), buildCandidates()
          )
        : draftTrip(region, params, freeText.trim(), wineries, experiences);
      if (!result?.days?.length) throw new Error('The Somm returned an empty page');
      setTrip(result);

      // Thread day one onto the map: names → catalogue items → routed run.
      const catalogue = asRoutable(wineries, experiences);
      const stops = (result.stops ?? [])
        .map((name: string) => matchByName(catalogue, name))
        .filter(Boolean);
      if (stops.length >= 2) {
        const start = await resolveStartPoint(region);
        const itinerary = threadRoute(stops as any, start);
        if (itinerary) {
          localStorage.setItem(`sommPlannerIds-${region.id}`, JSON.stringify(itinerary.wineries.map(w => w.id)));
          localStorage.setItem(`sommItinerary-${region.id}`, JSON.stringify(itinerary));
          setRouted({
            itinerary,
            shareUrl: shareUrlForRun(region.id, encodeShareableRun(itinerary, start)),
            mapsUrl: googleMapsUrl(start, itinerary.wineries),
          });
        }
      }
    } catch (e: any) {
      setError(e.message || 'The plan would not come together. Try again in a moment.');
    }
    setGenerating(false);
  };

  const copyShareLink = () => {
    if (!routed) return;
    navigator.clipboard.writeText(routed.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const OptionRow = ({ opts, val, onChange }: { opts: any[]; val: any; onChange: (v: any) => void }) => (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
            val === o
              ? 'border-claret bg-claret text-parchment'
              : 'border-hairline bg-paper text-ink/60 hover:border-ink/40'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="py-10 max-w-3xl mx-auto animate-fade-in">
      <SectionHeading
        kicker="The concierge"
        title="Tell the Somm the shape of it"
        standfirst={`Days, company, appetite — or just say it in your own words. The Somm will sketch your run through ${region.shortName}, draw the route, and give you a link for the group.`}
      />

      {!trip && (
        <Card className="mt-10 p-6 md:p-8 space-y-8">
          <div>
            <Kicker className="mb-3">In your own words</Kicker>
            <textarea
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder={'"Two kids in tow, we love big reds, one proper lunch, nothing too polished…"'}
              className="w-full bg-paper border border-hairline rounded-sm px-3.5 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors resize-none"
            />
          </div>

          {[
            { label: 'How many days?', key: 'days', opts: OPTIONS.days },
            { label: "Who's coming?", key: 'group', opts: OPTIONS.group },
            { label: "What's the mood?", key: 'vibe', opts: OPTIONS.vibe },
            { label: 'Wine style', key: 'style', opts: OPTIONS.style },
            { label: 'Budget', key: 'budget', opts: OPTIONS.budget },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <Kicker className="mb-3">{label}</Kicker>
              <OptionRow opts={opts} val={(params as any)[key]} onChange={set(key)} />
            </div>
          ))}

          <Button size="lg" className="w-full" onClick={generate} disabled={generating}>
            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
            {generating ? 'The Somm is sketching your days…' : 'Draw up the plan'}
          </Button>
        </Card>
      )}

      {error && (
        <div className="mt-6 p-5 border border-terracotta/40 rounded-sm flex items-start gap-3 bg-paper">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-terracotta" />
          <div>
            <p className="font-ui text-sm font-semibold text-ink">That one slipped the net</p>
            <p className="font-body text-sm text-ink/60 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {trip && (
        <div className="mt-10 space-y-6 animate-slide-up">
          <div className="bg-ink text-parchment rounded-sm p-6 md:p-8">
            <Kicker className="!text-brass-soft mb-2">The Somm suggests</Kicker>
            <h3 className="font-display text-3xl leading-tight">{trip.tripName}</h3>
            <p className="font-body text-parchment/70 mt-3 leading-relaxed">{trip.summary}</p>
          </div>

          {/* The route, drawn — day one on the map with the group link */}
          {routed && (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 border-b border-hairline flex items-center justify-between">
                <p className="font-ui text-xs font-semibold uppercase tracking-kicker text-brass flex items-center gap-2">
                  <Route className="w-3.5 h-3.5" /> Day one, drawn
                </p>
                <p className="font-ui text-xs text-ink/40">
                  {routed.itinerary.wineries.length} stops · done by {routed.itinerary.estimatedEnd}
                </p>
              </div>
              <div className="h-[300px] relative">
                <MapLayer stops={routed.itinerary.wineries.map((s, i) => ({ ...s, id: i + 1 }))} />
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={() => window.open(routed.mapsUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4" /> Google Maps
                </Button>
                <Button variant="secondary" onClick={copyShareLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link copied' : 'Share with the group'}
                </Button>
                <Link
                  to={`/${regionId}/plan`}
                  className="flex items-center justify-center gap-2 font-ui text-sm font-semibold border border-hairline bg-paper text-ink px-4 py-2.5 rounded-sm hover:border-ink/40 transition-colors"
                >
                  <MapPin className="w-4 h-4" /> Fine-tune the run
                </Link>
              </div>
            </Card>
          )}

          {trip.days.map((day: any, i: number) => (
            <Card key={i} className="overflow-hidden">
              <div className="px-5 py-3 border-b border-hairline">
                <p className="font-ui text-xs font-semibold uppercase tracking-kicker text-brass">
                  {day.dayTitle || `Day ${i + 1}`}
                </p>
              </div>
              <div className="divide-y divide-hairline">
                {(day.activities || []).map((act: any, j: number) => (
                  <div key={j} className="flex gap-4 px-5 py-4">
                    <div className="w-16 text-right shrink-0 pt-0.5">
                      <p className="font-ui text-xs font-semibold text-brass">{act.time}</p>
                    </div>
                    <div className="w-px bg-hairline shrink-0" />
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-semibold text-ink flex items-center gap-2">
                        {ACTIVITY_ICONS[act.type] ?? <MapPin className="w-3.5 h-3.5 text-ink/40" />}
                        {act.activity}
                      </p>
                      <p className="font-body text-sm text-ink/60 mt-1 leading-relaxed">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <Button variant="secondary" className="w-full" onClick={() => { setTrip(null); setRouted(null); setError(null); }}>
            <RefreshCcw className="w-4 h-4" /> Plan a different trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default Concierge;
