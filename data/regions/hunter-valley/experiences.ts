// TEMPORARY SHIM — converts legacy experience data to the new format.
// Will be replaced wholesale by the expanded, hand-written catalogue.

import { Experience, ImageAsset } from '../../../types';
import { EXPERIENCES as LEGACY } from '../../legacy-experiences';

const asAsset = (url: string, alt: string): ImageAsset => ({ url, source: 'unsplash', alt });

export const HUNTER_EXPERIENCES: Experience[] = LEGACY.map((e: any): Experience => ({
  id: `hv-${String(e.id).replace(/^e/, 'exp-')}`,
  name: e.name,
  category: e.category,
  subregion: e.subregion,
  description: e.description,
  image: asAsset(e.image, e.name),
  gallery: e.gallery?.map((g: string, i: number) => asAsset(g, `${e.name} gallery ${i + 1}`)),
  rating: e.rating,
  priceRange: e.priceRange,
  website: e.website ?? undefined,
  bookingUrl: e.bookingUrl ?? undefined,
  phone: e.phone ?? undefined,
  opens: e.opens,
  closes: e.closes,
  sommNote: e.aiTake,
  lat: e.lat,
  lng: e.lng,
}));
