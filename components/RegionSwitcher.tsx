import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import { useRegion } from '../contexts/RegionContext';
import { COMING_SOON_REGIONS } from '../data/regions';

// The promise of the product: one app, many regions. Live regions navigate;
// coming-soon regions whet the appetite.

const RegionSwitcher: React.FC = () => {
  const { region, liveRegions } = useRegion();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/70 hover:text-claret transition-colors py-2"
      >
        <MapPin className="w-3.5 h-3.5 text-brass" />
        <span className="hidden sm:inline">{region.name}</span>
        <span className="sm:hidden">{region.shortName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-paper border border-hairline rounded-sm shadow-sm z-50 animate-fade-in">
          <div className="px-4 pt-4 pb-2">
            <p className="kicker">Wine regions</p>
          </div>
          {liveRegions.map(({ region: r }) => (
            <button
              key={r.id}
              onClick={() => {
                setOpen(false);
                navigate(`/${r.id}`);
              }}
              className={`w-full text-left px-4 py-3 border-t border-hairline hover:bg-parchment transition-colors ${
                r.id === region.id ? 'bg-parchment' : ''
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg text-ink">{r.name}</span>
                <span className="font-ui text-[10px] uppercase tracking-kicker text-vine">Live</span>
              </div>
              <p className="font-body text-sm text-ink/50 mt-0.5 leading-snug">{r.strapline}</p>
            </button>
          ))}
          {COMING_SOON_REGIONS.map(r => (
            <div key={r.id} className="w-full text-left px-4 py-3 border-t border-hairline opacity-60 cursor-default">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg text-ink">{r.name}</span>
                <span className="font-ui text-[10px] uppercase tracking-kicker text-brass">{r.eta}</span>
              </div>
              <p className="font-body text-sm text-ink/50 mt-0.5 leading-snug">{r.strapline}</p>
            </div>
          ))}
          <div className="px-4 py-3 border-t border-hairline">
            <p className="font-body text-xs text-ink/40 italic">
              New regions join the cellar as we walk them properly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionSwitcher;
