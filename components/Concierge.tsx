import React, { useState } from 'react';
import { generateTripItinerary, isAIEnabled } from '../services/claudeService';
import { WINERIES } from '../data/wineries';
import { Sparkles, Loader2, Calendar, Users, MapPin, Coffee, Wine, AlertCircle, DollarSign, RefreshCcw, ChevronRight } from 'lucide-react';

const OPTIONS = {
  days: [1, 2, 3],
  group: ['Solo', 'Couple', 'Small Group', 'Family with Kids', 'Corporate'],
  vibe: ['Relaxed', 'Adventure', 'Romantic', 'Foodie', 'Education'],
  style: ['Mix', 'Reds', 'Whites', 'Sparkling'],
  budget: ['Any', 'Save', 'Moderate', 'Splurge'],
};

const ACTIVITY_ICONS: Record<string, string> = { winery: '🍷', dining: '🍽️', experience: '🌿', travel: '🚗' };

const Concierge: React.FC = () => {
  const [params, setParams] = useState({ days: 1, group: 'Couple', vibe: 'Relaxed', style: 'Mix', budget: 'Any' });
  const [trip, setTrip] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiEnabled = isAIEnabled();

  const set = (key: string) => (val: any) => setParams(p => ({ ...p, [key]: val }));

  const getWineries = () => {
    return WINERIES.filter(w => {
      if (params.budget === 'Save') return w.tastingFee <= 10;
      if (params.budget === 'Splurge') return w.priceRange === '$$$' || w.tastingFee >= 20;
      if (params.group.includes('Kids') || params.group.includes('Family')) return w.kidFriendly;
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
      const wineries = getWineries();
      const names = (wineries.length >= 3 ? wineries : WINERIES).map(w => w.name);
      const result = await generateTripItinerary(params.days, params.group, params.vibe, names);
      if (!result?.days?.length) throw new Error('Invalid itinerary returned');
      setTrip(result);
    } catch (e: any) {
      setError(e.message || 'Could not generate itinerary. Please try again.');
    }
    setGenerating(false);
  };

  const Pill = ({ opts, val, onChange }: { opts: any[]; val: any; onChange: (v: any) => void }) => (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <button key={o} onClick={() => onChange(o)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${val === o ? 'bg-[#1a1a1a] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-wine font-serif">Trip Concierge</h2>
        <p className="text-gray-500 text-sm mt-1">Describe your perfect day and let AI plan the route.</p>
      </div>

      {!trip && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          {[
            { label: 'How many days?', icon: <Calendar className="w-4 h-4" />, key: 'days', opts: OPTIONS.days },
            { label: 'Who\'s coming?', icon: <Users className="w-4 h-4" />, key: 'group', opts: OPTIONS.group },
            { label: 'What\'s the vibe?', icon: <Sparkles className="w-4 h-4" />, key: 'vibe', opts: OPTIONS.vibe },
            { label: 'Wine style', icon: <Wine className="w-4 h-4" />, key: 'style', opts: OPTIONS.style },
            { label: 'Budget', icon: <DollarSign className="w-4 h-4" />, key: 'budget', opts: OPTIONS.budget },
          ].map(({ label, icon, key, opts }) => (
            <div key={key}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">{icon} {label}</p>
              <Pill opts={opts} val={(params as any)[key]} onChange={set(key)} />
            </div>
          ))}

          {!aiEnabled && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>AI proxy not configured. Set VITE_AI_PROXY_URL to enable trip planning.</span>
            </div>
          )}

          <button
            onClick={generate}
            disabled={generating || !aiEnabled}
            className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-black transition disabled:opacity-40"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-gold" />}
            {generating ? 'Planning your trip...' : 'Generate My Itinerary'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Couldn't generate trip</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {trip && (
        <div className="animate-slide-up space-y-5">
          <div className="bg-wine text-white rounded-3xl p-6">
            <h3 className="text-2xl font-black font-serif mb-2">{trip.tripName}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{trip.summary}</p>
          </div>

          {trip.days.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="font-black text-sm text-gray-700 uppercase tracking-wide">{day.dayTitle || `Day ${i + 1}`}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {(day.activities || []).map((act: any, j: number) => (
                  <div key={j} className="flex gap-4 px-5 py-4">
                    <div className="text-right shrink-0 pt-0.5">
                      <p className="text-xs font-bold text-gold">{act.time}</p>
                    </div>
                    <div className="w-px bg-gray-100 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <span>{ACTIVITY_ICONS[act.type] || '📍'}</span>
                        {act.activity}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={() => { setTrip(null); setError(null); }} className="w-full py-3.5 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:border-wine hover:text-wine transition">
            <RefreshCcw className="w-4 h-4" /> Plan a Different Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default Concierge;
