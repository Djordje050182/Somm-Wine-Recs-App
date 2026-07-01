// The single read path for the consumer-facing catalogue:
// (static region data) + (partner listing edits) + (partner-added wines) + (offers).
// Portal edits flow through partnerStore and appear live on the consumer side.

import { Winery, WineDetail } from '../../types';
import { getAllListingOverrides, getPartnerWines, getOffer } from './partnerStore';
import { WinePricing } from './types';

export const mergeWineries = (base: Winery[]): Winery[] => {
  const overrides = getAllListingOverrides();
  return base.map(w => (overrides[w.id] ? { ...w, ...overrides[w.id], id: w.id } : w));
};

export const mergeWines = (base: WineDetail[]): WineDetail[] => {
  const partnerWines = getPartnerWines();
  const baseIds = new Set(base.map(w => w.id));
  return [...base, ...partnerWines.filter(w => !baseIds.has(w.id))];
};

export const parsePrice = (display: string): number =>
  parseInt(display.replace(/[^0-9]/g, ''), 10) || 0;

export const getWinePricing = (wine: WineDetail | undefined): WinePricing => {
  if (!wine) return { price: 0, display: '$0', original: null, isSale: false, discount: 0 };
  const rawPrice = parsePrice(wine.price);
  const offer = getOffer(wine.id);

  if (offer?.isOnSale && offer.salePrice) {
    const discount = Math.round(((rawPrice - offer.salePrice) / rawPrice) * 100);
    return {
      price: offer.salePrice,
      display: `$${offer.salePrice}`,
      original: wine.price,
      isSale: true,
      discount,
    };
  }
  return { price: rawPrice, display: wine.price, original: null, isSale: false, discount: 0 };
};
