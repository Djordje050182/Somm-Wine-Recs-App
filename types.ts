
export interface UserProfile {
  name: string;
  email: string;
  tier?: string;
}

export interface Winery {
  id: number;
  name: string;
  subregion: string;
  specialty: string;
  wines: string[];
  established: number;
  priceRange: string;
  description: string;
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
  phone: string;
  website: string;
  bookingUrl: string | null;
  tastingFee: number;
  image: string;
  gallery?: string[]; // Array of image URLs
  aiTake?: string; // Short AI personalized summary
}

export interface WineDetail {
  id: string;
  name: string;
  wineryId: number;
  variety: string;
  vintage: string;
  price: string;
  description: string;
  aiTake: string;
  image: string;
  rating: number;
  pairings: string[];
}

export interface Experience {
  id: string;
  name: string;
  category: 'Dining' | 'Adventure' | 'Nature' | 'Golf' | 'Shopping' | 'Family';
  subregion: string;
  description: string;
  image: string;
  gallery?: string[]; // Array of image URLs
  rating: number;
  priceRange: string;
  website: string;
  bookingUrl?: string; // Added for direct booking links
  phone: string;
  opens: string;
  closes: string;
  aiTake: string;
  lat: number;
  lng: number;
}

export interface Itinerary {
  wineries: ItineraryStop[];
  totalDriveTime: number;
  startLocation: string;
  estimatedEnd: string;
}

export interface CartItem {
  wineId: string;
  quantity: number;
}

export interface ItineraryStop {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  image: string;
  description: string;
  specialty?: string; // Optional (Wineries only)
  category?: string; // Optional (Experiences only)
  arrival: string;
  driveTime: number;
  stayDuration: number;
  isLunchStop: boolean;
  type: 'winery' | 'experience';
}

export enum AppTab {
  DISCOVER = 'discover',
  PLANNER = 'planner',
  CONCIERGE = 'concierge',
  WINES = 'wines',
  EXPERIENCES = 'experiences',
  SCANNER = 'scanner',
  SOMMELIER = 'sommelier',
  REGIONS = 'regions',
  LIVE = 'live',
  FAVORITES = 'favorites',
  CELLAR = 'cellar',
  PARTNERS = 'partners',
  EVENTS = 'events',
  STUDIO = 'studio'
}
