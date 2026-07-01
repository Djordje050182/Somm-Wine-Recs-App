// TEMPORARY SHIM — converts the legacy numeric-id data into the new slug/ImageAsset
// format so the app runs while the full 45-winery dataset is authored.
// This file will be replaced wholesale by the expanded, hand-written catalogue.

import { Winery, ImageAsset } from '../../../types';
import { WINERIES as LEGACY } from '../../legacy-wineries';

export const LEGACY_WINERY_SLUGS: Record<number, string> = {
  1: 'hv-tyrrells',
  2: 'hv-audrey-wilkinson',
  3: 'hv-brokenwood',
  4: 'hv-tempus-two',
  5: 'hv-keith-tulloch',
  6: 'hv-margan',
  7: 'hv-scarborough',
  8: 'hv-mount-pleasant',
  9: 'hv-thomas-wines',
  10: 'hv-gundog-estate',
  11: 'hv-tulloch',
  12: 'hv-peterson-house',
  13: 'hv-bimbadgen',
  14: 'hv-usher-tinkler',
  15: 'hv-de-iuliis',
  16: 'hv-ivanhoe',
  17: 'hv-pepper-tree',
  18: 'hv-krinklewood',
  19: 'hv-first-creek',
  20: 'hv-hope-estate',
  21: 'hv-thomas-allen',
};

const asAsset = (url: string, alt: string): ImageAsset => ({ url, source: 'unsplash', alt });

export const HUNTER_WINERIES: Winery[] = LEGACY.map((w: any): Winery => ({
  id: LEGACY_WINERY_SLUGS[w.id],
  name: w.name,
  subregion: w.subregion,
  specialty: w.specialty,
  wines: w.wines,
  established: w.established,
  priceRange: w.priceRange,
  description: w.description,
  style: w.style,
  opens: w.opens,
  closes: w.closes,
  lat: w.lat,
  lng: w.lng,
  hasRestaurant: w.hasRestaurant,
  rating: w.rating,
  bookingRequired: w.bookingRequired,
  kidFriendly: w.kidFriendly,
  dogFriendly: w.dogFriendly,
  phone: w.phone ?? undefined,
  website: w.website ?? undefined,
  bookingUrl: w.bookingUrl ?? undefined,
  tastingFee: w.tastingFee,
  image: asAsset(w.image, `${w.name} cellar door`),
  gallery: w.gallery?.map((g: string, i: number) => asAsset(g, `${w.name} gallery ${i + 1}`)),
  sommNote: w.aiTake,
}));
