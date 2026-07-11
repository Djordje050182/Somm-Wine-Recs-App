import { Region } from '../../../types';

// Margaret River — the second Somm region.
// Vintage guide synthesised from Margaret River Wine Association vintage
// reports, Wine Folly and Decanter; variety mix from MRWA regional statistics.

export const MARGARET_RIVER: Region = {
  id: 'margaret-river',
  name: 'Margaret River',
  shortName: 'Margaret River',
  country: 'Australia',
  state: 'Western Australia',
  status: 'live',
  strapline: 'Cabernet and Chardonnay between the surf breaks and the karri forests.',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1659518530794-72f034a7d5d3?auto=format&fit=crop&q=80&w=2000&h=1200',
    source: 'unsplash',
    alt: 'Sunrays breaking over Sugarloaf Rock at Cape Naturaliste, waves crashing on the red granite',
  },
  centre: { lat: -33.9, lng: 115.07 },
  defaultStart: { name: 'Margaret River Town Centre', lat: -33.9536, lng: 115.0745 },
  mapZoom: 10,
  timezone: 'Australia/Perth',
  currency: 'AUD',
  currencySymbol: '$',
  subregions: [
    {
      id: 'yallingup',
      name: 'Yallingup',
      blurb: 'The northern gateway, sheltered by Cape Naturaliste, where limestone caves and celebrated surf breaks share the hills with polished boutique estates.',
      features: ['Surf and caves', 'Boutique cellar doors', 'Warmer slopes'],
    },
    {
      id: 'wilyabrup',
      name: 'Wilyabrup',
      blurb: 'The historic heartland where it all began — ironstone gravel over granite along the Wilyabrup Brook, and Australia\'s most hallowed Cabernet dirt.',
      features: ['Ironstone gravel', 'Founding estates', 'Benchmark Cabernet'],
    },
    {
      id: 'carbunup',
      name: 'Carbunup',
      blurb: 'The warmer inland valley running towards Geographe Bay — the engine room of the region\'s everyday signature, vibrant Sauvignon Blanc Semillon blends.',
      features: ['Warmer valley', 'SSB country', 'Family estates'],
    },
    {
      id: 'wallcliffe',
      name: 'Wallcliffe',
      blurb: 'Around the river mouth and the town itself, cooler and ocean-exposed — Chardonnay\'s spiritual home, anchored by the region\'s grandest estates.',
      features: ['Icon Chardonnay', 'Grand estates', 'River-mouth cool'],
    },
    {
      id: 'karridale',
      name: 'Karridale',
      blurb: 'The deep south, where karri forest runs down towards Augusta and the vines feel both oceans at once. The coolest, latest-ripening corner of the region.',
      features: ['Coolest sites', 'Karri forest', 'Two oceans'],
    },
  ],
  varietyMix: [
    { name: 'Cabernet Sauvignon', value: 20 },
    { name: 'Sauvignon Blanc', value: 20 },
    { name: 'Chardonnay', value: 17 },
    { name: 'Semillon', value: 16 },
    { name: 'Shiraz & others', value: 27 },
  ],
  vintages: [
    { year: '2011', rating: 96, quality: 'Outstanding', note: 'While the eastern states drowned, Margaret River shone — concentrated Cabernet and standout Chardonnay. The best reds are still singing.' },
    { year: '2012', rating: 94, quality: 'Excellent', note: 'Warm, settled and early, with abundant marri blossom keeping the birds off. Deep-coloured, fine-tanninned Cabernet.' },
    { year: '2013', rating: 92, quality: 'Very good', note: 'A long Indian summer — built-to-age Cabernet with balanced Chardonnay.' },
    { year: '2014', rating: 93, quality: 'Excellent', note: 'Storms at flowering cut the crop and concentrated what remained: taut Chardonnay, textured Cabernet.' },
    { year: '2015', rating: 90, quality: 'Very good', note: 'The whites are the buy — intense Sauvignon Blanc and Semillon, long soft Chardonnay.' },
    { year: '2016', rating: 92, quality: 'Excellent', note: 'Good winter rains and an early, even vintage. Dense Cabernet and strong whites across the board.' },
    { year: '2017', rating: 93, quality: 'Excellent', note: 'A cool, slow season that banked natural acidity — optimal Chardonnay and perfumed reds that reward patience.' },
    { year: '2018', rating: 98, quality: 'Near-perfect', note: 'The benchmark. Widely called the best Cabernet vintage of the decade. Buy every serious red you can find.' },
    { year: '2019', rating: 91, quality: 'Very good', note: 'Late, long and cool — racy whites and finessed, elegant reds in the mould of 2017.' },
    { year: '2020', rating: 95, quality: 'Exceptional', note: 'The earliest harvest on record and one of the smallest crops: tiny yields, huge concentration. Some of the finest Chardonnay the region has made.' },
    { year: '2021', rating: 89, quality: 'Good', note: 'La Niña made it a vigneron\'s vintage. Standout Sauvignon Blanc; polished Cabernet from the top estates.' },
    { year: '2022', rating: 94, quality: 'Excellent', note: 'Long hang time, warm finish — remarkably consistent, pure, classic Cabernet and complete Chardonnay.' },
    { year: '2023', rating: 95, quality: 'Exceptional', note: 'A dry, mild dream run — hailed as possibly the region\'s greatest Chardonnay vintage yet, with inky, fine-tanninned Cabernet beside it.' },
    { year: '2024', rating: 93, quality: 'Excellent', note: 'Very early and compressed, yet the whites kept their freshness. Minimal disease; superb potential.' },
  ],
  seasons: [
    { name: 'Summer', range: 'Dec – Feb', description: 'Long, dry beach days as the grapes ripen and the afternoon sea breeze rolls in off the Indian Ocean. Cellar doors at their liveliest.', avgTemp: '26°C' },
    { name: 'Autumn', range: 'Mar – May', description: 'Vintage in full swing — harvesters at dawn, ferments perfuming the wineries, and the glassy swells that bring the Margaret River Pro in April.', avgTemp: '22°C' },
    { name: 'Winter', range: 'Jun – Aug', description: 'Green, moody and quiet in the best way. Whales arrive off Augusta, fireside Cabernet takes over the cellar doors, and Cabin Fever warms July.', avgTemp: '17°C' },
    { name: 'Spring', range: 'Sep – Nov', description: 'Wildflowers paint the capes, whale mothers and calves rest in Geographe Bay, and Pair\'d closes the season with the year\'s biggest wine weekend.', avgTemp: '21°C' },
  ],
  terroir: {
    soils: 'A low ridge of lateritic ironstone gravel — free-draining gravelly loam over ancient granite and gneiss — runs from Cape Naturaliste to Cape Leeuwin. Poor, thirsty soils that curb vigour and yield, which is precisely what fine Cabernet wants.',
    climate: 'Mediterranean with the ocean on three sides. Afternoon sea breezes — the local cousin of Perth\'s Fremantle Doctor — cool the vines through summer, giving one of the most reliably moderate ripening climates in Australia.',
    story: 'The granite beneath these vines is among the oldest rock on Earth, a remnant of Gondwana stranded between two oceans. Yet the region itself was founded on science: Dr John Gladstones\' 1965 papers pinpointed these capes as ideal for premium viticulture, and Perth cardiologist Tom Cullity took the bait, planting Vasse Felix beside the Wilyabrup Brook in 1967. The doctors, farmers and dreamers who followed built one of the world\'s great Cabernet and Chardonnay regions in under a generation.',
  },
  acknowledgement:
    'Somm acknowledges the Wadandi and Pibelmen people of the Noongar nation, Traditional Custodians of Wadandi Boodja — Saltwater Country — on which these vines grow, and pays respect to Elders past and present.',
  ai: {
    sommelierPersona:
      'You have walked the capes between Yallingup and Augusta for twenty years and speak with warmth, wit and authority — the trusted friend who happens to hold the keys to every cellar door between the two lighthouses.',
    signatureProducers: ['Vasse Felix', 'Cullen Wines', 'Moss Wood', 'Leeuwin Estate', 'Voyager Estate', 'Cape Mentelle', 'Deep Woods Estate', 'Xanadu Wines'],
    promptContext:
      'Margaret River is the rare wine region founded on science: Dr John Gladstones\' 1965-66 papers pinpointed this Indian Ocean cape as ideal for premium viticulture, and Vasse Felix planted the first vines at Wilyabrup in 1967. Its icons are structured, fragrant Cabernet Sauvignon from the ironstone gravels of Wilyabrup and restrained, age-worthy Chardonnay epitomised by Leeuwin Estate\'s Art Series, while zesty Sauvignon Blanc Semillon blends are the everyday regional signature. The climate is remarkably even — maritime on three sides with cooling afternoon sea breezes — so vintages are consistent and even lesser years are reliable. The region crushes only about 2% of Australia\'s grapes yet accounts for over 20% of its premium wine market. Key subregions: Yallingup, Wilyabrup, Carbunup, Wallcliffe, Karridale.',
  },
  weather: {
    mock: {
      temp: 19,
      condition: 'Sunny',
      humidity: 60,
      uvIndex: 5,
      windSpeed: 18,
      forecast: 'Bright and breezy off the Indian Ocean, with the sea breeze building through the afternoon.',
      recommendation: 'Start with Chardonnay in the morning calm, and save the Wilyabrup Cabernet for a sheltered corner once the breeze gets going.',
    },
  },
};
