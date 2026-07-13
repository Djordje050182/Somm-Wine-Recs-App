import { RegionEvent } from '../../../types';

// ---------------------------------------------------------------------------
// The diary — real, recurring Barossa events, verified July 2026 against
// official sites. No AI, no invention: if it's here, it happens.
// ---------------------------------------------------------------------------

export const BAROSSA_EVENTS: RegionEvent[] = [
  {
    title: 'Barossa Vintage Festival',
    category: 'Food & Wine',
    month: 'April',
    location: 'Across the valley — Tanunda, Angaston, Nuriootpa and beyond',
    description:
      'Australia\'s longest-running wine festival, held every two years since 1947. For five days the whole valley opens up — cellar doors, town halls and backyards — for parades, long lunches, ancient-vine tastings and the community spirit the Silesian villages never lost.',
    detail: 'Next: 21–25 April 2027 (biennial, odd years)',
    url: 'https://barossavintagefestival.com.au/',
  },
  {
    title: 'Barossa Gourmet Weekend',
    category: 'Food & Wine',
    month: 'September',
    location: 'Wineries across the Barossa',
    description:
      'The valley\'s spring food-and-wine weekender: more than forty events across the wineries — chef pairings, brunches, masterclasses and exclusive dining — as the vines wake up and the kitchens show off.',
    detail: 'Next: 5–7 September 2026',
    url: 'https://www.barossa.com/events/',
  },
  {
    title: 'Barossa Farmers Market',
    category: 'Food & Wine',
    month: 'Every Saturday',
    location: 'The Vintners shed, 740 Stockwell Road, Angaston',
    description:
      'The weekly gathering of the valley\'s growers, bakers and smallgoods makers, 7:30 to 11:30 every Saturday morning. Breakfast on a mettwurst roll while you fill the picnic basket.',
    detail: 'Every Saturday, 7:30–11:30am',
    url: 'https://barossafarmersmarket.com/',
  },
];
