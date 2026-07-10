import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { RegionEvent } from '../types';
import { SectionHeading, Tag, EmptyState } from './ui';

// What's on — the diary of real, verified regional events, bundled with the
// region's data so it works offline and never invents a festival. Ordered so
// the next things coming up sit at the top.

const MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

// Sort key: months until the event's (first) month next comes around.
const monthsUntil = (event: RegionEvent, now: Date): number => {
  const first = event.month.split(/[–-]/)[0].trim();
  const idx = MONTH_INDEX[first];
  if (idx === undefined) return 99;
  const diff = (idx - now.getMonth() + 12) % 12;
  return diff;
};

const CATEGORIES = ['All', 'Food & Wine', 'Music', 'Festival', 'Arts', 'Family', 'Sport'] as const;

const WhatsOn: React.FC = () => {
  const { region, events } = useRegion();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');

  const ordered = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter(e => category === 'All' || e.category === category)
      .sort((a, b) => monthsUntil(a, now) - monthsUntil(b, now));
  }, [events, category]);

  // Only offer chips for categories with entries — a young region's diary
  // may not cover the full spread yet.
  const categories = useMemo(
    () => CATEGORIES.filter(c => c === 'All' || events.some(e => e.category === c)),
    [events]
  );

  return (
    <div className="py-10 animate-fade-in max-w-3xl">
      <SectionHeading
        kicker="The diary"
        title={`What's on in ${region.shortName}`}
        standfirst="Festivals, winemaker dinners and music drifting over the vines — every entry real, checked against the organisers."
      />

      {events.length === 0 ? (
        <div className="border border-hairline rounded-sm bg-paper mt-10">
          <EmptyState
            title="The diary is quiet"
            body={`No events are listed for ${region.name} yet.`}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-8 mb-8">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
                  category === c
                    ? 'border-claret bg-claret text-parchment'
                    : 'border-hairline bg-paper text-ink/60 hover:border-ink/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {ordered.map(event => (
              <div key={event.title} className="border border-hairline rounded-sm bg-paper p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Tag>{event.category}</Tag>
                      <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-brass flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {event.month}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-ink leading-snug mt-3">{event.title}</h3>
                    <p className="font-ui text-xs text-ink/40 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm text-ink/65 leading-relaxed mt-3">{event.description}</p>
                <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                  {event.detail && (
                    <p className="font-ui text-xs font-semibold text-vine">{event.detail}</p>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-ui text-xs font-semibold text-claret hover:text-claret-deep flex items-center gap-1.5 transition-colors"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsOn;
