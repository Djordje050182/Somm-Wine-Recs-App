import React, { useState } from 'react';
import { useCatalog } from '../../contexts/CatalogContext';
import { partnerStore, getTier, parsePrice } from '../../services/commerce';
import { Button, Card, Tag, Kicker, EmptyState } from '../../components/ui';

// Offers — sale pricing that goes live in the consumer wine library the moment
// it is set. A Featured or Premier membership is required.

interface Props {
  wineryId: string;
  onGoToMembership: () => void;
}

const OfferManager: React.FC<Props> = ({ wineryId, onGoToMembership }) => {
  const { winesForWinery, getPricing } = useCatalog();
  const wines = winesForWinery(wineryId);

  const sub = partnerStore.getActiveSubscription(wineryId);
  const tier = getTier(sub?.tierId ?? 'listed')!;

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!tier.canCreateOffers) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink">Offers</h2>
          <p className="font-body text-ink/50 mt-1">Sale pricing, live in the library the moment you set it.</p>
        </div>
        <Card className="p-10 text-center">
          <Kicker className="mb-3">Featured and Premier</Kicker>
          <h3 className="font-display text-2xl text-ink mb-3">Offers travel fast on Somm</h3>
          <p className="font-body text-ink/60 max-w-md mx-auto mb-8">
            Special offers and sale pricing belong to the Featured and Premier memberships. Set a price here and travellers see it across the library, the map and the Somm's recommendations.
          </p>
          <Button onClick={onGoToMembership}>View memberships</Button>
        </Card>
      </div>
    );
  }

  const setDraft = (wineId: string, value: string) =>
    setDrafts(d => ({ ...d, [wineId]: value }));

  const handleSet = (wineId: string) => {
    const value = Number(drafts[wineId]);
    if (!value || value <= 0) return;
    partnerStore.setOffer(wineId, { salePrice: value, isOnSale: true });
    setDrafts(d => ({ ...d, [wineId]: '' }));
  };

  const handleClear = (wineId: string) => {
    partnerStore.clearOffer(wineId);
    setDrafts(d => ({ ...d, [wineId]: '' }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-medium text-ink">Offers</h2>
        <p className="font-body text-ink/50 mt-1">
          Set a sale price and it appears in the library immediately, with the list price struck through.
        </p>
      </div>

      {wines.length === 0 ? (
        <Card>
          <EmptyState
            title="No wines to put on offer"
            body="Add wines to your library first — then bring travellers in with a well-judged offer."
          />
        </Card>
      ) : (
        <Card className="divide-y divide-hairline">
          {wines.map(wine => {
            const pricing = getPricing(wine.id);
            const listPrice = parsePrice(wine.price);
            const draft = drafts[wine.id] ?? '';
            const draftValue = Number(draft);
            const draftValid = draftValue > 0 && draftValue < listPrice;
            const previewDiscount = draftValid ? Math.round(((listPrice - draftValue) / listPrice) * 100) : null;

            return (
              <div key={wine.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-semibold text-ink truncate">{wine.name}</p>
                  <p className="font-ui text-xs text-ink/40 mt-0.5">
                    {wine.variety}{wine.vintage ? ` · ${wine.vintage}` : ''} · list {wine.price}
                  </p>
                </div>

                {pricing.isSale ? (
                  <>
                    <span className="flex items-center gap-2 shrink-0">
                      <Tag tone="sale">On offer · {pricing.discount}% off</Tag>
                      <span className="font-display text-sm text-terracotta">{pricing.display}</span>
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => handleClear(wine.id)}>End offer</Button>
                  </>
                ) : (
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-ui text-sm text-ink/40">$</span>
                      <input
                        type="number"
                        min="1"
                        value={draft}
                        onChange={e => setDraft(wine.id, e.target.value)}
                        placeholder="Sale price"
                        className="w-32 font-ui text-sm text-ink bg-paper border border-hairline rounded-sm pl-6 pr-2 py-2 placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors"
                      />
                    </span>
                    <span className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-ink/40 w-16 text-right">
                      {previewDiscount !== null ? `${previewDiscount}% off` : draft ? '—' : ''}
                    </span>
                    <Button size="sm" disabled={!draftValid} onClick={() => handleSet(wine.id)}>Set offer</Button>
                  </span>
                )}
              </div>
            );
          })}
        </Card>
      )}

      <p className="font-body text-xs text-ink/40">
        An offer must sit below the list price. End it at any time and the list price returns at once.
      </p>
    </div>
  );
};

export default OfferManager;
