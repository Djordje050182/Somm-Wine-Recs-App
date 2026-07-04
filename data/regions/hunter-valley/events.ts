import { RegionEvent } from '../../../types';

// ---------------------------------------------------------------------------
// The diary — real, recurring Hunter Valley events, verified July 2026
// against official sites. No AI, no invention: if it's here, it happens.
// Discontinued and noted: Jazz in the Vines (farewell edition held),
// Opera in the Vineyards (no current listings). Lovedale Long Lunch is on
// hold for 2026 with a return planned for 2027.
// ---------------------------------------------------------------------------

export const HUNTER_EVENTS: RegionEvent[] = [
  {
    title: 'Hunter Valley Wine & Beer Festival',
    category: 'Food & Wine',
    month: 'July',
    location: 'Rydges Resort Hunter Valley, Lovedale',
    description:
      'Around 35 local wine producers pour alongside Hunter brewers and distillers for a single-day celebration of the region\'s cellar doors. Live music, masterclasses and food stalls round out a relaxed winter day among the vines.',
    detail: 'Next: Saturday 11 July 2026',
    url: 'https://huntervalleywinefestival.com/',
  },
  {
    title: 'Hunter Valley Wine Show Celebrations Luncheon',
    category: 'Food & Wine',
    month: 'August',
    location: 'Oaks Cypress Lakes Resort, Pokolbin',
    description:
      'The public finale of the region\'s most prestigious wine competition, running since 1973, where trophy winners are announced over a long lunch. A rare chance to taste the wines the judges rated best in the Hunter.',
    detail: 'Next: Friday 14 August 2026',
    url: 'https://www.hunterwineshow.com.au/',
  },
  {
    title: 'Hunter Valley Highland Games',
    category: 'Sport',
    month: 'August',
    location: 'Saltire Estate, Lovedale',
    description:
      'A full day of Scottish heavy athletics, pipe bands, Highland dancing and Jacobite re-enactments at a Scottish-owned vineyard. Caber tossing pairs surprisingly well with local wine and a dram.',
    detail: 'Next: Saturday 22 August 2026',
    url: 'https://www.huntervalleyhighlandgames.com.au/',
  },
  {
    title: 'Broke Village Fair & Vintage Car Display',
    category: 'Festival',
    month: 'September',
    location: 'McNamara Park, Broke',
    description:
      'A proper country fair in the Broke Fordwich subregion, with classic cars, woodchopping, whipcracking, pig races and local wine and produce stalls. Entry is by gold coin donation, and it remains one of the valley\'s most local-feeling days out.',
    detail: 'Next: Sunday 13 September 2026',
    url: 'https://brokevillagefair.com.au/',
  },
  {
    title: 'Sculpture in the Vineyards',
    category: 'Arts',
    month: 'September',
    location: 'Wollombi Valley',
    description:
      'A biennial outdoor sculpture festival scattering more than 150 works across vineyards and village spaces in the historic Wollombi Valley. Visitors follow a self-guided trail between cellar doors, with workshops, food and music along the way.',
    detail: 'Next: 12–27 September 2026',
    url: 'https://sculptureinthevineyards.com.au/',
  },
  {
    title: 'Hunter Valley Balloon Fiesta',
    category: 'Family',
    month: 'October',
    location: 'Peterson House, Pokolbin',
    description:
      'Over the October long weekend, twenty to thirty hot air balloons rise together at dawn over the vineyards in the valley\'s most photogenic spectacle. Flights depart from Peterson House, with sparkling wine and breakfast to follow.',
    detail: 'Next: October long weekend 2026',
    url: 'https://balloonaloft.com/locations/hunter-valley/balloon-fiesta/',
  },
  {
    title: 'A Day on the Green at Bimbadgen',
    category: 'Music',
    month: 'October–March',
    location: 'Bimbadgen, Pokolbin',
    description:
      'Australia\'s best-known winery concert series fills Bimbadgen\'s natural amphitheatre with up to 8,000 people for several shows each season. Past headliners include John Farnham, Crowded House and international touring acts, with wine and food from the estate.',
    url: 'https://www.adayonthegreen.com.au/wineries/nsw/bimbadgen',
  },
  {
    title: 'Red Hot Summer Tour',
    category: 'Music',
    month: 'October–March',
    location: 'Roche Estate, Pokolbin',
    description:
      'The touring outdoor festival of classic Australian rock makes an annual stop at Roche Estate in the heart of Pokolbin. The 2026 bill features Australian Crawl and Men At Work with Birds of Tokyo, Eskimo Joe and others.',
    detail: 'Next: Saturday 31 October 2026',
    url: 'https://www.redhotsummertour.com.au/',
  },
  {
    title: 'Christmas Lights Spectacular',
    category: 'Family',
    month: 'November–January',
    location: 'Hunter Valley Gardens, Pokolbin',
    description:
      'More than four and a half million lights transform the gardens\' eight acres into the largest Christmas light display in the southern hemisphere. Rides, seasonal food and nightly festive displays run right through the summer holidays.',
    detail: 'Next: 30 October 2026 – 26 January 2027',
    url: 'https://www.huntervalleygardens.com.au/events/christmas-lights-spectacular-event/',
  },
  {
    title: 'Snow Time in the Garden',
    category: 'Family',
    month: 'June–July',
    location: 'Hunter Valley Gardens, Pokolbin',
    description:
      'The gardens\' winter festival brings an ice skating rink, snow play, amusement rides and hearty winter food to the middle of wine country. A reliable school-holiday fixture during the valley\'s quietest, coolest season.',
    detail: 'Current: 27 June – 26 July 2026',
    url: 'https://www.huntervalleygardens.com.au/events/snow-time-in-the-garden/',
  },
  {
    title: 'Hunter Valley Steamfest',
    category: 'Family',
    month: 'April',
    location: 'Maitland',
    description:
      'Australia\'s premier steam festival, held in Maitland at the eastern edge of the Hunter, with historic locomotives racing from Newcastle in the Great Train Race. Antique machinery, hundreds of classic cars and heritage rail rides fill the weekend.',
    url: 'https://www.steamfest.com.au/',
  },
  {
    title: 'Lovedale Long Lunch',
    category: 'Food & Wine',
    month: 'May',
    location: 'Lovedale',
    description:
      'The famous progressive lunch pairs Lovedale wineries with restaurants for a weekend of eating and drinking between cellar doors. On hold for 2026, with organisers planning a refreshed, more intimate format for its return.',
    detail: 'Paused in 2026; organisers plan a return in 2027',
    url: 'https://www.lovedalelonglunch.com.au/',
  },
];
