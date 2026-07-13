import { Region } from '../../../types';

// Barossa Valley — the third Somm region.
// Vintage guide synthesised from Barossa Australia vintage reports, Wine
// Spectator and Jancis Robinson vintage charts; variety mix from Barossa
// Grape & Wine Association statistics. Custodian acknowledgement verified
// against The Barossa Council and barossa.com First Nations pages.

export const BAROSSA_VALLEY: Region = {
  id: 'barossa-valley',
  name: 'Barossa Valley',
  shortName: 'the Barossa',
  country: 'Australia',
  state: 'South Australia',
  status: 'live',
  strapline: 'Old-vine Shiraz and Lutheran bakeries — Australia\'s grandest red wine country.',
  heroImage: {
    url: 'https://images.unsplash.com/photo-1652397144274-1923a97f4f1a?auto=format&fit=crop&q=80&w=2000&h=1200',
    source: 'unsplash',
    alt: 'The date palm avenue along Seppeltsfield Road, planted in the Depression years',
  },
  centre: { lat: -34.53, lng: 138.95 },
  defaultStart: { name: 'Tanunda Town Centre', lat: -34.5236, lng: 138.9599 },
  mapZoom: 11,
  timezone: 'Australia/Adelaide',
  currency: 'AUD',
  currencySymbol: '$',
  subregions: [
    {
      id: 'tanunda',
      name: 'Tanunda',
      blurb: 'The Silesian heart of the valley — stone villages, four Lutheran spires, and the oldest Shiraz vines on Earth in the sandy Vine Vale flats.',
      features: ['1843 Freedom vines', 'Village cellar doors', 'Bakery country'],
    },
    {
      id: 'marananga-seppeltsfield',
      name: 'Marananga & Seppeltsfield',
      blurb: 'The western rise where the ironstone and red clay grow the valley\'s most opulent Shiraz, under the date palms of the grandest wine estate in the land.',
      features: ['The palm avenue', 'Opulent Shiraz', 'Western ridge soils'],
    },
    {
      id: 'nuriootpa',
      name: 'Nuriootpa & Greenock',
      blurb: 'The working north — big wineries, old family farms and Greenock\'s quiet backblocks. Nuriootpa\'s own name records this as a meeting place.',
      features: ['Working wineries', 'Greenock old vines', 'A meeting place'],
    },
    {
      id: 'angaston',
      name: 'Angaston',
      blurb: 'The English side of the valley, higher and a touch cooler, where Yalumba has poured since 1849 and the farmers\' market feeds the region every Saturday.',
      features: ['Yalumba since 1849', 'Saturday market', 'Foothill freshness'],
    },
    {
      id: 'southern-barossa',
      name: 'Lyndoch & Williamstown',
      blurb: 'The southern gateway under the Barossa Ranges — gentler, greener country of family vineyards, the Whispering Wall and the road up from Adelaide.',
      features: ['Southern gateway', 'Family vineyards', 'The Whispering Wall'],
    },
    {
      id: 'eden-valley',
      name: 'Eden Valley',
      blurb: 'The high country east of the valley floor — rocky, wind-scoured hills over 400 metres where Riesling turns crystalline and Hill of Grace grows.',
      features: ['High-country Riesling', 'Hill of Grace', 'Granite and gum trees'],
    },
  ],
  varietyMix: [
    { name: 'Shiraz', value: 51 },
    { name: 'Cabernet Sauvignon', value: 12 },
    { name: 'Riesling', value: 8 },
    { name: 'Grenache & Mataro', value: 9 },
    { name: 'Semillon & others', value: 20 },
  ],
  vintages: [
    { year: '2012', rating: 97, quality: 'Exceptional', note: 'A near-perfect ripening season the valley still talks about. If you find 2012 Shiraz at a cellar door, do not leave without it.' },
    { year: '2013', rating: 91, quality: 'Very good', note: 'Warm and early — concentrated, generous reds built in the classic mould.' },
    { year: '2014', rating: 89, quality: 'Good', note: 'A cool, drawn-out season; the patient made elegant, spicy Shiraz.' },
    { year: '2015', rating: 93, quality: 'Excellent', note: 'Even and unhurried — polished reds and taut Eden Valley Riesling.' },
    { year: '2016', rating: 94, quality: 'Excellent', note: 'Warm and generous; powerful Shiraz and Grenache with ripe, round tannins.' },
    { year: '2017', rating: 92, quality: 'Very good', note: 'Cool and late — fragrant, medium-weight reds that reward patience.' },
    { year: '2018', rating: 96, quality: 'Exceptional', note: 'Wonderful colour and flavour across every red variety. A benchmark year for structured, cellar-worthy Shiraz.' },
    { year: '2019', rating: 90, quality: 'Very good', note: 'Hot and tiny — some of the smallest yields in memory, and dense, inky wines from what survived.' },
    { year: '2020', rating: 91, quality: 'Very good', note: 'Drought-shrunk crops concentrated everything; small quantities, serious depth.' },
    { year: '2021', rating: 96, quality: 'Exceptional', note: 'A cool, slow dream run — superbly balanced Shiraz and some of the finest Eden Valley Riesling in years.' },
    { year: '2022', rating: 94, quality: 'Excellent', note: 'La Niña kept it cool and late: fresh, aromatic, fine-boned reds.' },
    { year: '2023', rating: 91, quality: 'Very good', note: 'A long, cool, low-yield season; lifted aromatics and moderate alcohols.' },
    { year: '2024', rating: 94, quality: 'Excellent', note: 'Variable yields but exceptional quality — Shiraz, Grenache and Mataro the standouts of the season.' },
  ],
  seasons: [
    { name: 'Summer', range: 'Dec – Feb', description: 'Hot, dry and golden. Verandas and cellar-door courtyards earn their keep, and A Day on the Green fills the vineyard amphitheatres.', avgTemp: '29°C' },
    { name: 'Autumn', range: 'Mar – May', description: 'Vintage — the whole valley smells of ferment, harvesters work under lights, and the vine rows turn copper and gold.', avgTemp: '22°C' },
    { name: 'Winter', range: 'Jun – Aug', description: 'Cold nights, wood smoke and slow-cooked everything. Fortified tastings by the fire are practically compulsory.', avgTemp: '13°C' },
    { name: 'Spring', range: 'Sep – Nov', description: 'Budburst races up the valley, the markets overflow, and the Barossa\'s food halls and bakeries hit their stride.', avgTemp: '21°C' },
  ],
  terroir: {
    soils: 'The valley floor runs from deep alluvial sands at Vine Vale to red-brown clay loams and ironstone on the western ridge at Marananga; Eden Valley sits above 400 metres on ancient rocky, acidic soils over granite. Phylloxera never reached South Australia, so vines here live extraordinarily long lives.',
    climate: 'Warm and continental — hot, dry summers moderated by cold nights, with Eden Valley several degrees cooler at altitude. Rain falls in winter, and dry-grown old vines dig deep to survive the summer.',
    story: 'Silesian Lutheran families fleeing religious persecution planted this valley from 1842, and their villages, spires and bakeries still set its rhythm. Because phylloxera never crossed the border, the Barossa keeps living vines older than anywhere on Earth: the Freedom Shiraz at Langmeil went into the ground in 1843, and sixth-generation growers still pick their ancestors\' plantings by hand. The result is a red wine culture without equal in the New World — and a valley where the baker matters nearly as much as the winemaker.',
  },
  acknowledgement:
    'Somm acknowledges the Ngadjuri, Peramangk and Kaurna peoples, Traditional Custodians of the Barossa — a meeting place of three nations, as Nuriootpa\'s own name records — and pays respect to Elders past and present.',
  ai: {
    sommelierPersona:
      'You have worked these villages for twenty years, from the Seppeltsfield barrel halls to the Eden Valley high country, and speak with warmth, wit and authority — the trusted friend who knows which baker fires first and which cellar door pours the old vines.',
    signatureProducers: ['Seppeltsfield', 'Yalumba', 'Henschke', 'Rockford', 'Torbreck', 'Langmeil', 'Turkey Flat', 'Charles Melton'],
    promptContext:
      'The Barossa is Australia\'s grandest red wine region, settled by Silesian Lutheran families from 1842 and never touched by phylloxera — so it keeps the oldest continuously producing Shiraz vines on Earth, including Langmeil\'s 1843 Freedom block and Turkey Flat\'s 1847 plantings. Its icons are old-vine Shiraz, Grenache and Mataro from the valley floor, world-benchmark fortifieds at Seppeltsfield (where a barrel from every year since 1878 still sleeps), and crystalline Riesling plus Henschke\'s Hill of Grace in the high, cool Eden Valley. Key subregions: Tanunda, Marananga & Seppeltsfield, Nuriootpa & Greenock, Angaston, Lyndoch & Williamstown, and Eden Valley.',
  },
  weather: {
    mock: {
      temp: 14,
      condition: 'Sunny',
      humidity: 55,
      uvIndex: 3,
      windSpeed: 12,
      forecast: 'Crisp and clear over the valley floor, with cold air pooling in the vine rows overnight.',
      recommendation: 'A fortified-by-the-fire sort of day. Start with Eden Valley Riesling while the sun is up, and finish in a barrel hall.',
    },
  },
};
