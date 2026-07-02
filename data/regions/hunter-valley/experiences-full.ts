import { Experience } from '../../../types';

// ---------------------------------------------------------------------------
// Hunter Valley — the full experiences catalogue (30 entries).
// Real venues only. Every image URL verified live (HTTP 200) and visually
// checked against its subject. Contact details are omitted where they could
// not be confirmed, never invented.
// Categories: Dining (9), Adventure (6), Nature (4), Golf (3), Shopping (5), Family (3).
// ---------------------------------------------------------------------------

export const HUNTER_EXPERIENCES_FULL: Experience[] = [
  // --- Dining ---------------------------------------------------------------
  {
    id: 'hv-exp-muse-restaurant',
    name: 'Muse Restaurant',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'Two-hatted contemporary Australian dining at Hungerford Hill, built around seasonality and the best produce the valley can muster. Widely regarded as the region’s benchmark kitchen.',
    image: {
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A finely plated dish at a contemporary fine-dining restaurant',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'A candlelit restaurant table set with wine glasses',
      },
    ],
    rating: 4.9,
    priceRange: '$$$$',
    website: 'https://musedining.com.au',
    bookingUrl: 'https://musedining.com.au/bookings/',
    phone: '02 4998 6777',
    opens: '18:00',
    closes: '22:00',
    sommNote:
      'The gastronomic summit of the valley. The coconut dessert has outlasted every menu change for a reason, so order it.',
    lat: -32.7902,
    lng: 151.3103,
  },
  {
    id: 'hv-exp-exp-restaurant',
    name: 'EXP. Restaurant',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'An intimate tasting-menu restaurant where the counter seats look straight into the kitchen. Native Australian ingredients lead a menu that changes with the seasons.',
    image: {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'An elegant restaurant table laid for a tasting menu',
    },
    rating: 4.8,
    priceRange: '$$$',
    website: 'https://exprestaurant.com.au',
    bookingUrl: 'https://exprestaurant.com.au/reservations/',
    phone: '02 4998 7264',
    opens: '17:30',
    closes: '22:00',
    sommNote:
      'Dark, quiet and quietly theatrical. Take the counter seats and watch the kitchen work through wattleseed, saltbush and whatever the valley gave up that week.',
    lat: -32.7947,
    lng: 151.3062,
  },
  {
    id: 'hv-exp-bistro-molines',
    name: 'Bistro Molines',
    category: 'Dining',
    subregion: 'Mount View',
    description:
      'Robert Molines’ classic French bistro at Tallavera Grove, perched above the vines of Mount View. Provincial cooking, a serious cellar and one of the great terrace views in Australian wine country.',
    image: {
      url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A light-filled dining room being set for lunch service',
    },
    rating: 4.9,
    priceRange: '$$$$',
    website: 'https://bistromolines.com.au',
    bookingUrl: 'https://bistromolines.com.au/reservations',
    phone: '02 4990 9553',
    opens: '12:00',
    closes: '15:00',
    sommNote:
      'The most romantic lunch in the valley, full stop. Book the terrace, order the twice-baked soufflé and let the afternoon get away from you.',
    lat: -32.8443,
    lng: 151.2865,
  },
  {
    id: 'hv-exp-eremo-spicers-guesthouse',
    name: 'Eremo at Spicers Guesthouse',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'Modern Italian dining inside the elegantly rebuilt Spicers Guesthouse. House-made pasta, wood-fired mains and a wine list that roams from Pokolbin to Piedmont.',
    image: {
      url: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Plates of fresh pasta served with glasses of red wine',
    },
    rating: 4.7,
    priceRange: '$$$',
    website: 'https://spicersretreats.com/restaurants/eremo/',
    bookingUrl: 'https://spicersretreats.com/restaurants/eremo/',
    phone: '02 4022 1801',
    opens: '12:00',
    closes: '22:00',
    sommNote:
      'The gnocchi is the stuff of local legend. Pair it with an aged Hunter Semillon and you have the whole argument for Italian food in wine country.',
    lat: -32.7826,
    lng: 151.3196,
  },
  {
    id: 'hv-exp-yellow-billy-restaurant',
    name: 'Yellow Billy Restaurant',
    category: 'Dining',
    subregion: 'Broke Fordwich',
    description:
      'Contemporary Australian cooking over an open fire in the quiet of Broke Fordwich, named for a storied local bushranger. The kitchen leans hard on local growers and its own garden.',
    image: {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A moody, warmly lit restaurant dining room',
    },
    rating: 4.7,
    priceRange: '$$$',
    opens: '12:00',
    closes: '21:00',
    sommNote:
      'Worth the drive west on its own. Everything touches flame at some point, and the smoke suits Broke’s unhurried pace perfectly.',
    lat: -32.7462,
    lng: 151.1069,
  },
  {
    id: 'hv-exp-cafe-enzo',
    name: 'Café Enzo',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'A rustic courtyard café in the stone surrounds of Peppers Creek Village, serving generous breakfasts and Mediterranean-leaning lunches beside an open fire in winter.',
    image: {
      url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A rustic café table with coffee beside a sunlit window',
    },
    rating: 4.6,
    priceRange: '$$',
    website: 'https://enzohuntervalley.com.au',
    opens: '09:00',
    closes: '16:00',
    sommNote:
      'The civilised way to start a tasting day. Coffee in the courtyard, wisteria overhead, and no rush whatsoever.',
    lat: -32.7858,
    lng: 151.2973,
  },
  {
    id: 'hv-exp-goldfish-bar-kitchen',
    name: 'Goldfish Bar & Kitchen',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'Cocktails, casual dining and live music at Roche Estate. One of the few places in the valley still pouring well after the cellar doors have closed.',
    image: {
      url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A bartender’s cocktails lined up on a dim bar',
    },
    rating: 4.4,
    priceRange: '$$',
    website: 'https://thegoldfish.com.au',
    bookingUrl: 'https://thegoldfish.com.au/bookings',
    phone: '02 4998 7671',
    opens: '11:30',
    closes: '23:00',
    sommNote:
      'When the last cellar door shuts at five, this is where the valley goes. The cocktail list is far better than it needs to be.',
    lat: -32.7794,
    lng: 151.3239,
  },
  {
    id: 'hv-exp-matilda-bay-brewhouse',
    name: 'Matilda Bay Brewhouse',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'The brewhouse at Hunter Valley Resort, pouring paddles of beer brewed a few metres from the table alongside hearty pub-style plates. A welcome change of pace from tannin.',
    image: {
      url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Two beer bottles clinked together against a sunset',
    },
    rating: 4.3,
    priceRange: '$$',
    website: 'https://www.hunterresort.com.au',
    opens: '11:00',
    closes: '20:00',
    sommNote:
      'Even the most devoted Semillon pilgrim needs a beer eventually. Take a tasting paddle on the veranda and admit nothing.',
    lat: -32.7683,
    lng: 151.2934,
  },
  {
    id: 'hv-exp-sabor-dessert-bar',
    name: 'Sabor Dessert Bar',
    category: 'Dining',
    subregion: 'Pokolbin',
    description:
      'A dedicated dessert bar where pastry takes centre stage: plated dessert degustations, handmade chocolates and dessert wines to match. Sweet-toothed pilgrims travel a long way for it.',
    image: {
      url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A plated dessert of ice cream and brownie with caramel being poured over',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'Glass jars of panna cotta topped with fresh strawberries',
      },
    ],
    rating: 4.7,
    priceRange: '$$',
    website: 'https://www.sabordessertbar.com.au',
    opens: '10:00',
    closes: '17:00',
    sommNote:
      'A degustation of nothing but dessert sounds like a dare. It is, and you should accept it, ideally with a glass of botrytis Semillon.',
    lat: -32.7724,
    lng: 151.2988,
  },

  // --- Adventure ------------------------------------------------------------
  {
    id: 'hv-exp-balloon-aloft',
    name: 'Balloon Aloft',
    category: 'Adventure',
    subregion: 'Pokolbin',
    description:
      'Sunrise hot-air balloon flights over the vineyards with Australia’s longest-running balloon operator, followed by a sparkling breakfast back on solid ground.',
    image: {
      url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A hot-air balloon drifting over misty countryside at dawn',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'Vineyard rows seen from the air in early light',
      },
    ],
    rating: 4.9,
    priceRange: '$$$',
    website: 'https://balloonaloft.com',
    bookingUrl: 'https://balloonaloft.com/bookings/',
    phone: '02 4990 9242',
    opens: '04:30',
    closes: '12:00',
    sommNote:
      'The ultimate bucket list item. The silence drifting over the misty vines at dawn is spiritual.',
    lat: -32.7930,
    lng: 151.3210,
  },
  {
    id: 'hv-exp-hunter-valley-helicopters',
    name: 'Hunter Valley Helicopters',
    category: 'Adventure',
    subregion: 'Cessnock',
    description:
      'Scenic flights, winery lunch transfers and charters out of Cessnock Airport. The fastest way to grasp how the valley folds into the Brokenback Range.',
    image: {
      url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A helicopter in flight against open sky',
    },
    rating: 4.9,
    priceRange: '$$$$',
    website: 'https://huntervalleyhelicopters.com.au',
    bookingUrl: 'https://huntervalleyhelicopters.com.au/flights/',
    phone: '02 4990 1450',
    opens: '08:00',
    closes: '17:00',
    sommNote:
      'Ten minutes in the air explains the terroir better than any map. Arriving at lunch by helicopter is also, frankly, tremendous theatre.',
    lat: -32.8360,
    lng: 151.3560,
  },
  {
    id: 'hv-exp-hunter-valley-horse-riding',
    name: 'Hunter Valley Horse Riding & Adventures',
    category: 'Adventure',
    subregion: 'Rothbury',
    description:
      'Guided trail rides through vineyard country and open bushland near Rothbury, with mounts and pacing to suit complete beginners through to confident riders.',
    image: {
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A horse in golden afternoon light in open country',
    },
    rating: 4.8,
    priceRange: '$$',
    website: 'https://huntervalleyhorseriding.com.au',
    bookingUrl: 'https://huntervalleyhorseriding.com.au/book',
    phone: '02 4930 7111',
    opens: '08:00',
    closes: '17:00',
    sommNote:
      'The vines look different from the saddle: slower, quieter, older somehow. The horses know the way, so you are free to stare.',
    lat: -32.7400,
    lng: 151.3400,
  },
  {
    id: 'hv-exp-two-fat-blokes',
    name: 'Two Fat Blokes Gourmet Tours',
    category: 'Adventure',
    subregion: 'Pokolbin',
    description:
      'Small-group gourmet food and wine tours run by locals with serious appetites: cellar-door tastings, cheese and charcuterie pairings, and the back-lane stories in between.',
    image: {
      url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A generous grazing board of cheese, charcuterie and bread',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'Friends raising glasses of red wine together outdoors',
      },
      {
        url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'A glass of red wine overlooking vineyard rows',
      },
    ],
    rating: 4.8,
    priceRange: '$$$',
    website: 'https://twofatblokes.com.au',
    bookingUrl: 'https://twofatblokes.com.au',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'Let someone else drive and do the introductions. The blokes know which cellar doors pour the good stuff for their guests, and it shows.',
    lat: -32.7801,
    lng: 151.3012,
  },
  {
    id: 'hv-exp-grapemobile-bicycle-hire',
    name: 'Grapemobile Bicycle Hire',
    category: 'Adventure',
    subregion: 'Pokolbin',
    description:
      'Traditional pedal bikes for hire in the heart of Pokolbin, with flat, quiet lanes linking a dozen cellar doors within easy reach.',
    image: {
      url: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A cyclist riding a country lane in soft light',
    },
    rating: 4.5,
    priceRange: '$',
    website: 'https://grapemobile.com.au',
    phone: '02 4998 7733',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'Earn your lunch the old-fashioned way. The Palmers Lane loop is flat, shaded and conveniently lined with temptation.',
    lat: -32.7832,
    lng: 151.3148,
  },
  {
    id: 'hv-exp-sutton-estate-ebikes',
    name: 'Sutton Estate Electric Bike Hire',
    category: 'Adventure',
    subregion: 'Pokolbin',
    description:
      'Electric bikes for cruising the dedicated cycle path along Broke Road, taking the effort out of a full day of cellar-door hopping.',
    image: {
      url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A sleek bicycle leaning against a white wall',
    },
    rating: 4.6,
    priceRange: '$$',
    website: 'https://suttonestate.com.au',
    phone: '0429 088 020',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'All the freedom of cycling with none of the penance. The battery does the hills; you do the tastings.',
    lat: -32.7851,
    lng: 151.3179,
  },

  // --- Nature ---------------------------------------------------------------
  {
    id: 'hv-exp-hunter-valley-gardens',
    name: 'Hunter Valley Gardens',
    category: 'Nature',
    subregion: 'Pokolbin',
    description:
      'Fourteen hectares of formally designed display gardens, from the Storybook Garden to the Italian Grotto, threaded with eight kilometres of walking paths.',
    image: {
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Manicured formal gardens in full colour',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'Bright orange blooms against a blue sky',
      },
    ],
    rating: 4.6,
    priceRange: '$$',
    website: 'https://huntervalleygardens.com.au',
    bookingUrl: 'https://huntervalleygardens.com.au/buy-tickets/',
    phone: '02 4998 4000',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'Between tastings it is a palate cleanser for the eyes. Come back after dark in season for the Christmas lights, which are genuinely spectacular.',
    lat: -32.7750,
    lng: 151.2970,
  },
  {
    id: 'hv-exp-werakata-national-park',
    name: 'Werakata National Park',
    category: 'Nature',
    subregion: 'Cessnock',
    description:
      'Bushwalking and cycling trails through rare lowland spotted gum and ironbark forest on the valley floor. Free to enter and a haven for birdwatchers.',
    image: {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Sunlight falling through a tall eucalypt forest',
    },
    rating: 4.4,
    priceRange: '$',
    website: 'https://nationalparks.nsw.gov.au',
    opens: 'Dawn',
    closes: 'Dusk',
    sommNote:
      'The wild, uncombed side of the valley. In winter, keep an ear out for swift parrots; they winter here and almost nowhere else.',
    lat: -32.8100,
    lng: 151.3800,
  },
  {
    id: 'hv-exp-mount-bright-lookout',
    name: 'Mount Bright Lookout',
    category: 'Nature',
    subregion: 'Mount View',
    description:
      'A lookout on the high ground above Mount View, gazing across the amphitheatre of vineyards to the valley floor. Free, unfenced by commerce, and quietest at first light.',
    image: {
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Mist and sunrise breaking over green ridgelines',
    },
    rating: 4.7,
    priceRange: '$',
    opens: 'Dawn',
    closes: 'Dusk',
    sommNote:
      'Bring a coffee and arrive before the mist lifts. Watching the vineyards emerge row by row is the cheapest luxury in the Hunter.',
    lat: -32.8530,
    lng: 151.2900,
  },
  {
    id: 'hv-exp-mcnamara-park-broke',
    name: 'McNamara Park, Broke',
    category: 'Nature',
    subregion: 'Broke Fordwich',
    description:
      'A shaded riverside reserve on the banks of Wollombi Brook in the village of Broke, with picnic tables, big old trees and a gentle swimming spot in the warmer months.',
    image: {
      url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Still water reflecting trees at a quiet swimming spot',
    },
    rating: 4.2,
    priceRange: '$',
    opens: 'Dawn',
    closes: 'Dusk',
    sommNote:
      'Pick up a Broke Fordwich Semillon, a baguette and some cheese, then claim a picnic table by the brook. That is the whole itinerary.',
    lat: -32.7480,
    lng: 151.1010,
  },

  // --- Golf -----------------------------------------------------------------
  {
    id: 'hv-exp-cypress-lakes-golf',
    name: 'Cypress Lakes Golf & Country Club',
    category: 'Golf',
    subregion: 'Pokolbin',
    description:
      'An 18-hole championship resort course ranked among Australia’s best, rolling over dramatic elevation changes with the Brokenback Range as a backdrop.',
    image: {
      url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A manicured golf green under a wide open sky',
    },
    rating: 4.5,
    priceRange: '$$$',
    website: 'https://cypresslakes.com.au',
    bookingUrl: 'https://cypresslakes.com.au/golf/book-tee-times/',
    phone: '02 4993 1555',
    opens: '07:00',
    closes: '18:00',
    sommNote:
      'The elevation changes punish lazy club selection and reward the view. Few courses let you sight your approach against a mountain range.',
    lat: -32.7710,
    lng: 151.3050,
  },
  {
    id: 'hv-exp-the-vintage-golf-club',
    name: 'The Vintage Golf Club',
    category: 'Golf',
    subregion: 'Rothbury',
    description:
      'A Greg Norman-designed 18-hole championship course woven through wetlands, creeks and stands of old gums at Rothbury. Immaculately kept and a genuine test from the back tees.',
    image: {
      url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A golf course fairway curving through trees',
    },
    rating: 4.8,
    priceRange: '$$$',
    website: 'https://thevintage.com.au',
    bookingUrl: 'https://thevintage.com.au/golf/book-a-tee-time/',
    phone: '02 4998 2500',
    opens: '07:00',
    closes: '18:00',
    sommNote:
      'The Shark’s design gives you no cheap pars, only honest ones. Play early, then reward yourself at a cellar door by noon.',
    lat: -32.7480,
    lng: 151.3320,
  },
  {
    id: 'hv-exp-hunter-valley-golf-country-club',
    name: 'Hunter Valley Golf & Country Club',
    category: 'Golf',
    subregion: 'Lovedale',
    description:
      'An 18-hole course beside the Crowne Plaza Hunter Valley resort in Lovedale, with generous fairways, resident kangaroos and a relaxed pace that suits holiday golf.',
    image: {
      url: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A golfer mid-swing on a tree-lined course',
    },
    rating: 4.4,
    priceRange: '$$',
    website: 'https://huntervalleygolf.com.au',
    opens: '06:30',
    closes: '18:00',
    sommNote:
      'The kangaroos lounging on the fairways have right of way and know it. Friendly, forgiving golf, ideal the morning after a big tasting day.',
    lat: -32.7570,
    lng: 151.3620,
  },

  // --- Shopping ---------------------------------------------------------------
  {
    id: 'hv-exp-hunter-valley-cheese-factory',
    name: 'Hunter Valley Cheese Factory',
    category: 'Shopping',
    subregion: 'Pokolbin',
    description:
      'A working cheese factory at the McGuigan complex, handcrafting cow and goat milk cheeses on site, with daily tastings and talks at the counter.',
    image: {
      url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Handmade cheese wheels stacked on a counter',
    },
    rating: 4.4,
    priceRange: '$',
    website: 'https://huntervalleycheese.com.au',
    phone: '02 4998 7744',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'Watch the vats through the window, then buy the washed rind you were warned about. It is the correct decision.',
    lat: -32.7889,
    lng: 151.3121,
  },
  {
    id: 'hv-exp-smelly-cheese-shop',
    name: 'Hunter Valley Smelly Cheese Shop',
    category: 'Shopping',
    subregion: 'Pokolbin',
    description:
      'A vast fromagerie at Roche Estate stocking local and imported cheeses, small-goods, olives and gelato. The name undersells the range and oversells the aroma.',
    image: {
      url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A laden cheese board with figs and crackers',
    },
    rating: 4.5,
    priceRange: '$$',
    website: 'https://smellycheese.net.au',
    phone: '02 4998 6700',
    opens: '10:00',
    closes: '17:00',
    sommNote:
      'Assemble tonight’s picnic here: something oozing, something hard and salty, and a tub of gelato for the drive that will not survive the drive.',
    lat: -32.7806,
    lng: 151.3247,
  },
  {
    id: 'hv-exp-hunter-valley-chocolate-company',
    name: 'Hunter Valley Chocolate Company',
    category: 'Shopping',
    subregion: 'Pokolbin',
    description:
      'Chocolatiers working in view of the shop floor, turning out Belgian-style chocolates, fudge, rocky road and gelato. Tastings are cheerfully encouraged.',
    image: {
      url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Dark chocolate pieces stacked with cocoa dusting',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'A hand holding a double-scoop ice cream cone',
      },
    ],
    rating: 4.5,
    priceRange: '$',
    website: 'https://hvchocolate.com.au',
    phone: '02 4998 6999',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'The chilli chocolate pairs alarmingly well with Hunter Shiraz. Buy gifts here, then buy replacements for the gifts you eat on the way home.',
    lat: -32.7740,
    lng: 151.2960,
  },
  {
    id: 'hv-exp-hunter-distillery',
    name: 'Hunter Distillery',
    category: 'Shopping',
    subregion: 'Pokolbin',
    description:
      'A family-run distillery on Broke Road producing gins, vodkas, schnapps and liqueurs, with guided tastings at the cellar door among the stills.',
    image: {
      url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Gleaming stainless steel stills and tanks in a production hall',
    },
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=1200',
        source: 'unsplash',
        alt: 'Colourful cocktails garnished with lime on a bar',
      },
    ],
    rating: 4.6,
    priceRange: '$$',
    website: 'https://hunterdistillery.com.au',
    opens: '10:00',
    closes: '17:00',
    sommNote:
      'A sharpener between wineries does wonders for the palate. The schnapps flight is dangerous in the most agreeable way.',
    lat: -32.7776,
    lng: 151.2941,
  },
  {
    id: 'hv-exp-ogishi-craft-centre',
    name: 'Ogishi Craft Centre',
    category: 'Shopping',
    subregion: 'Pokolbin',
    description:
      'The studio and gallery of glass artist Setsuko Ogishi, where visitors can watch glass-blowing demonstrations and browse hand-made glass art.',
    image: {
      url: 'https://images.unsplash.com/photo-1597361304971-f9cfd6e154c7?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Molten glass glowing on a blowpipe mid-demonstration',
    },
    rating: 4.7,
    priceRange: '$$',
    website: 'https://ogishicraft.com',
    phone: '02 4998 7979',
    opens: '10:00',
    closes: '16:00',
    sommNote:
      'Watching molten glass become a wine goblet is quietly hypnotic. You will leave with something fragile and no regrets.',
    lat: -32.7752,
    lng: 151.2902,
  },

  // --- Family -----------------------------------------------------------------
  {
    id: 'hv-exp-hunter-valley-wildlife-park',
    name: 'Hunter Valley Wildlife Park',
    category: 'Family',
    subregion: 'Nulkaba',
    description:
      'A hands-on wildlife park at Nulkaba where koalas, kangaroos and wombats share billing with lions, meerkats and monkeys. Encounter sessions run daily.',
    image: {
      url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A lion resting in golden light',
    },
    rating: 4.7,
    priceRange: '$$',
    website: 'https://www.huntervalleywildlifepark.com.au',
    phone: '02 4990 7714',
    opens: '09:00',
    closes: '16:00',
    sommNote:
      'Hand-feeding kangaroos before lunch is a reliable way to make a child forget every cellar door they have been dragged through.',
    lat: -32.7980,
    lng: 151.3480,
  },
  {
    id: 'hv-exp-aqua-golf-putt-putt',
    name: 'Hunter Valley Aqua Golf & Putt Putt',
    category: 'Family',
    subregion: 'Pokolbin',
    description:
      'Drive golf balls at floating targets on the lake or take on the 18-hole putt putt course. Cheerfully unserious fun for every age and skill level.',
    image: {
      url: 'https://images.unsplash.com/photo-1564607890610-2172bf275043?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'A putter lining up a red ball on a putt putt green',
    },
    rating: 4.4,
    priceRange: '$',
    website: 'https://huntervalleyaquagolf.com.au',
    phone: '0425 291 308',
    opens: '09:30',
    closes: '16:30',
    sommNote:
      'Nobody maintains their dignity launching golf balls into a lake, which is precisely the point. Gloriously silly.',
    lat: -32.7690,
    lng: 151.2921,
  },
  {
    id: 'hv-exp-hunter-valley-resort-farm',
    name: 'Hunter Valley Resort Farm Experiences',
    category: 'Family',
    subregion: 'Pokolbin',
    description:
      'Farm and vineyard experiences at the Hunter Valley Resort on Hermitage Road, from tractor-pulled vineyard tours to farmyard animal encounters and wine education for the grown-ups.',
    image: {
      url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=1200',
      source: 'unsplash',
      alt: 'Curious cattle in a paddock at sunset',
    },
    rating: 4.5,
    priceRange: '$$',
    website: 'https://www.hunterresort.com.au',
    opens: '09:00',
    closes: '17:00',
    sommNote:
      'The rare stop where the children are as busy as the adults. They meet the animals; you meet the local Shiraz. Everyone wins.',
    lat: -32.7676,
    lng: 151.2946,
  },
];
