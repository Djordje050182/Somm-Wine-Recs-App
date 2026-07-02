import React, { useState } from 'react';
import { Loader2, AlertCircle, RefreshCcw, Wine, UtensilsCrossed, Compass, Car, MapPin } from 'lucide-react';
import { generateTripItinerary, isAIEnabled } from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { SectionHeading, Button, Card, Kicker } from './ui';

// The concierge IS the Somm: tell them the shape of the trip and they will
// sketch the whole thing — no forms longer than a wine list.

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
  const { region } = useRegion();
  const { wineries } = useCatalog();

  const [params, setParams] = useState({ days: 1, group: 'Couple', vibe: 'Relaxed', style: 'Mix', budget: 'Any' });
  const [trip, setTrip] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiEnabled = isAIEnabled();

  const set = (key: string) => (val: any) => setParams(p => ({ ...p, [key]: val }));

  const getWineries = () => {
    return wineries.filter(w => {
      if (params.budget === 'Save') return w.tastingFee <= 10;
      if (params.budget === 'Splurge') return w.priceRange === '$$$' || w.tastingFee >= 20;
      if (params.group.includes('kids') || params.group.includes('Family')) return w.kidFriendly;
      const spec = (w.specialty + w.wines.join(' ')).toLowerCase();
      if (params.style === 'Reds') return spec.includes('shiraz') || spec.includes('cabernet');
      if (params.style === 'Whites') return spec.includes('semillon') || spec.includes('chardonnay');
      if (params.style === 'Sparkling') return spec.includes('sparkling');
      return true;
    });
  };

  const generate = async () => {
    if (!aiEnabled) return;
    setGenerating(true);
    setTrip(null);
    setError(null);
    try {
      const shortlist = getWineries();
      const names = (shortlist.length >= 3 ? shortlist : wineries).map(w => w.name);
      const result = await generateTripItinerary(region, params.days, params.group, params.vibe, names);
      if (!result?.days?.length) throw new Error('The Somm returned an empty page');
      setTrip(result);
    } catch (e: any) {
      setError(e.message || 'The plan would not come together. Try again in a moment.');
    }
    setGenerating(false);
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
        standfirst={`Days, company, appetite — the Somm will sketch your run through ${region.shortName} from there.`}
      />

      {!trip && (
        <Card className="mt-10 p-6 md:p-8 space-y-8">
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

          {!aiEnabled && (
            <div className="flex items-start gap-2 font-ui text-xs text-terracotta border border-terracotta/40 rounded-sm px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>The Somm is away from the table. Set VITE_AI_PROXY_URL to bring them back.</span>
            </div>
          )}

          <Button size="lg" className="w-full" onClick={generate} disabled={generating || !aiEnabled}>
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

          <Button variant="secondary" className="w-full" onClick={() => { setTrip(null); setError(null); }}>
            <RefreshCcw className="w-4 h-4" /> Plan a different trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default Concierge;
