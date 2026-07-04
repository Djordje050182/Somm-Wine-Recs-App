import { Region } from '../../../types';

// The Hunter Valley — the founding Somm region.
// To add a new region, copy this directory, replace every value below,
// author the wineries/wines/experiences files, and register it in data/regions/index.ts.

export const HUNTER_VALLEY: Region = {
  id: 'hunter-valley',
  name: 'Hunter Valley',
  shortName: 'the Hunter',
  country: 'Australia',
  state: 'New South Wales',
  status: 'live',
  strapline: 'Australia’s oldest wine country — Semillon that outlives us all, Shiraz with red dirt in its veins.',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?auto=format&fit=crop&q=80&w=2000',
    source: 'unsplash',
    alt: 'Evening light across the vine rows of the Hunter Valley',
  },
  centre: { lat: -32.783, lng: 151.316 },
  defaultStart: { name: 'Pokolbin Central', lat: -32.785, lng: 151.315 },
  mapZoom: 12,
  timezone: 'Australia/Sydney',
  currency: 'AUD',
  currencySymbol: '$',
  subregions: [
    {
      id: 'pokolbin',
      name: 'Pokolbin',
      blurb: 'The heart of the valley — the storied cellar doors, the great restaurants, and vines older than Federation.',
      features: ['Historic vines', 'Fine dining', 'Resorts'],
    },
    {
      id: 'broke-fordwich',
      name: 'Broke Fordwich',
      blurb: 'The quiet achiever, resting against the Brokenback Range. Organic, unhurried, and quite happy about it.',
      features: ['Biodynamic', 'Scenic views', 'Tranquillity'],
    },
    {
      id: 'mount-view',
      name: 'Mount View',
      blurb: 'Higher ground, cooler air. Steep amphitheatre vineyards and lookouts that stop conversation.',
      features: ['Panoramas', 'Cooler sites', 'Boutique'],
    },
    {
      id: 'lovedale',
      name: 'Lovedale',
      blurb: 'Tree-lined lanes and long lunches. The valley at its most relaxed and generous.',
      features: ['Long lunches', 'Family friendly', 'Open country'],
    },
    {
      id: 'upper-hunter',
      name: 'Upper Hunter',
      blurb: 'The frontier an hour north — broad river flats, big skies, and estates that reward the drive.',
      features: ['River flats', 'Fewer crowds', 'Estate scale'],
    },
    {
      id: 'belford',
      name: 'Belford',
      blurb: 'Rolling grazing country off the old highway, where a handful of growers quietly farm some of the valley\'s oldest unirrigated vines.',
      features: ['Old vines', 'By appointment', 'Back roads'],
    },
  ],
  varietyMix: [
    { name: 'Semillon', value: 45 },
    { name: 'Shiraz', value: 30 },
    { name: 'Chardonnay', value: 20 },
    { name: 'Verdelho & others', value: 5 },
  ],
  vintages: [
    { year: '2011', rating: 96, quality: 'Exceptional', note: 'A legendary Semillon year — bottles are drinking gloriously now if you can find them.' },
    { year: '2013', rating: 90, quality: 'Very good' },
    { year: '2014', rating: 99, quality: 'The one', note: 'The greatest red vintage in a generation. Any 2014 Hunter Shiraz is worth carrying home.' },
    { year: '2015', rating: 88, quality: 'Good' },
    { year: '2016', rating: 87, quality: 'Good' },
    { year: '2017', rating: 95, quality: 'Excellent', note: 'Superb across both colours — a safe bet on any list.' },
    { year: '2018', rating: 93, quality: 'Great', note: 'Powerful, cellar-worthy Shiraz.' },
    { year: '2019', rating: 90, quality: 'Very good', note: 'Drought year: tiny crop, concentrated reds.' },
    { year: '2020', rating: 70, quality: 'Difficult', note: 'Drought and smoke — very little was made. Approach with curiosity, not expectation.' },
    { year: '2021', rating: 94, quality: 'Excellent', note: 'A white-wine year for the ages — the Semillons will outlive us all.' },
    { year: '2022', rating: 84, quality: 'Tricky', note: 'A wet vintage; the careful pickers still made lovely whites.' },
    { year: '2023', rating: 92, quality: 'Very good', note: 'Cool and elegant — fine-boned Semillon.' },
    { year: '2024', rating: 91, quality: 'Very good' },
  ],
  seasons: [
    { name: 'Summer', range: 'Dec – Feb', description: 'Harvest. The valley hums with pickers at dawn and the air smells faintly of fermenting fruit.', avgTemp: '28°C' },
    { name: 'Autumn', range: 'Mar – May', description: 'Golden vines, misty mornings and jazz drifting over the rows. The connoisseur’s season for touring.', avgTemp: '22°C' },
    { name: 'Winter', range: 'Jun – Aug', description: 'Cane fires, fireside Shiraz and crisp blue-sky days. The valley exhales.', avgTemp: '16°C' },
    { name: 'Spring', range: 'Sep – Nov', description: 'Budburst turns the rows electric green. Verandas reopen, and so do the picnic rugs.', avgTemp: '24°C' },
  ],
  terroir: {
    soils: 'Red volcanic clay on the hills gives Shiraz its earthy spine; sandy alluvial loam on the ancient creek flats gives Semillon its citrus purity.',
    climate: 'Warm and subtropical, tempered each afternoon by the "Pokolbin Doctor" sea breeze that slips up the valley and cools the fruit.',
    story: 'Hunter soils are ancient and stingy. The vines struggle in nutrient-poor earth — and that struggle is exactly why the wines are so intense. Many of the oldest blocks are dry-grown, their roots driven metres into the clay in search of water.',
  },
  ai: {
    sommelierPersona:
      'You have walked every row in the Hunter for twenty years and speak with warmth, wit and authority — the trusted friend who happens to hold the keys to every cellar door in the valley.',
    signatureProducers: ["Tyrrell's", 'Brokenwood', 'Mount Pleasant', "Lake's Folly", 'Thomas Wines', 'Audrey Wilkinson', 'Margan', 'Meerea Park'],
    promptContext:
      'The Hunter Valley is Australia’s oldest wine region (first vines 1828). Its icons: age-worthy Semillon picked early at low alcohol that transforms with a decade in bottle, and medium-bodied savoury Shiraz once called "Hunter River Burgundy". Chardonnay history runs deep here too (Tyrrell’s Vat 47 was Australia’s first commercial Chardonnay, 1971). Verdelho is a local speciality. Key subregions: Pokolbin, Broke Fordwich, Mount View, Lovedale, Upper Hunter.',
  },
  weather: {
    mock: {
      temp: 24,
      condition: 'Sunny',
      humidity: 45,
      uvIndex: 6,
      windSpeed: 12,
      forecast: 'Clear skies holding into the evening — the verandas will earn their keep at sunset.',
      recommendation: 'A day for tasting outdoors. Start with a young Semillon while the morning is still cool, and save the Shiraz for the shade of mid-afternoon.',
    },
  },
};
