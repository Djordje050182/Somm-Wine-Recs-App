import { ComingSoonRegion } from '../../types';

// Regions on the roadmap. Listed in the region switcher as a promise of what's next.
// When a region is built, remove it from here and register its RegionData in ./index.ts.

export const COMING_SOON_REGIONS: ComingSoonRegion[] = [
  {
    id: 'barossa-valley',
    name: 'Barossa Valley',
    country: 'Australia',
    strapline: 'Old-vine Shiraz and Lutheran bakeries — Australia’s grandest red wine country.',
    eta: 'Next on the list',
  },
  {
    id: 'margaret-river',
    name: 'Margaret River',
    country: 'Australia',
    strapline: 'Cabernet and Chardonnay between the surf breaks and the karri forests.',
    eta: 'In the cellar',
  },
  {
    id: 'champagne',
    name: 'Champagne',
    country: 'France',
    strapline: 'Chalk cellars, grower fizz, and the world’s most celebrated bubbles.',
    eta: 'In the cellar',
  },
  {
    id: 'tuscany',
    name: 'Tuscany',
    country: 'Italy',
    strapline: 'Sangiovese, cypress-lined drives and lunches that outlast the afternoon.',
    eta: 'In the cellar',
  },
];
