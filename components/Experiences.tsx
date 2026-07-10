import React, { useMemo, useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { Experience, ExperienceCategory } from '../types';
import { SectionHeading, EmptyState } from './ui';
import ImageWithLoader from './ImageWithLoader';
import GuideModal from './GuideModal';

// Beyond the vines — the region's dining, adventures and diversions,
// in the same hairline-card idiom as the winery directory.

const CATEGORIES: Array<'All' | ExperienceCategory> = ['All', 'Dining', 'Adventure', 'Nature', 'Golf', 'Shopping', 'Family'];

const Experiences: React.FC = () => {
  const { region } = useRegion();
  const { experiences } = useCatalog();
  const [selected, setSelected] = useState<Experience | null>(null);
  const [filter, setFilter] = useState<'All' | ExperienceCategory>('All');

  const filtered = useMemo(
    () => (filter === 'All' ? experiences : experiences.filter(e => e.category === filter)),
    [experiences, filter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.rating - a.rating), [filtered]);

  // Only offer chips for categories the region actually stocks — a young
  // region may not cover the full menu yet.
  const categories = useMemo(
    () => CATEGORIES.filter(cat => cat === 'All' || experiences.some(e => e.category === cat)),
    [experiences]
  );

  return (
    <div className="py-10 animate-fade-in">
      {selected && <GuideModal item={selected} type="experience" onClose={() => setSelected(null)} />}

      <SectionHeading
        kicker="Beyond the vines"
        title="When the tasting glasses are down"
        standfirst={`Long lunches, balloon flights, back roads — the best of ${region.shortName} away from the cellar door.`}
      />

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mt-8 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
              filter === cat ? 'border-claret bg-claret text-parchment' : 'border-hairline text-ink/60 hover:border-ink/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Nothing here yet" body="No listings in this corner of the guide — the valley awaits." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
          {sorted.map(exp => (
            <button
              key={exp.id}
              onClick={() => setSelected(exp)}
              className="bg-paper text-left group flex flex-col hover:bg-parchment transition-colors"
            >
              <div className="aspect-[3/2] overflow-hidden">
                <ImageWithLoader
                  asset={exp.image}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-brass">{exp.category}</p>
                <div className="flex items-baseline justify-between gap-3 mt-1">
                  <h3 className="font-display text-xl text-ink leading-snug">{exp.name}</h3>
                  <span className="font-ui text-xs font-semibold text-brass shrink-0">{exp.rating.toFixed(1)}</span>
                </div>
                <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {exp.subregion} · {exp.priceRange}
                </p>
                <p className="font-body text-sm text-ink/60 mt-3 leading-relaxed line-clamp-2">{exp.description}</p>
                <div className="mt-4 pt-3 border-t border-hairline">
                  <p className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-brass mb-1">The Somm's note</p>
                  <p className="font-body text-sm italic text-ink/70 leading-relaxed line-clamp-2">{exp.sommNote}</p>
                </div>
                <p className="font-ui text-[10px] text-ink/40 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {exp.opens}–{exp.closes}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experiences;
