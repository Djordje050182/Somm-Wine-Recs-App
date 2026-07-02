// The partner overlay store — everything a winery edits in the portal lives
// here (localStorage for the demo) and is merged over the static region data
// by catalogService, so portal changes appear live on the consumer side.
// When a real backend lands, this module's read/write functions point at it.

import { Winery, WineDetail } from '../../types';
import { ProductOffer, Subscription } from './types';

const LISTINGS_KEY = 'sommPartnerListings';   // Record<wineryId, Partial<Winery>>
const WINES_KEY = 'sommPartnerWines';         // Record<wineryId, WineDetail[]>
const OFFERS_KEY = 'sommPartnerOffers';       // Record<wineId, ProductOffer>
const SUBS_KEY = 'sommSubscriptions';         // Subscription[]

type Listener = () => void;
const listeners = new Set<Listener>();
export const onPartnerDataChange = (cb: Listener): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach(cb => cb());

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
  notify();
};

// --- Listing edits ---
export const getListingOverride = (wineryId: string): Partial<Winery> | null =>
  read<Record<string, Partial<Winery>>>(LISTINGS_KEY, {})[wineryId] ?? null;

export const saveListingOverride = (wineryId: string, patch: Partial<Winery>) => {
  const all = read<Record<string, Partial<Winery>>>(LISTINGS_KEY, {});
  all[wineryId] = { ...all[wineryId], ...patch };
  write(LISTINGS_KEY, all);
};

export const getAllListingOverrides = (): Record<string, Partial<Winery>> =>
  read<Record<string, Partial<Winery>>>(LISTINGS_KEY, {});

// --- Partner-added wines ---
export const getPartnerWines = (wineryId?: string): WineDetail[] => {
  const all = read<Record<string, WineDetail[]>>(WINES_KEY, {});
  if (wineryId) return all[wineryId] ?? [];
  return Object.values(all).flat();
};

export const savePartnerWine = (wine: WineDetail) => {
  const all = read<Record<string, WineDetail[]>>(WINES_KEY, {});
  const list = all[wine.wineryId] ?? [];
  const idx = list.findIndex(w => w.id === wine.id);
  if (idx >= 0) list[idx] = wine;
  else list.push(wine);
  all[wine.wineryId] = list;
  write(WINES_KEY, all);
};

export const deletePartnerWine = (wineryId: string, wineId: string) => {
  const all = read<Record<string, WineDetail[]>>(WINES_KEY, {});
  all[wineryId] = (all[wineryId] ?? []).filter(w => w.id !== wineId);
  write(WINES_KEY, all);
};

// --- Offers ---
export const getOffer = (wineId: string): ProductOffer | null =>
  read<Record<string, ProductOffer>>(OFFERS_KEY, {})[wineId] ?? null;

export const getAllOffers = (): Record<string, ProductOffer> =>
  read<Record<string, ProductOffer>>(OFFERS_KEY, {});

export const setOffer = (wineId: string, offer: ProductOffer) => {
  const all = read<Record<string, ProductOffer>>(OFFERS_KEY, {});
  all[wineId] = offer;
  write(OFFERS_KEY, all);
};

export const clearOffer = (wineId: string) => {
  const all = read<Record<string, ProductOffer>>(OFFERS_KEY, {});
  delete all[wineId];
  write(OFFERS_KEY, all);
};

// --- Subscriptions ---
export const getSubscriptions = (): Subscription[] => read<Subscription[]>(SUBS_KEY, []);

export const getActiveSubscription = (wineryId: string): Subscription | null =>
  getSubscriptions().find(s => s.wineryId === wineryId && s.status === 'active') ?? null;

export const saveSubscription = (sub: Subscription) => {
  const subs = getSubscriptions().filter(s => !(s.wineryId === sub.wineryId && s.status === 'active'));
  subs.push(sub);
  write(SUBS_KEY, subs);
};

export const cancelSubscriptionById = (id: string) => {
  const subs = getSubscriptions().map(s => (s.id === id ? { ...s, status: 'cancelled' as const } : s));
  write(SUBS_KEY, subs);
};
