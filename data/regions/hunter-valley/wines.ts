// TEMPORARY SHIM — converts legacy wine data to the new format.
// Will be replaced wholesale by the expanded, hand-written catalogue.

import { WineDetail, ImageAsset } from '../../../types';
import { WINES as LEGACY } from '../../legacy-wineries';
import { LEGACY_WINERY_SLUGS } from './wineries';

const asAsset = (url: string, alt: string): ImageAsset => ({ url, source: 'unsplash', alt });

const slugifyWine = (wineryId: number, name: string): string => {
  const winerySlug = LEGACY_WINERY_SLUGS[wineryId] ?? 'hv-unknown';
  return `${winerySlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
};

export const HUNTER_WINES: WineDetail[] = LEGACY.map((w: any): WineDetail => ({
  id: slugifyWine(w.wineryId, w.name),
  name: w.name,
  wineryId: LEGACY_WINERY_SLUGS[w.wineryId] ?? 'hv-unknown',
  variety: w.variety,
  vintage: w.vintage,
  price: w.price,
  description: w.description,
  sommNote: w.aiTake,
  image: asAsset(w.image, `Bottle of ${w.name}`),
  rating: w.rating,
  pairings: w.pairings,
}));
