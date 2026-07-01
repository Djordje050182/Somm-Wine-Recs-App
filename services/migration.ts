// One-time localStorage migration. The rework moved every ID from numbers to
// region-prefixed slugs, so carts/favourites/orders written by the old app
// would point at nothing. On version mismatch we clear those keys once.

const DATA_VERSION = '2';
const VERSION_KEY = 'sommDataVersion';

const STALE_KEYS = [
  'sommCart',
  'sommOrders',
  'sommFavs',
  'favWineries',
  'favWines',
  'partnerOffers',
  'partnerAuth',
  'sommUsers', // old plaintext account store — deliberately destroyed
  'user',
  'myCellar',
  'wineLib_initialFilter',
];

export const runMigrations = () => {
  const current = localStorage.getItem(VERSION_KEY);
  if (current === DATA_VERSION) return;
  STALE_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.setItem(VERSION_KEY, DATA_VERSION);
};
