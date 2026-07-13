import { Winery } from '../../../types';

// ---------------------------------------------------------------------------
// Eden Valley — the high, cool country east of the floor.
// Real producers, researched facts, imagery from the estates' own sites,
// downloaded and visually verified. Contact details included only where
// confirmed; omitted otherwise. Vivino scores harvested, never invented.
// ---------------------------------------------------------------------------

export const EDEN_WINERIES: Winery[] = [
  {
    id: 'ba-henschke',
    name: 'Henschke',
    subregion: 'Eden Valley',
    specialty: 'Hill of Grace — six generations of family winemaking in the Eden Valley high country',
    wines: ['Hill of Grace', 'Mount Edelstone', 'Julius Riesling'],
    established: 1868,
    priceRange: '$$$$',
    description: 'The Henschke family\'s Keyneton cellars pour Australia\'s most revered single-vineyard Shiraz, from vines planted in the 1860s beside a stone Lutheran church.',
    story: 'Johann Christian Henschke, a Silesian stonemason, made his first wine at Keyneton in 1868; six generations later Stephen and Prue Henschke steward the estate, and their Hill of Grace — from the Grandfathers block planted in the 1860s opposite the Gnadenberg church — trades places with Grange in arguments about Australia\'s greatest wine. The cellar door occupies the property\'s 1950s woolstore, and the high, cool Eden Valley hills around it grow Rieslings as crystalline as the Shiraz is profound. Closed Sundays; the drive out through Keyneton is part of the pilgrimage.',
    style: 'Iconic',
    opens: '09:00',
    closes: '16:30',
    lat: -34.5209,
    lng: 139.1492,
    hasRestaurant: false,
    rating: 4.8,
    bookingRequired: true,
    kidFriendly: false,
    dogFriendly: false,
    phone: '+61 8 8564 8223',
    website: 'https://www.henschke.com.au',
    bookingUrl: 'https://www.henschke.com.au/pages/visit-us',
    tastingFee: 25,
    image: { url: 'https://www.henschke.com.au/cdn/shop/files/Cellar_Door_Exterior_AJE_7476_FINAL.jpg', source: 'winery' as const, alt: 'The Henschke cellar door at Keyneton, Eden Valley' },
    briefing: {
      icebreaker: 'Hill of Grace is a translation of Gnadenberg, the Lutheran church across the road from the vines — the Grandfathers block dates to the 1860s.',
      proMove: 'Closed Sundays, and the Hill of Grace Experience books out well ahead — reserve before you plan the rest of your Eden Valley day.',
      hiddenGem: 'The tasting room is the farm\'s original 1950s woolstore, and the drive from Angaston over the ranges is the prettiest twenty minutes in the region.',
    },
    sommNote: 'If Hill of Grace is beyond the day\'s budget, Mount Edelstone from 1912 vines is a legitimate icon in its own right — and the Julius Riesling shows why Eden Valley whites belong in the same sentence.',
    community: { score: 4.8, count: 237, source: 'Google' as const },
  },
];
