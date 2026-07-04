import { Itinerary, ItineraryStop, Winery, Experience } from '../types';
import { calculateDistance } from './geoUtils';

// Route threading and shareable-run encoding, used by the builder, the
// concierge and the voice Somm alike. One brain, three mouths.

export type RoutableItem = (Winery | Experience) & {
  type: 'winery' | 'experience';
  specialty: string;
};

export interface StartPoint {
  name: string;
  lat: number;
  lng: number;
}

export const asRoutable = (wineries: Winery[], experiences: Experience[]): RoutableItem[] => [
  ...wineries.map(w => ({ ...w, type: 'winery' as const })),
  ...experiences.map(e => ({ ...e, type: 'experience' as const, specialty: e.category })),
];

// Fuzzy name matching, shared by every surface that turns spoken or written
// names ("Tyrrells", "the Brokenwood winery") into catalogue items.
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function matchByName<T extends { name: string }>(items: T[], name: string): T | undefined {
  const wanted = normalise(name);
  if (!wanted) return undefined;
  return (
    items.find(i => normalise(i.name) === wanted) ??
    items.find(i => {
      const n = normalise(i.name);
      return n.includes(wanted) || wanted.includes(n);
    })
  );
}

// Greedy nearest-neighbour threading — the shortest sensible loop, lunch
// where it belongs. Day starts at 10:00.
export function threadRoute(items: RoutableItem[], start: StartPoint): Itinerary | null {
  if (items.length === 0) return null;

  const remaining = [...items];
  const stops: ItineraryStop[] = [];
  let currentLat = start.lat;
  let currentLng = start.lng;
  let timeMinutes = 10 * 60;

  let safetyCounter = 0;
  while (remaining.length > 0) {
    safetyCounter++;
    if (safetyCounter > 20) break;

    let nearestIdx = 0;
    let minDistance = Infinity;
    remaining.forEach((item, i) => {
      const d = calculateDistance(currentLat, currentLng, item.lat, item.lng);
      if (d < minDistance) {
        minDistance = d;
        nearestIdx = i;
      }
    });

    const next = remaining[nearestIdx];
    if (!next) break;
    remaining.splice(nearestIdx, 1);

    const driveTime = Math.round((minDistance / 40) * 60) + 5;
    timeMinutes += driveTime;
    const arrival = `${Math.floor(timeMinutes / 60)}:${(timeMinutes % 60).toString().padStart(2, '0')}`;

    let stay = 60;
    if (next.type === 'experience') {
      if (next.specialty === 'Golf') stay = 240;
      else if (next.specialty === 'Dining') stay = 90;
      else if (next.specialty === 'Adventure') stay = 120;
      else stay = 45;
    } else {
      stay = stops.length === 2 && (next as Winery).hasRestaurant ? 90 : 60;
    }

    stops.push({
      id: next.id,
      name: next.name,
      lat: next.lat,
      lng: next.lng,
      image: next.image,
      description: next.description,
      specialty: next.specialty,
      type: next.type,
      arrival,
      driveTime,
      stayDuration: stay,
      isLunchStop:
        (stops.length === 2 && (next as Winery).hasRestaurant) || next.specialty === 'Dining',
    });

    timeMinutes += stay;
    currentLat = next.lat;
    currentLng = next.lng;
  }

  return {
    wineries: stops,
    totalDriveTime: stops.reduce((acc, s) => acc + s.driveTime, 0),
    startLocation: start.name,
    estimatedEnd: `${Math.floor(timeMinutes / 60)}:${(timeMinutes % 60).toString().padStart(2, '0')}`,
  };
}

// --- Shareable runs ---------------------------------------------------------
// The whole day fits in the URL: stop ids, arrival times and the start point,
// base64url-encoded. The receiving device resolves images and notes from its
// own bundled catalogue, so the link stays short and works offline too.

interface SharedRunPayload {
  v: 1;
  s: StartPoint;
  e: string; // estimated end
  w: { id: string; a: string; d: number; st: number; l?: 1 }[];
}

const toBase64Url = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromBase64Url = (s: string) =>
  decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeShareableRun(itinerary: Itinerary, start: StartPoint): string {
  const payload: SharedRunPayload = {
    v: 1,
    s: { name: start.name, lat: +start.lat.toFixed(5), lng: +start.lng.toFixed(5) },
    e: itinerary.estimatedEnd,
    w: itinerary.wineries.map(w => ({
      id: w.id,
      a: w.arrival,
      d: w.driveTime,
      st: w.stayDuration,
      ...(w.isLunchStop ? { l: 1 as const } : {}),
    })),
  };
  return toBase64Url(JSON.stringify(payload));
}

export interface DecodedRun {
  start: StartPoint;
  estimatedEnd: string;
  stops: { id: string; arrival: string; driveTime: number; stayDuration: number; isLunchStop: boolean }[];
}

export function decodeShareableRun(encoded: string): DecodedRun | null {
  try {
    const p: SharedRunPayload = JSON.parse(fromBase64Url(encoded));
    if (p.v !== 1 || !Array.isArray(p.w) || p.w.length === 0) return null;
    return {
      start: p.s,
      estimatedEnd: p.e,
      stops: p.w.map(w => ({
        id: w.id,
        arrival: w.a,
        driveTime: w.d,
        stayDuration: w.st,
        isLunchStop: !!w.l,
      })),
    };
  } catch {
    return null;
  }
}

export function shareUrlForRun(regionId: string, encoded: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/${regionId}/plan/shared?run=${encoded}`;
}

export function googleMapsUrl(start: StartPoint, stops: { lat: number; lng: number }[]): string {
  if (stops.length === 0) return '';
  const destination = stops[stops.length - 1];
  const waypoints = stops
    .slice(0, stops.length - 1)
    .map(w => `${w.lat},${w.lng}`)
    .join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${destination.lat},${destination.lng}&waypoints=${waypoints}&travelmode=driving`;
}

// Resolve the user's start point: their real location if they allow it and
// they're actually near the region, otherwise the region's sensible default.
export function resolveStartPoint(
  region: { defaultStart: StartPoint; centre: { lat: number; lng: number } },
  timeoutMs = 6000
): Promise<StartPoint> {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(region.defaultStart);
    const timer = setTimeout(() => resolve(region.defaultStart), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      position => {
        clearTimeout(timer);
        const { latitude, longitude } = position.coords;
        const distToRegion = calculateDistance(latitude, longitude, region.centre.lat, region.centre.lng);
        resolve(
          distToRegion > 200
            ? region.defaultStart
            : { name: 'Your location', lat: latitude, lng: longitude }
        );
      },
      () => {
        clearTimeout(timer);
        resolve(region.defaultStart);
      },
      { maximumAge: 300_000, timeout: timeoutMs }
    );
  });
}
