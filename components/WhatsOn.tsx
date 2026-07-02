import React, { useState } from 'react';
import { Calendar, MapPin, Loader2, RefreshCcw } from 'lucide-react';
import { searchEvents, isAIEnabled } from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { SectionHeading, Button, Tag, EmptyState } from './ui';

// What's on — the Somm checks the diary for festivals, winemaker dinners
// and music in the vines across the coming twelve months.

interface RegionEvent {
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
}

const WhatsOn: React.FC = () => {
  const { region } = useRegion();
  const [events, setEvents] = useState<RegionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const aiEnabled = isAIEnabled();

  const load = async () => {
    if (!aiEnabled) return;
    setLoading(true);
    try {
      setEvents(await searchEvents(region));
      setLoaded(true);
    } catch {
      setEvents([]);
      setLoaded(true);
    }
    setLoading(false);
  };

  return (
    <div className="py-10 animate-fade-in max-w-3xl">
      <div className="flex items-end justify-between gap-6 mb-10">
        <SectionHeading
          kicker="The diary"
          title={`What's on in ${region.shortName}`}
          standfirst="Festivals, winemaker dinners and music drifting over the vines — the Somm keeps the diary."
        />
        {loaded && (
          <button
            onClick={load}
            className="shrink-0 p-2.5 border border-hairline rounded-sm text-ink/50 hover:border-ink hover:text-ink transition-colors"
            aria-label="Refresh the diary"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!loaded && !loading && (
        <div className="border border-hairline rounded-sm bg-paper">
          <EmptyState
            title="The diary is closed"
            body={
              aiEnabled
                ? `Ask the Somm what's coming up in ${region.name} over the next twelve months.`
                : 'The Somm is offline for now — the diary opens once he is connected.'
            }
            action={
              <Button onClick={load} disabled={!aiEnabled}>
                <Calendar className="w-4 h-4" /> Open the diary
              </Button>
            }
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-claret" />
          <p className="font-body text-sm text-ink/50 italic">The Somm is checking the diary…</p>
        </div>
      )}

      {loaded && !loading && events.length === 0 && (
        <EmptyState
          title="A quiet stretch"
          body="Nothing in the diary just now. The valley awaits — try again shortly."
          action={<Button variant="secondary" size="sm" onClick={load}>Ask again</Button>}
        />
      )}

      {!loading && events.length > 0 && (
        <div className="border border-hairline divide-y divide-hairline bg-paper rounded-sm">
          {events.map((event, i) => (
            <article key={i} className="p-5 md:p-6 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Tag>{event.category}</Tag>
                  <h3 className="font-display text-xl text-ink mt-2 leading-snug">{event.title}</h3>
                  <p className="font-body text-sm text-ink/60 mt-1.5 leading-relaxed">{event.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 font-ui text-xs text-ink/50">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brass" /> {event.date}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brass" /> {event.location}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatsOn;
