import React, { useMemo, useState } from 'react';
import { Clock, PawPrint, Baby, UtensilsCrossed, CalendarCheck, Search, X } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { SectionHeading, Tag, EmptyState } from '../../components/ui';
import ImageWithLoader from '../../components/ImageWithLoader';
import GuideModal from '../../components/GuideModal';
import { Winery } from '../../types';

// The winery directory — the region's estates, grouped and filterable by
// subregion, in the wine-list idiom.

const WineryDirectory: React.FC = () => {
  const { region } = useRegion();
  const { wineries, winesForWinery } = useCatalog();
  const [subregion, setSubregion] = useState<string | null>(null);
  const [selected, setSelected] = useState<Winery | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = subregion ? wineries.filter(w => w.subregion === subregion) : wineries;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        w =>
          w.name.toLowerCase().includes(q) ||
          w.specialty.toLowerCase().includes(q) ||
          w.style.toLowerCase().includes(q) ||
          w.subregion.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.wines.some(name => name.toLowerCase().includes(q)) ||
          winesForWinery(w.id).some(wine => wine.name.toLowerCase().includes(q) || wine.variety.toLowerCase().includes(q))
      );
    }
    return list;
  }, [wineries, subregion, query, winesForWinery]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.rating - a.rating),
    [filtered]
  );

  // Only offer chips for corners that actually hold estates — a young region
  // may declare more subregions than it has listings for yet.
  const populatedSubregions = useMemo(
    () => region.subregions.filter(s => wineries.some(w => w.subregion === s.name)),
    [region.subregions, wineries]
  );

  return (
    <div className="py-10 animate-fade-in">
      {selected && <GuideModal item={selected} type="winery" onClose={() => setSelected(null)} />}

      <SectionHeading
        kicker={`${wineries.length} estates`}
        title={`The cellar doors of ${region.shortName}`}
        standfirst="Every estate here has been walked, tasted and argued over. Filter by corner of the valley."
      />

      <div className="relative max-w-xl mt-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search estates — try a name, a grape, or a wine…"
          className="w-full bg-paper border border-hairline rounded-sm pl-10 pr-10 py-3 font-ui text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors [&::-webkit-search-cancel-button]:hidden"
          aria-label="Search estates"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mt-4 mb-10">
        <button
          onClick={() => setSubregion(null)}
          className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
            !subregion ? 'border-claret bg-claret text-parchment' : 'border-hairline text-ink/60 hover:border-ink/40'
          }`}
        >
          All
        </button>
        {populatedSubregions.map(s => (
          <button
            key={s.id}
            onClick={() => setSubregion(s.name)}
            className={`font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border rounded-sm transition-colors ${
              subregion === s.name ? 'border-claret bg-claret text-parchment' : 'border-hairline text-ink/60 hover:border-ink/40'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {subregion && (
        <p className="font-body text-ink/50 italic mb-8 max-w-2xl">
          {region.subregions.find(s => s.name === subregion)?.blurb}
        </p>
      )}

      {sorted.length === 0 ? (
        query ? (
          <EmptyState
            title="Nothing by that name"
            body={`No estate matches “${query.trim()}”${subregion ? ` in ${subregion}` : ''}. Try a grape, a wine, or a corner of the valley — or ask the Somm.`}
          />
        ) : (
          <EmptyState title="Nothing here yet" body="No estates listed in this corner of the valley — for now." />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
          {sorted.map(w => (
            <button
              key={w.id}
              onClick={() => setSelected(w)}
              className="bg-paper text-left group flex flex-col hover:bg-parchment transition-colors"
            >
              <div className="aspect-[3/2] overflow-hidden">
                <ImageWithLoader
                  asset={w.image}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl text-ink leading-snug">{w.name}</h3>
                  <span className="font-ui text-xs font-semibold text-brass shrink-0">{w.rating.toFixed(1)}</span>
                </div>
                <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                  {w.subregion} · est. {w.established}
                </p>
                <p className="font-body text-sm text-ink/60 mt-3 leading-relaxed line-clamp-2">{w.description}</p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-hairline text-ink/40">
                  <span className="font-ui text-[10px] uppercase tracking-kicker">{w.specialty}</span>
                  <span className="flex-1" />
                  {w.bookingRequired && <CalendarCheck className="w-3.5 h-3.5" aria-label="Booking required" />}
                  {w.hasRestaurant && <UtensilsCrossed className="w-3.5 h-3.5" aria-label="Restaurant" />}
                  {w.kidFriendly && <Baby className="w-3.5 h-3.5" aria-label="Kid friendly" />}
                  {w.dogFriendly && <PawPrint className="w-3.5 h-3.5" aria-label="Dog friendly" />}
                  <span className="font-ui text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {w.opens}–{w.closes}
                  </span>
                </div>
                {w.tastingFee === 0 && <Tag tone="success" className="mt-3 self-start">Free tasting</Tag>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WineryDirectory;
