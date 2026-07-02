import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { Kicker } from './ui';
import ImageWithLoader from './ImageWithLoader';
import { Winery, WineDetail, Experience } from '../types';

// Search across the whole region — estates, bottles, experiences — and land
// somewhere useful. Quick links are drawn from the region itself, so the
// panel travels well when new regions arrive.

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResultGroup {
  label: string;
  items: { id: string; name: string; meta: string; image: WineDetail['image']; go: () => void }[];
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { region, regionId } = useRegion();
  const { wines, wineries, experiences, getWinery } = useCatalog();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  // Quick links come from the region's own data: its leading grapes and its
  // best-regarded estates — never a hardcoded name.
  const quickLinks = useMemo(() => {
    const grapes = region.varietyMix
      .filter(v => !/other/i.test(v.name) && !v.name.includes('&'))
      .slice(0, 3)
      .map(v => v.name);
    const estates = [...wineries]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map(w => w.name);
    return [...grapes, ...estates];
  }, [region, wineries]);

  const results = useMemo<ResultGroup[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matchedWineries = wineries
      .filter(
        (w: Winery) =>
          w.name.toLowerCase().includes(q) ||
          w.subregion.toLowerCase().includes(q) ||
          w.specialty.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedWines = wines
      .filter((w: WineDetail) => w.name.toLowerCase().includes(q) || w.variety.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedExperiences = experiences
      .filter((e: Experience) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
      .slice(0, 3);

    const groups: ResultGroup[] = [];
    if (matchedWineries.length > 0) {
      groups.push({
        label: 'Estates',
        items: matchedWineries.map(w => ({
          id: w.id,
          name: w.name,
          meta: `${w.subregion} · ${w.specialty}`,
          image: w.image,
          go: () => go(`/${regionId}/wines?winery=${encodeURIComponent(w.id)}`),
        })),
      });
    }
    if (matchedWines.length > 0) {
      groups.push({
        label: 'Bottles',
        items: matchedWines.map(w => ({
          id: w.id,
          name: w.name,
          meta: `${w.variety} · ${getWinery(w.wineryId)?.name ?? ''}`,
          image: w.image,
          go: () => go(`/${regionId}/wines?winery=${encodeURIComponent(w.wineryId)}`),
        })),
      });
    }
    if (matchedExperiences.length > 0) {
      groups.push({
        label: 'Experiences',
        items: matchedExperiences.map(e => ({
          id: e.id,
          name: e.name,
          meta: `${e.category} · ${e.subregion}`,
          image: e.image,
          go: () => go(`/${regionId}/guide/experiences`),
        })),
      });
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, wines, wineries, experiences, regionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-6 sm:pt-24 px-4">
      <div className="absolute inset-0 bg-ink/60 animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-paper border border-hairline rounded-sm flex flex-col max-h-[75vh] animate-scale-in">
        {/* Search bar */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-hairline">
          <Search className="w-5 h-5 text-brass shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${region.shortName} — estates, bottles, experiences…`}
            className="flex-1 bg-transparent font-body text-lg text-ink placeholder:text-ink/30 focus:outline-none min-w-0"
          />
          <button onClick={onClose} aria-label="Close search" className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-xl text-ink">Nothing found for “{query}”.</p>
              <p className="font-body text-sm text-ink/50 mt-2">Try a grape, an estate, or something to do.</p>
            </div>
          )}

          {!query.trim() && (
            <div className="px-6 py-6">
              <Kicker className="mb-3">Worth a look</Kicker>
              <div className="flex gap-2 flex-wrap">
                {quickLinks.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="font-ui text-xs font-semibold uppercase tracking-kicker px-3 py-2 border border-hairline rounded-sm text-ink/60 hover:border-claret hover:text-claret transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map(group => (
            <div key={group.label} className="px-3 py-3 border-b border-hairline last:border-b-0">
              <Kicker className="px-3 pb-2">{group.label}</Kicker>
              <div>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={item.go}
                    className="w-full flex items-center gap-4 px-3 py-2.5 text-left group hover:bg-parchment transition-colors rounded-sm"
                  >
                    <div className="w-11 h-11 shrink-0">
                      <ImageWithLoader asset={item.image} className="w-full h-full rounded-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-display text-base text-ink leading-snug truncate group-hover:text-claret transition-colors">
                        {item.name}
                      </h5>
                      <p className="font-ui text-xs text-ink/50 truncate">{item.meta}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink/20 group-hover:text-claret shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-hairline text-center">
          <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/30">
            Press esc to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
