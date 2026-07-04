// ---------------------------------------------------------------------------
// Somm — core domain types
// IDs are string slugs, prefixed by region ('hv-tyrrells', 'hv-tyrrells-vat-1-semillon')
// so that future regions (Barossa, Champagne…) can never collide.
// ---------------------------------------------------------------------------

export interface ImageAsset {
  url: string;
  source: 'unsplash' | 'pexels' | 'winery' | 'generated';
  alt: string;
  credit?: string;
}

// --- Region -----------------------------------------------------------------

export interface Subregion {
  id: string;
  name: string;
  blurb: string;
  features: string[];
}

export interface VintageRating {
  year: string;
  rating: number; // 0-100
  quality: string;
  note?: string;  // why the year matters, and what to buy from it
}

export interface SeasonNote {
  name: string;
  range: string;
  description: string;
  avgTemp: string;
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm' | 'Windy';
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  forecast: string;
  recommendation: string;
}

export interface Region {
  id: string;              // 'hunter-valley' — used in routes and storage keys
  name: string;            // 'Hunter Valley'
  shortName: string;       // 'the Hunter'
  country: string;
  state: string;
  status: 'live' | 'coming-soon';
  strapline: string;       // editorial one-liner for the switcher and hero
  heroImage: ImageAsset;
  centre: { lat: number; lng: number };
  defaultStart: { name: string; lat: number; lng: number };
  mapZoom: number;
  timezone: string;
  currency: string;        // ISO code, e.g. 'AUD'
  currencySymbol: string;  // '$'
  subregions: Subregion[];
  varietyMix: { name: string; value: number }[];
  vintages: VintageRating[];
  seasons: SeasonNote[];
  terroir: { soils: string; climate: string; story: string };
  ai: {
    sommelierPersona: string;
    signatureProducers: string[];
    promptContext: string;
  };
  weather: { mock: WeatherData };
}

/** A stub entry for the region switcher — regions we have not built yet. */
export interface ComingSoonRegion {
  id: string;
  name: string;
  country: string;
  strapline: string;
  eta: string; // e.g. 'Coming 2027'
}

export interface RegionData {
  region: Region;
  wineries: Winery[];
  wines: WineDetail[];
  experiences: Experience[];
  events?: RegionEvent[];
}

// A real, recurring regional event — verified, never invented.
export interface RegionEvent {
  title: string;
  category: 'Festival' | 'Music' | 'Food & Wine' | 'Arts' | 'Family' | 'Sport';
  month: string;      // typical timing, e.g. 'May' or 'October–March'
  location: string;
  description: string;
  detail?: string;    // published next date, if known
  url?: string;
}

// --- Catalogue --------------------------------------------------------------

export interface Winery {
  id: string;              // 'hv-tyrrells'
  name: string;
  subregion: string;
  specialty: string;
  wines: string[];         // display names of signature wines
  established: number;
  priceRange: string;
  description: string;
  story?: string;          // longer editorial paragraph (listing page)
  style: string;
  opens: string;
  closes: string;
  lat: number;
  lng: number;
  hasRestaurant: boolean;
  rating: number;
  bookingRequired: boolean;
  kidFriendly: boolean;
  dogFriendly: boolean;
  phone?: string;
  website?: string;
  bookingUrl?: string;
  tastingFee: number;
  image: ImageAsset;
  gallery?: ImageAsset[];
  sommNote?: string;       // the Somm's one-line insider note
  briefing?: {             // what to say when you get there — per estate
    icebreaker: string;
    proMove: string;
    hiddenGem: string;
  };
}

export interface WineDetail {
  id: string;              // 'hv-tyrrells-vat-1-semillon'
  name: string;
  wineryId: string;
  variety: string;
  vintage: string;
  price: string;           // display price, e.g. '$95'
  description: string;
  sommNote: string;        // insider note (formerly aiTake)
  image: ImageAsset;
  rating: number;
  pairings: string[];
  drinkFrom?: string;      // e.g. '2026'
  drinkTo?: string;        // e.g. '2038'
  community?: {            // real crowd ratings, harvested not invented
    score: number;         // out of 5
    count: number;
    source: 'Vivino';
  };
}

export type ExperienceCategory = 'Dining' | 'Adventure' | 'Nature' | 'Golf' | 'Shopping' | 'Family';

export interface Experience {
  id: string;              // 'hv-balloon-aloft'
  name: string;
  category: ExperienceCategory;
  subregion: string;
  description: string;
  image: ImageAsset;
  gallery?: ImageAsset[];
  briefing?: {             // what to say when you get there
    icebreaker: string;
    proMove: string;
    hiddenGem: string;
  };
  community?: {            // real crowd ratings, harvested not invented
    score: number;
    count: number;
    source: 'Google';
  };
  rating: number;
  priceRange: string;
  website?: string;
  bookingUrl?: string;
  phone?: string;
  opens: string;
  closes: string;
  sommNote: string;
  lat: number;
  lng: number;
}

// --- Trip planning ----------------------------------------------------------

export interface ItineraryStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  image: ImageAsset;
  description: string;
  specialty?: string;
  category?: string;
  arrival: string;
  driveTime: number;
  stayDuration: number;
  isLunchStop: boolean;
  type: 'winery' | 'experience';
}

export interface Itinerary {
  wineries: ItineraryStop[];
  totalDriveTime: number;
  startLocation: string;
  estimatedEnd: string;
}

// --- Commerce ---------------------------------------------------------------

export interface CartItem {
  wineId: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: { wineId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'Confirmed' | 'Packing' | 'Shipped' | 'Delivered';
  address: string;
  wineryName?: string;
}

// --- Users ------------------------------------------------------------------

export type UserRole = 'consumer' | 'winery';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  wineryId?: string;       // winery role only
  tier?: string;
  createdAt: string;
}
