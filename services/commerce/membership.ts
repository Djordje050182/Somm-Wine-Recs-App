import { MembershipTier } from './types';

// Winery membership tiers — the app's revenue model. Structured to mirror
// Stripe subscription products so the demo billing swaps cleanly for real.

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'listed',
    name: 'Listed',
    pricePerMonth: 49,
    blurb: 'A place at the table. Your estate in the directory, on the map, and in the Somm’s repertoire.',
    features: [
      'Directory and map listing',
      'Up to 6 wines in the library',
      'Booking and contact links',
      'Listing editor',
    ],
    wineLimit: 6,
    canCreateOffers: false,
    homePlacement: false,
  },
  {
    id: 'featured',
    name: 'Featured',
    pricePerMonth: 149,
    blurb: 'The full cellar. Your complete range, special offers, and a seat in the editorial rotation.',
    features: [
      'Everything in Listed',
      'Unlimited wines in the library',
      'Special offers and sale pricing',
      'Home page editorial rotation',
      'Visitor analytics',
    ],
    wineLimit: null,
    canCreateOffers: true,
    homePlacement: true,
  },
  {
    id: 'premier',
    name: 'Premier',
    pricePerMonth: 349,
    blurb: 'First among equals. Priority in the concierge’s itineraries and top billing when it matters.',
    features: [
      'Everything in Featured',
      'Priority placement in trip plans',
      'Event and what’s-on promotion',
      'Dedicated account support',
    ],
    wineLimit: null,
    canCreateOffers: true,
    homePlacement: true,
  },
];

export const getTier = (id: string) => MEMBERSHIP_TIERS.find(t => t.id === id) ?? null;
