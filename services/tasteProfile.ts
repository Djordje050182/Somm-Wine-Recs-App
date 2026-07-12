// The guest's palate, learned honestly from what they actually do: wines they
// favourite, wines they mark as tasted, estates they favourite. No quiz, no
// guessing — the profile earns itself. Lives in localStorage today and syncs
// through the data layer when accounts land; every read goes through here so
// that swap is one module.

import { WineDetail, Winery } from '../types';

const TASTED_KEY = 'sommTastings';
const FAV_WINES_KEY = 'sommFavWines';
const FAV_WINERIES_KEY = 'sommFavWineries';

export interface Tasting {
  wineId: string;
  regionId: string;
  date: string;        // ISO date
  loved?: boolean;     // quick thumbs-up at the cellar door
  note?: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();
export const onTastingsChange = (cb: Listener): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const getTastings = (): Tasting[] => read<Tasting[]>(TASTED_KEY, []);

export const hasTasted = (wineId: string): boolean =>
  getTastings().some(t => t.wineId === wineId);

export const recordTasting = (tasting: Omit<Tasting, 'date'>) => {
  const all = getTastings().filter(t => t.wineId !== tasting.wineId);
  all.push({ ...tasting, date: new Date().toISOString().slice(0, 10) });
  localStorage.setItem(TASTED_KEY, JSON.stringify(all));
  listeners.forEach(cb => cb());
};

export const removeTasting = (wineId: string) => {
  localStorage.setItem(TASTED_KEY, JSON.stringify(getTastings().filter(t => t.wineId !== wineId)));
  listeners.forEach(cb => cb());
};

const favWineIds = (): string[] => read<string[]>(FAV_WINES_KEY, []);
const favWineryIds = (): string[] => read<string[]>(FAV_WINERIES_KEY, []);

export interface TasteProfile {
  varieties: { name: string; weight: number }[];   // descending affinity
  subregions: { name: string; weight: number }[];
  tastedCount: number;
  favouriteCount: number;
  lovedWineNames: string[];
  hasSignal: boolean;
}

// Affinity weights: a loved tasting speaks loudest, then a favourite, then a
// plain tasting. Estates favourited nudge their subregion.
export const computeProfile = (wines: WineDetail[], wineries: Winery[]): TasteProfile => {
  const tastings = getTastings();
  const favs = new Set(favWineIds());
  const favEstates = new Set(favWineryIds());
  const wineById = new Map(wines.map(w => [w.id, w]));
  const wineryById = new Map(wineries.map(w => [w.id, w]));

  const variety: Record<string, number> = {};
  const subregion: Record<string, number> = {};
  const lovedNames: string[] = [];

  const addWine = (wineId: string, weight: number, loved = false) => {
    const wine = wineById.get(wineId);
    if (!wine) return;
    variety[wine.variety] = (variety[wine.variety] ?? 0) + weight;
    const estate = wineryById.get(wine.wineryId);
    if (estate) subregion[estate.subregion] = (subregion[estate.subregion] ?? 0) + weight;
    if (loved) lovedNames.push(wine.name);
  };

  for (const t of tastings) addWine(t.wineId, t.loved ? 3 : 1, t.loved);
  for (const id of favs) addWine(id, 2);
  for (const id of favEstates) {
    const estate = wineryById.get(id);
    if (estate) subregion[estate.subregion] = (subregion[estate.subregion] ?? 0) + 1;
  }

  const rank = (m: Record<string, number>) =>
    Object.entries(m).map(([name, weight]) => ({ name, weight })).sort((a, b) => b.weight - a.weight);

  return {
    varieties: rank(variety),
    subregions: rank(subregion),
    tastedCount: tastings.length,
    favouriteCount: favs.size,
    lovedWineNames: lovedNames.slice(-4),
    hasSignal: tastings.length + favs.size + favEstates.size >= 2,
  };
};

// One sentence for the Somm's ear — goes into the voice agent's dynamic
// variables so he greets the guest as a regular, not a stranger.
export const profileForAgent = (wines: WineDetail[], wineries: Winery[]): string => {
  const p = computeProfile(wines, wineries);
  if (!p.hasSignal) return 'A first-time guest — no tasting history with us yet.';
  const parts: string[] = [];
  if (p.varieties.length) parts.push(`leans ${p.varieties.slice(0, 2).map(v => v.name).join(' and ')}`);
  if (p.subregions.length) parts.push(`gravitates to ${p.subregions[0].name}`);
  if (p.lovedWineNames.length) parts.push(`recently loved ${p.lovedWineNames.slice(-2).join(' and ')}`);
  parts.push(`${p.tastedCount} wines in their tasting book`);
  return `A returning guest: ${parts.join('; ')}.`;
};

// Wines the profile suggests, for the home page rail: top-rated wines in the
// guest's favourite varieties that they have NOT yet tasted or favourited.
export const winesForPalate = (wines: WineDetail[], wineries: Winery[], limit = 6): WineDetail[] => {
  const p = computeProfile(wines, wineries);
  if (!p.hasSignal || !p.varieties.length) return [];
  const topVarieties = new Set(p.varieties.slice(0, 3).map(v => v.name));
  const seen = new Set([...getTastings().map(t => t.wineId), ...favWineIds()]);
  return wines
    .filter(w => topVarieties.has(w.variety) && !seen.has(w.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};
