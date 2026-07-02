import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { Kicker, EmptyState } from './ui';
import ImageWithLoader from './ImageWithLoader';

// The Saved tab of the Cellar — estates worth returning to and bottles worth
// chasing. Saves are string slug ids kept on this device.

const SAVED_WINERIES_KEY = 'sommFavWineries';
const SAVED_WINES_KEY = 'sommFavWines';

const readSaved = (key: string): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

interface FavoritesProps {
  user?: { name: string; email: string; tier?: string } | null;
}

const Favorites: React.FC<FavoritesProps> = ({ user }) => {
  const { getWinery, getWine } = useCatalog();
  const [savedWineryIds, setSavedWineryIds] = useState<string[]>([]);
  const [savedWineIds, setSavedWineIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedWineryIds(readSaved(SAVED_WINERIES_KEY));
    setSavedWineIds(readSaved(SAVED_WINES_KEY));
  }, []);

  const removeWinery = (id: string) => {
    const updated = savedWineryIds.filter(x => x !== id);
    setSavedWineryIds(updated);
    localStorage.setItem(SAVED_WINERIES_KEY, JSON.stringify(updated));
  };

  const removeWine = (id: string) => {
    const updated = savedWineIds.filter(x => x !== id);
    setSavedWineIds(updated);
    localStorage.setItem(SAVED_WINES_KEY, JSON.stringify(updated));
  };

  const savedWineries = savedWineryIds.map(getWinery).filter(w => w !== undefined);
  const savedWines = savedWineIds.map(getWine).filter(w => w !== undefined);
  const firstName = user?.name.split(' ')[0];

  return (
    <div className="py-10 animate-fade-in">
      <div className="space-y-2 mb-10">
        <Kicker>Saved</Kicker>
        <h2 className="font-display text-3xl md:text-4xl font-medium text-ink leading-tight">
          {firstName ? `${firstName}'s corner of the valley` : 'Your corner of the valley'}
        </h2>
        <p className="font-body text-lg text-ink/60 max-w-2xl">
          Estates worth returning to, and bottles worth chasing down.
        </p>
      </div>

      {!user && (savedWineries.length > 0 || savedWines.length > 0) && (
        <p className="font-body text-sm italic text-ink/50 border border-hairline bg-paper rounded-sm px-4 py-3 mb-10 max-w-2xl">
          Saved to this device only. Sign in and the Somm will keep it everywhere you go.
        </p>
      )}

      {savedWineries.length === 0 && savedWines.length === 0 ? (
        <EmptyState
          title="Nothing saved yet. The valley awaits."
          body="Tap the heart on any estate or bottle in the library and it will keep here, ready for the next visit."
        />
      ) : (
        <div className="space-y-16">
          {/* Saved estates */}
          <section>
            <div className="flex items-baseline justify-between border-b border-hairline pb-3 mb-6">
              <h3 className="font-display text-2xl text-ink">Estates</h3>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40">
                {savedWineries.length} saved
              </span>
            </div>

            {savedWineries.length === 0 ? (
              <p className="font-body text-ink/50 italic">
                No estates saved yet — the cellar doors are waiting.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
                {savedWineries.map(w => (
                  <div key={w.id} className="bg-paper flex flex-col group">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <ImageWithLoader asset={w.image} className="w-full h-full" />
                      <button
                        onClick={() => removeWinery(w.id)}
                        aria-label={`Remove ${w.name} from saved`}
                        className="absolute top-3 right-3 p-1.5 bg-paper border border-hairline rounded-sm text-ink/40 hover:text-terracotta transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-display text-xl text-ink leading-snug">{w.name}</h4>
                        <span className="font-ui text-xs font-semibold text-brass shrink-0">
                          {w.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="font-ui text-[10px] uppercase tracking-kicker text-ink/40 mt-1">
                        {w.subregion} · {w.style}
                      </p>
                      {w.sommNote && (
                        <p className="font-body text-sm italic text-ink/60 mt-3 leading-relaxed line-clamp-3">
                          <span className="font-ui not-italic text-[10px] font-semibold uppercase tracking-kicker text-brass mr-2">
                            The Somm's note
                          </span>
                          {w.sommNote}
                        </p>
                      )}
                      <div className="mt-auto pt-4 font-ui text-[10px] uppercase tracking-kicker text-ink/40">
                        Open {w.opens}–{w.closes} · Tasting {w.tastingFee === 0 ? 'free' : `$${w.tastingFee}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved bottles */}
          <section>
            <div className="flex items-baseline justify-between border-b border-hairline pb-3 mb-6">
              <h3 className="font-display text-2xl text-ink">Bottles</h3>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker text-ink/40">
                {savedWines.length} saved
              </span>
            </div>

            {savedWines.length === 0 ? (
              <p className="font-body text-ink/50 italic">
                No bottles saved yet — the list is long and forgiving.
              </p>
            ) : (
              <div className="border border-hairline bg-paper">
                {savedWines.map((wine, i) => {
                  const winery = getWinery(wine.wineryId);
                  return (
                    <article
                      key={wine.id}
                      className={`flex gap-4 sm:gap-5 p-4 sm:p-5 ${i > 0 ? 'border-t border-hairline' : ''}`}
                    >
                      <div className="w-16 sm:w-20 shrink-0">
                        <ImageWithLoader asset={wine.image} className="w-full aspect-[3/4] rounded-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Kicker>{wine.variety}</Kicker>
                            <h4 className="font-display text-lg sm:text-xl text-ink leading-snug mt-1">
                              {wine.name}
                            </h4>
                            <p className="font-ui text-xs text-ink/50 mt-0.5">
                              {winery?.name} · {wine.vintage}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="font-display text-lg font-medium text-brass">{wine.price}</span>
                            <button
                              onClick={() => removeWine(wine.id)}
                              aria-label={`Remove ${wine.name} from saved`}
                              className="text-ink/30 hover:text-terracotta transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {wine.sommNote && (
                          <p className="font-body text-sm italic text-ink/60 mt-2 leading-relaxed line-clamp-2">
                            <span className="font-ui not-italic text-[10px] font-semibold uppercase tracking-kicker text-brass mr-2">
                              The Somm's note
                            </span>
                            {wine.sommNote}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Favorites;
