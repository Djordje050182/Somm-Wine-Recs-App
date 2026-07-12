import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ExternalLink, ShoppingBag, Trash2 } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { useCart } from '../../contexts/CartContext';
import { getTastings, onTastingsChange, recordTasting, removeTasting } from '../../services/tasteProfile';
import { SectionHeading, EmptyState, Kicker, Tag, Button } from '../../components/ui';
import ImageWithLoader from '../../components/ImageWithLoader';

// The tasting book — the trip's afterlife. Everything the guest marked at a
// cellar door, with the two actions that matter later: buy it again, and
// find your way back to the estate.

const TastingBook: React.FC = () => {
  const { region, regionId } = useRegion();
  const { wines, wineries } = useCatalog();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => onTastingsChange(() => setTick(x => x + 1)), []);

  const entries = useMemo(() => {
    void tick;
    return getTastings()
      .filter(t => t.regionId === region.id)
      .map(t => ({
        tasting: t,
        wine: wines.find(w => w.id === t.wineId),
      }))
      .filter(e => e.wine)
      .sort((a, b) => (a.tasting.date < b.tasting.date ? 1 : -1));
  }, [tick, wines, region.id]);

  if (entries.length === 0) {
    return (
      <div className="py-10">
        <EmptyState
          title="Your tasting book is blank"
          body='Open any wine and tap "I tasted this" at the cellar door — the book writes itself, and the Somm starts to learn your palate.'
        />
      </div>
    );
  }

  return (
    <div className="py-10 animate-fade-in">
      <SectionHeading
        kicker={`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
        title="Your tasting book"
        standfirst="What you tasted, where, and the two buttons that matter afterwards: buy it again, or go back."
      />
      <div className="mt-8 space-y-px bg-hairline border border-hairline">
        {entries.map(({ tasting, wine }) => {
          const estate = wineries.find(w => w.id === wine!.wineryId);
          return (
            <div key={wine!.id} className="bg-paper p-4 sm:p-5 flex gap-4 items-start">
              <ImageWithLoader asset={wine!.image} className="w-16 h-16 shrink-0 rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-display text-lg text-ink leading-tight">{wine!.name}</h3>
                  {tasting.loved && (
                    <Tag tone="sale"><Heart className="w-3 h-3 inline -mt-0.5" /> Loved</Tag>
                  )}
                </div>
                <p className="font-ui text-xs text-ink/50 mt-0.5">
                  {estate?.name} · tasted {new Date(tasting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" onClick={() => addToCart(wine!.id)}>
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy again · {wine!.price}
                  </Button>
                  {estate && (
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/${regionId}/estates/${estate.id}`)}>
                      Back to {estate.name} <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {!tasting.loved && (
                    <button
                      onClick={() => recordTasting({ wineId: wine!.id, regionId: region.id, loved: true })}
                      className="font-ui text-xs font-semibold text-claret hover:text-claret-deep px-2"
                    >
                      Loved it
                    </button>
                  )}
                  <button
                    onClick={() => removeTasting(wine!.id)}
                    className="font-ui text-xs text-ink/40 hover:text-terracotta px-2 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="font-body text-sm text-ink/45 italic mt-6">
        The Somm reads this book. The more you mark, the sharper his recommendations get.
      </p>
    </div>
  );
};

export default TastingBook;
