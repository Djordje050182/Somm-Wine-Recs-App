import { RegionEvent } from '../../../types';

// ---------------------------------------------------------------------------
// The diary — real, recurring Margaret River region events, verified July 2026
// against official sites. No AI, no invention: if it's here, it happens.
// Excluded after verification failed: Augusta River Festival (official site
// dead, last confirmed 2023), Leeuwin Concert Series (suspended per Leeuwin
// Estate's own site), Emergence Creative (no 2026 dates published).
// ---------------------------------------------------------------------------

export const MARGARET_RIVER_EVENTS: RegionEvent[] = [
  {
    title: 'Western Australia Margaret River Pro',
    category: 'Sport',
    month: 'April',
    location: 'Surfers Point, Prevelly',
    description:
      'A stop on the World Surf League Championship Tour, drawing the world\'s best surfers to the heavy water of Main Break and The Box. Spectating is free from the Surfers Point headland, with a festival village of food, music and local culture alongside the competition.',
    url: 'https://www.worldsurfleague.com/events/2026/ct',
  },
  {
    title: 'Busselton Jetty Swim',
    category: 'Sport',
    month: 'February',
    location: 'Busselton Foreshore, Geographe Bay',
    description:
      'An open-water classic swum around the 1.8km Busselton Jetty in the turquoise shallows of Geographe Bay. Held over two days with distances for all ages and abilities, it turns the foreshore into a carnival of swimmers and spectators.',
    detail: 'Next: 13–14 February 2027',
    url: 'https://busseltonjettyswim.org.au/',
  },
  {
    title: 'Margaret River Readers & Writers Festival',
    category: 'Arts',
    month: 'May',
    location: 'Margaret River town and venues region-wide',
    description:
      'The largest literary festival in regional Western Australia, bringing acclaimed authors, journalists and thinkers to intimate venues among the vines. Expect conversations, workshops and long lunches where books and wine share the table.',
    url: 'https://mrrwfestival.com/',
  },
  {
    title: 'Whale Watching Season',
    category: 'Family',
    month: 'June – November',
    location: 'Augusta (Flinders Bay) and Dunsborough (Geographe Bay)',
    description:
      'Each winter tens of thousands of humpback, southern right and blue whales migrate along the capes, with daily cruises from Augusta from June and from Dunsborough from September. Geographe Bay becomes a nursery for mothers and calves through spring.',
    detail: 'Runs annually: Augusta June–August, Dunsborough September–early December',
    url: 'https://www.margaretriver.com/things-to-do/attractions/whale-watching/',
  },
  {
    title: 'Cabin Fever Festival',
    category: 'Festival',
    month: 'July',
    location: 'Venues from Busselton to Margaret River',
    description:
      'The region\'s winter festival of fire, food and fine tunes, with more than 40 events across ten days — fireside feasts, immersive wine experiences, live music and late-night celebrations. The antidote to hibernation in a Margaret River winter.',
    detail: 'Next: 17–26 July 2026 (10th anniversary edition)',
    url: 'https://cabinfeverfest.com.au/',
  },
  {
    title: 'CinefestOZ Film Festival',
    category: 'Festival',
    month: 'August',
    location: 'Busselton, Bunbury, Dunsborough and Margaret River',
    description:
      'A nine-day celebration of Australian and French cinema, home to one of the country\'s richest film prizes. Premieres, red carpets and filmmaker Q&As spread across cinemas, wineries and small-town halls in the South West.',
    detail: 'Next: 29 August – 6 September 2026',
    url: 'https://cinefestoz.com/',
  },
  {
    title: 'Margaret River Region Open Studios',
    category: 'Arts',
    month: 'September',
    location: 'Artist studios from Busselton to Augusta',
    description:
      'Australia\'s largest open studios event, with more than 150 artists throwing open their doors across the capes for sixteen days. Free, self-guided and wonderfully nosy: painters, sculptors, glass-blowers and jewellers at work in sheds, forests and clifftop studios.',
    detail: 'Next: 12–27 September 2026',
    url: 'https://mrropenstudios.com.au/',
  },
  {
    title: "Pair'd Margaret River Region",
    category: 'Food & Wine',
    month: 'November',
    location: 'Beaches, forests, caves and vineyards region-wide',
    description:
      'The successor to Gourmet Escape: a wine-first festival of more than 40 events pairing the region\'s winemakers with Michelin-starred chefs and musicians. Sommelier-led tastings, beach clubs and long lunches beneath the karri trees.',
    detail: 'Next: 19–22 November 2026',
    url: 'https://pairdmargaretriver.com/',
  },
  {
    title: 'IRONMAN Western Australia',
    category: 'Sport',
    month: 'December',
    location: 'Busselton',
    description:
      'A full-distance triathlon built around one of the world\'s great swim courses — a lap of the Busselton Jetty — followed by a flat, fast ride and run along Geographe Bay. One of the biggest days on the South West sporting calendar.',
    detail: 'Next: 6 December 2026',
    url: 'https://www.margaretriver.com/event/ironman-western-australia/',
  },
  {
    title: "Margaret River Farmers' Market",
    category: 'Food & Wine',
    month: 'Year-round (Saturdays)',
    location: 'Margaret River Education Campus, Bussell Highway',
    description:
      'The region\'s weekly larder, running since 2002 with a strict local-only rule: stallholders must grow or make what they sell. Come early for artisan pastries, farm eggs, seafood and seasonal vegetables straight from the growers.',
    detail: 'Every Saturday, 7.30–11.30am, year-round',
    url: 'https://www.margaretriverfarmersmarket.com.au/',
  },
];
