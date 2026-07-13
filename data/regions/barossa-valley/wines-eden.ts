import { WineDetail } from '../../../types';

// ---------------------------------------------------------------------------
// Eden Valley — the high, cool country east of the floor.
// Wines wear their estate's verified photograph.
// ---------------------------------------------------------------------------

export const EDEN_WINES: WineDetail[] = [
  {
    id: 'ba-henschke-hog',
    name: 'Hill of Grace',
    wineryId: 'ba-henschke',
    variety: 'Shiraz',
    vintage: '2019',
    price: '$950',
    description: 'Australia\'s most revered single vineyard — 1860s vines opposite the Gnadenberg church, in a wine of impossible perfume and calm.',
    sommNote: 'Grange\'s only true rival, and the argument is settled vineyard versus blend. This is the vineyard\'s case.',
    image: { url: 'https://www.henschke.com.au/cdn/shop/files/Cellar_Door_Exterior_AJE_7476_FINAL.jpg', source: 'winery' as const, alt: 'Hill of Grace — at Henschke' },
    rating: 4.7,
    pairings: ['aged beef fillet', 'jugged hare', 'quiet contemplation'],
    drinkFrom: '2029',
    drinkTo: '2050',
    community: { score: 4.6, count: 4564, source: 'Vivino' as const },
  },
  {
    id: 'ba-henschke-edelstone',
    name: 'Mount Edelstone',
    wineryId: 'ba-henschke',
    variety: 'Shiraz',
    vintage: '2019',
    price: '$300',
    description: 'Single-vineyard Eden Valley Shiraz from 1912 plantings — sage, blackberry and granite-edged elegance.',
    sommNote: 'In most families this would be the icon. Here it\'s merely magnificent.',
    image: { url: 'https://www.henschke.com.au/cdn/shop/files/Cellar_Door_Exterior_AJE_7476_FINAL.jpg', source: 'winery' as const, alt: 'Mount Edelstone — at Henschke' },
    rating: 4.5,
    pairings: ['roast lamb', 'venison', 'field mushrooms'],
    drinkFrom: '2027',
    drinkTo: '2045',
    community: { score: 4.4, count: 5629, source: 'Vivino' as const },
  },
  {
    id: 'ba-henschke-julius',
    name: 'Julius Riesling',
    wineryId: 'ba-henschke',
    variety: 'Riesling',
    vintage: '2023',
    price: '$45',
    description: 'Eden Valley Riesling at altitude — lime blossom, crushed slate and a crystalline line that keeps for decades.',
    sommNote: 'The proof that Eden Valley means Riesling as surely as it means Shiraz.',
    image: { url: 'https://www.henschke.com.au/cdn/shop/files/Cellar_Door_Exterior_AJE_7476_FINAL.jpg', source: 'winery' as const, alt: 'Julius Riesling — at Henschke' },
    rating: 4.1,
    pairings: ['oysters', 'sashimi', 'Thai salads'],
    drinkFrom: '2024',
    drinkTo: '2035',
    community: { score: 3.8, count: 1854, source: 'Vivino' as const },
  },
];
