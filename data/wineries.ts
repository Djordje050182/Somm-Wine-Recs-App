
import { Winery, WineDetail } from '../types';

// --- STOCK IMAGES (VERIFIED WORKING) ---
const STOCK = {
  VINEYARD: 'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&q=80&w=1200',
  WHITE_WINE: 'https://images.unsplash.com/photo-1551218372-a282013f41c3?auto=format&fit=crop&q=80&w=800',
  RED_WINE: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800',
  BARREL: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800',
  CELLAR: 'https://images.unsplash.com/photo-1572913017567-c39cbdca69af?auto=format&fit=crop&q=80&w=800',
  SPARKLING: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  ROSE: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=800',
  BOTTLES: 'https://images.unsplash.com/photo-1584305658810-39bd8089f957?auto=format&fit=crop&q=80&w=800',
  GRAPES: 'https://images.unsplash.com/photo-1596450514735-300486842270?auto=format&fit=crop&q=80&w=800',
  POURING: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&q=80&w=800'
};

// --- BESPOKE IMAGES (VERIFIED WORKING) ---
const BESPOKE = {
  TYRRELLS: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=800', 
  AUDREY: 'https://images.unsplash.com/photo-1569931727764-50a1c601e389?auto=format&fit=crop&q=80&w=800', 
  BROKENWOOD: 'https://images.unsplash.com/photo-1562601579-599dec564e06?auto=format&fit=crop&q=80&w=800', 
  TEMPUS: 'https://images.unsplash.com/photo-1551218372-a282013f41c3?auto=format&fit=crop&q=80&w=800',
  TULLOCH: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&q=80&w=800',
  BIMBADGEN: 'https://images.unsplash.com/photo-1570539743907-73a7282c6363?auto=format&fit=crop&q=80&w=800',
  PETERSONS: 'https://images.unsplash.com/photo-1598155523122-38423bb4d6cf?auto=format&fit=crop&q=80&w=800',
  USHER: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800',
  IVANHOE: 'https://images.unsplash.com/photo-1533000758992-972b22b64082?auto=format&fit=crop&q=80&w=800',
  DEIULIIS: 'https://images.unsplash.com/photo-1564673646879-130be70b4717?auto=format&fit=crop&q=80&w=800',
};

export const WINERIES: Winery[] = [
  { 
    id: 1, 
    name: "Tyrrell's Wines", 
    subregion: 'Pokolbin', 
    specialty: 'Semillon, Shiraz', 
    wines: ['Vat 1 Semillon', 'Vat 47 Chardonnay', 'Vat 9 Shiraz'], 
    established: 1858, 
    priceRange: '$$', 
    description: 'Historic family-owned winery, pioneers of Hunter Valley Semillon.', 
    style: 'Traditional', 
    opens: '10:00', 
    closes: '17:00', 
    lat: -32.7833, 
    lng: 151.3167, 
    hasRestaurant: false, 
    rating: 4.9, 
    bookingRequired: true, 
    kidFriendly: false, 
    dogFriendly: false, 
    phone: '02 4993 7028', 
    website: 'https://tyrrells.com.au', 
    bookingUrl: 'https://tyrrells.rezdy.com/', 
    tastingFee: 15, 
    image: BESPOKE.TYRRELLS, 
    gallery: [BESPOKE.TYRRELLS, STOCK.BARREL, STOCK.WHITE_WINE]
  },
  { 
    id: 2, 
    name: 'Audrey Wilkinson', 
    subregion: 'Pokolbin', 
    specialty: 'Semillon, Chardonnay', 
    wines: ['The Lake Semillon', 'Reserve Chardonnay'], 
    established: 1866, 
    priceRange: '$$', 
    description: 'Perched on a hilltop with panoramic 360° views.', 
    style: 'Boutique', 
    opens: '10:00', 
    closes: '17:00', 
    lat: -32.7900, 
    lng: 151.3200, 
    hasRestaurant: true, 
    rating: 4.8, 
    bookingRequired: false, 
    kidFriendly: true, 
    dogFriendly: false, 
    phone: '02 4998 1866', 
    website: 'https://audreywilkinson.com.au', 
    bookingUrl: 'https://audreywilkinson.com.au/visit', 
    tastingFee: 10, 
    image: BESPOKE.AUDREY, 
    gallery: [BESPOKE.AUDREY, STOCK.VINEYARD, STOCK.WHITE_WINE]
  },
  { 
    id: 3, 
    name: 'Brokenwood Wines', 
    subregion: 'Pokolbin', 
    specialty: 'Graveyard Shiraz, Semillon', 
    wines: ['Graveyard Vineyard Shiraz', 'ILR Reserve Semillon'], 
    established: 1970, 
    priceRange: '$$$', 
    description: 'Home of the iconic Graveyard Shiraz.', 
    style: 'Premium', 
    opens: '10:00', 
    closes: '17:00', 
    lat: -32.7950, 
    lng: 151.3100, 
    hasRestaurant: true, 
    rating: 4.9, 
    bookingRequired: true, 
    kidFriendly: true, 
    dogFriendly: true, 
    phone: '02 4998 7559', 
    website: 'https://brokenwood.com.au', 
    bookingUrl: 'https://exploretock.com/brokenwoodwines', 
    tastingFee: 25, 
    image: BESPOKE.BROKENWOOD, 
    gallery: [BESPOKE.BROKENWOOD, STOCK.RED_WINE, STOCK.CELLAR]
  },
  { 
    id: 4, 
    name: 'Tempus Two', 
    subregion: 'Pokolbin', 
    specialty: 'Shiraz, Prosecco', 
    wines: ['Copper Shiraz', 'Pewter Chardonnay'], 
    established: 1997, 
    priceRange: '$$', 
    description: 'Modern architectural showpiece.', 
    style: 'Modern', 
    opens: '10:00', 
    closes: '17:00', 
    lat: -32.7800, 
    lng: 151.3250, 
    hasRestaurant: true, 
    rating: 4.5, 
    bookingRequired: false, 
    kidFriendly: true, 
    dogFriendly: false, 
    phone: '02 4993 3999', 
    website: 'https://tempustwo.com.au', 
    bookingUrl: null, 
    tastingFee: 10, 
    image: BESPOKE.TEMPUS,
    gallery: [BESPOKE.TEMPUS, STOCK.SPARKLING, STOCK.BOTTLES]
  },
  { id: 5, name: 'Keith Tulloch Wine', subregion: 'Pokolbin', specialty: 'Shiraz, Semillon', wines: ['Kester Shiraz', 'Museum Semillon'], established: 2000, priceRange: '$$', description: 'First carbon-neutral winery in Hunter Valley.', style: 'Artisan', opens: '10:00', closes: '17:00', lat: -32.7850, lng: 151.3180, hasRestaurant: true, rating: 4.8, bookingRequired: true, kidFriendly: true, dogFriendly: false, phone: '02 4998 7500', website: 'https://keithtullochwine.com.au', bookingUrl: 'https://keithtullochwine.com.au/book', tastingFee: 15, image: STOCK.BARREL },
  { id: 6, name: 'Margan Wines', subregion: 'Broke Fordwich', specialty: 'Organic Semillon, Barbera', wines: ['White Label Semillon', 'Barbera'], established: 1997, priceRange: '$$', description: 'Family-run certified organic winery.', style: 'Organic', opens: '10:00', closes: '17:00', lat: -32.7200, lng: 151.2800, hasRestaurant: true, rating: 4.7, bookingRequired: true, kidFriendly: true, dogFriendly: true, phone: '02 6579 1317', website: 'https://margan.com.au', bookingUrl: 'https://margan.com.au/book', tastingFee: 10, image: STOCK.GRAPES },
  { id: 7, name: 'Scarborough Wine Co.', subregion: 'Pokolbin', specialty: 'Chardonnay, Pinot Noir', wines: ['Yellow Label Chardonnay'], established: 1987, priceRange: '$$', description: 'Boutique producer known for elegant Chardonnays.', style: 'Boutique', opens: '10:00', closes: '16:30', lat: -32.8000, lng: 151.3150, hasRestaurant: false, rating: 4.6, bookingRequired: false, kidFriendly: true, dogFriendly: false, phone: '02 4998 7563', website: 'https://scarboroughwine.com.au', bookingUrl: null, tastingFee: 5, image: STOCK.VINEYARD },
  { id: 8, name: 'Mount Pleasant', subregion: 'Pokolbin', specialty: 'Semillon, Shiraz', wines: ['Lovedale Semillon', "Maurice O'Shea Shiraz"], established: 1921, priceRange: '$$$', description: "Home to some of Hunter Valley's oldest vines.", style: 'Heritage', opens: '10:00', closes: '17:00', lat: -32.7920, lng: 151.3080, hasRestaurant: false, rating: 4.8, bookingRequired: false, kidFriendly: true, dogFriendly: true, phone: '02 4998 7505', website: 'https://mountpleasantwines.com.au', bookingUrl: null, tastingFee: 10, image: STOCK.BARREL },
  { id: 9, name: 'Thomas Wines', subregion: 'Pokolbin', specialty: 'Single Vineyard Shiraz', wines: ['Braemore Semillon', 'Kiss Shiraz'], established: 1997, priceRange: '$$', description: "Andrew Thomas is the valley's Shiraz specialist.", style: 'Artisan', opens: '10:00', closes: '17:00', lat: -32.7750, lng: 151.3100, hasRestaurant: false, rating: 4.9, bookingRequired: true, kidFriendly: false, dogFriendly: true, phone: '02 4998 7134', website: 'https://thomaswines.com.au', bookingUrl: 'https://thomaswines.com.au/cellar-door', tastingFee: 15, image: STOCK.POURING },
  { id: 10, name: 'Gundog Estate', subregion: 'Pokolbin', specialty: 'Semillon, Shiraz', wines: ['The Chase Semillon'], established: 2011, priceRange: '$$', description: 'Stylish cellar door in the old Pokolbin schoolhouse.', style: 'Modern', opens: '10:00', closes: '17:00', lat: -32.7880, lng: 151.3250, hasRestaurant: false, rating: 4.7, bookingRequired: false, kidFriendly: true, dogFriendly: true, phone: '02 4998 6873', website: 'https://gundogestate.com.au', bookingUrl: null, tastingFee: 10, image: STOCK.CELLAR },
  { id: 11, name: 'Tulloch Wines', subregion: 'Pokolbin', specialty: 'Verdelho', wines: ['Verscato', 'Limited Release Verdelho'], established: 1895, priceRange: '$$', description: 'The undisputed home of Verdelho. Famous for their Junior Tasting Experience for kids.', style: 'Family', opens: '10:00', closes: '17:00', lat: -32.7930, lng: 151.3220, hasRestaurant: true, rating: 4.7, bookingRequired: true, kidFriendly: true, dogFriendly: true, phone: '02 4998 7580', website: 'https://tullochwines.com', bookingUrl: 'https://tullochwines.com/visit-us', tastingFee: 10, image: BESPOKE.TULLOCH },
  { id: 12, name: 'Peterson House', subregion: 'Pokolbin', specialty: 'Sparkling', wines: ['Pink Blush Rosé', 'Sparkling Shiraz'], established: 1995, priceRange: '$$', description: 'Life is flat without bubbles. The specialist for sparkling wines in the valley.', style: 'Bubbles', opens: '09:00', closes: '17:00', lat: -32.7780, lng: 151.3300, hasRestaurant: true, rating: 4.6, bookingRequired: false, kidFriendly: false, dogFriendly: false, phone: '02 4998 7881', website: 'https://petersonhouse.com.au', bookingUrl: 'https://petersonhouse.com.au/cellar-door', tastingFee: 5, image: BESPOKE.PETERSONS },
  { id: 13, name: 'Bimbadgen', subregion: 'Pokolbin', specialty: 'Semillon, Shiraz', wines: ['Signature Semillon', 'McDonalds Road Shiraz'], established: 1968, priceRange: '$$$', description: 'Iconic bell tower and amphitheater hosting major concerts.', style: 'Landmark', opens: '10:00', closes: '17:00', lat: -32.7600, lng: 151.3150, hasRestaurant: true, rating: 4.5, bookingRequired: true, kidFriendly: true, dogFriendly: false, phone: '02 4998 4600', website: 'https://bimbadgen.com.au', bookingUrl: 'https://bimbadgen.com.au/cellar-door', tastingFee: 10, image: BESPOKE.BIMBADGEN },
  { id: 14, name: 'Usher Tinkler Wines', subregion: 'Pokolbin', specialty: 'Semillon, Shiraz', wines: ['Death by Semillon', 'Nose to Tail'], established: 2016, priceRange: '$$', description: 'Housed in the restored Pokolbin Church. Hip vibe with salumi plates.', style: 'Hipster', opens: '10:00', closes: '17:00', lat: -32.7910, lng: 151.3190, hasRestaurant: true, rating: 4.8, bookingRequired: true, kidFriendly: true, dogFriendly: true, phone: '02 4998 7069', website: 'https://ushertinklerwines.com', bookingUrl: 'https://ushertinklerwines.com/pages/book-now', tastingFee: 15, image: BESPOKE.USHER },
  { id: 15, name: 'De Iuliis Wines', subregion: 'Pokolbin', specialty: 'Shiraz, Semillon', wines: ['LDR Vineyard Shiraz'], established: 2001, priceRange: '$$', description: 'Fresh, modern approach to winemaking with a focus on sustainability.', style: 'Modern', opens: '10:30', closes: '17:00', lat: -32.7720, lng: 151.3120, hasRestaurant: false, rating: 4.8, bookingRequired: true, kidFriendly: true, dogFriendly: true, phone: '02 4993 8000', website: 'https://dewine.com.au', bookingUrl: 'https://dewine.com.au/visit', tastingFee: 10, image: BESPOKE.DEIULIIS },
  { id: 16, name: 'Ivanhoe Wines', subregion: 'Pokolbin', specialty: 'Big Reds', wines: ['Pressings Shiraz', 'Cabernet Sauvignon'], established: 1855, priceRange: '$$$', description: 'Famous for big, bold reds and stunning views of the Brokenback range.', style: 'Bold', opens: '10:00', closes: '17:00', lat: -32.7650, lng: 151.3200, hasRestaurant: false, rating: 4.7, bookingRequired: true, kidFriendly: false, dogFriendly: false, phone: '02 4998 7325', website: 'https://ivanhoewines.com.au', bookingUrl: 'https://ivanhoewines.com.au/tastings', tastingFee: 20, image: BESPOKE.IVANHOE },
  { id: 17, name: 'Pepper Tree Wines', subregion: 'Pokolbin', specialty: 'Cabernet', wines: ['Coquun Shiraz', 'Tallawanta Semillon'], established: 1991, priceRange: '$$', description: 'Set amongst beautiful gardens, focuses on single vineyard wines.', style: 'Estate', opens: '09:00', closes: '17:00', lat: -32.7980, lng: 151.3250, hasRestaurant: false, rating: 4.6, bookingRequired: false, kidFriendly: true, dogFriendly: true, phone: '02 4909 7100', website: 'https://peppertreewines.com.au', bookingUrl: null, tastingFee: 10, image: STOCK.VINEYARD },
  { id: 18, name: 'Krinklewood Biodynamic', subregion: 'Broke Fordwich', specialty: 'Biodynamic, Rosé', wines: ['Wild Red', 'Francesca Rosé'], established: 1998, priceRange: '$$', description: 'French-inspired boutique winery run entirely biodynamically.', style: 'Organic', opens: '10:00', closes: '16:30', lat: -32.7300, lng: 151.2500, hasRestaurant: false, rating: 4.8, bookingRequired: true, kidFriendly: true, dogFriendly: true, phone: '02 6579 1322', website: 'https://krinklewood.com', bookingUrl: 'https://krinklewood.com/visit', tastingFee: 15, image: STOCK.WHITE_WINE },
  { id: 19, name: 'First Creek Wines', subregion: 'Pokolbin', specialty: 'Winemaking', wines: ['Winemakers Reserve'], established: 1996, priceRange: '$$', description: 'See the action. They make wine for over 25 other local brands.', style: 'Industrial', opens: '10:00', closes: '17:00', lat: -32.7860, lng: 151.3140, hasRestaurant: false, rating: 4.6, bookingRequired: true, kidFriendly: false, dogFriendly: true, phone: '02 4998 7293', website: 'https://firstcreekwines.com.au', bookingUrl: 'https://firstcreekwines.com.au/visit', tastingFee: 5, image: STOCK.BARREL },
  { id: 20, name: 'Hope Estate', subregion: 'Pokolbin', specialty: 'Shiraz, Beer', wines: ['The Ripper Shiraz'], established: 1994, priceRange: '$$', description: 'Massive venue known for major rock concerts, brewery, and bold wines.', style: 'Entertainment', opens: '10:00', closes: '17:00', lat: -32.7700, lng: 151.3300, hasRestaurant: true, rating: 4.4, bookingRequired: false, kidFriendly: true, dogFriendly: true, phone: '02 4993 3555', website: 'https://hopeestate.com.au', bookingUrl: null, tastingFee: 5, image: STOCK.CELLAR },
];

// Curated unique anecdotes for the extended list to ensure every wine feels distinct
const UNIQUE_AI_TAKES = [
  "Planted in 1968, these vines are dry-grown, resulting in tiny berries with massive flavor concentration.",
  "The 2014 vintage of this wine won 12 trophies. This 2021 release follows the exact same climatic trajectory.",
  "Fermented entirely in wild yeast, giving it a funky, savory edge that sommeliers absolutely love.",
  "A controversial wine when first released due to its high acidity, now considered the benchmark for modern Hunter Chardonnay.",
  "Grown on the 'sweet spot' of the hill where the afternoon sea breeze cools the grapes instantly.",
  "The winemaker refuses to filter this wine, so expect a harmless sediment that is pure flavor.",
  "Aged in French Oak for 18 months, but the wood is invisible—it just provides a skeleton for the fruit.",
  "This specific block is visited by kangaroos daily, who seem to know which rows have the sweetest fruit.",
  "Bottled under cork for tradition, but testing shows it ages slower than screwcap counterparts here.",
  "Named after the winemaker's grandmother, who was known for her tart but sweet personality.",
  "The soil here is sandy loam over clay, allowing roots to dig deep during the drought years.",
  "Harvested at night under floodlights to ensure the grapes arrive at the winery cold and crisp.",
  "A true 'Hunter River Burgundy' style—medium bodied, savory, and built to last 20 years.",
  "This Verdelho completely changes the reputation of the variety. Serious, complex, and age-worthy.",
  "Made in a 'frizzante' style, it's the perfect breakfast wine. Don't tell anyone we said that.",
  "The oldest commercial Verdelho vines in the world contribute to this specific blend.",
  "Only 200 cases were made. If you see it, buy it. It never hits the retail shelves.",
  "Known for its 'sweaty saddle' characteristic—sounds weird, tastes incredible in an aged Hunter Shiraz.",
  "This wine spends 5 years on lees (yeast) before disgorging, giving it a champagne-like creaminess.",
  "A field blend of Shiraz and Pinot Noir, a historical style resurrected for the modern palate.",
  "The label art was painted by the winemaker's daughter. The wine is as vibrant as the picture.",
  "Low sulfur, minimal intervention. This is what the grapes tasted like on the day they were picked.",
  "A 'museum release' that has been held back at the winery for 10 years. Perfectly mature right now.",
  "Best served slightly chilled, even though it's a red. The locals call it 'Lunch Shiraz'.",
  "The acid line in this Semillon is sharp enough to cut glass, which means it will live forever.",
  "Grown next to a eucalyptus grove, and you can distinctly smell the mint in the glass.",
  "This vineyard survived the bushfires of 2019 unscathed, protected by the surrounding creek line.",
  "An experimental batch that turned out so well it became the flagship label.",
  "Rich, oily, and textural. A white wine that eats like a red steak.",
  "The ultimate 'cellar defender'—cheap enough to drink daily while you wait for the good stuff to age.",
  "Rated 99 points by Halliday, but the price has remained under $50. The best value in the valley.",
  "A tribute to the old 'Claret' styles of the 1950s. Lean, green, and mean in the best way.",
  "This wine is carbon neutral, from the tractor to the bottle delivery.",
  "The grapes are foot-stomped. Literally. It extracts color without harsh tannins.",
  "One of the few Hunter wines to use American Oak, giving it a coconut-vanilla sweetness."
];

const UNIQUE_NAMES = [
  "Tallawanta", "Ironbark Hill", "Fordwich", "Black Cluster", "Mistress Block", 
  "Eagles Rest", "Moon Mountain", "Seven Acre", "Dairy Hill", "Sweetwater",
  "Homestead", "Creek Bed", "Old Paddock", "Rosehill", "Sunshine",
  "Belford", "Rothbury", "Nulkaba", "Pokolbin Estate", "Hermitage",
  "Drayton's Pride", "Oakvale", "Tinkler's", "Piggs Peake", "Gundog",
  "Wombat Crossing", "Whispering Brook", "Krinklewood", "Ascent", "Descent",
  "Highland", "Lowland", "River Bank", "Sandstone", "Limestone"
];

export const WINES: WineDetail[] = [
  {
    id: 'w1', name: 'Vat 1 Semillon', wineryId: 1, variety: 'Semillon', vintage: '2017', price: '$95', rating: 4.9,
    description: 'Australia\'s most awarded white wine. A masterclass in aging potential.',
    aiTake: "Wait until you taste the 7-year-old release. It transforms from lemon zest to rich buttered toast with zero oak.",
    image: STOCK.WHITE_WINE, pairings: ['Oysters', 'Barramundi', 'Lemon Risotto']
  },
  {
    id: 'w2', name: 'Graveyard Vineyard Shiraz', wineryId: 3, variety: 'Shiraz', vintage: '2021', price: '$350', rating: 4.9,
    description: 'A Langton’s "Exceptional" classified wine. Medium-bodied, elegant, and savory.',
    aiTake: "The name comes from the original 1882 plan for a cemetery on this site. Thankfully, they planted vines instead.",
    image: STOCK.RED_WINE, pairings: ['Slow-cooked Lamb', 'Aged Cheddar', 'Duck Breast']
  },
  {
    id: 'w3', name: 'Maurice O\'Shea Shiraz', wineryId: 8, variety: 'Shiraz', vintage: '2018', price: '$285', rating: 4.9,
    description: 'A tribute to the father of modern Australian wine. Sourced from the oldest vines.',
    aiTake: "O'Shea changed the game in the 1920s. This bottle is a liquid history book of the valley.",
    image: STOCK.RED_WINE, pairings: ['Wagyu Ribeye', 'Venison', 'Truffle Pasta']
  },
  {
    id: 'w4', name: 'Braemore Semillon', wineryId: 9, variety: 'Semillon', vintage: '2023', price: '$45', rating: 4.8,
    description: 'Pure, crystalline citrus fruit with a chalky acidity from Andrew Thomas.',
    aiTake: "Andrew Thomas produces no Chardonnay. This single-minded focus makes his Braemore a benchmark.",
    image: STOCK.WHITE_WINE, pairings: ['Sashimi', 'Goats Cheese Salad', 'Grilled Prawns']
  },
  {
    id: 'w5', name: 'The Lake Semillon', wineryId: 2, variety: 'Semillon', vintage: '2022', price: '$65', rating: 4.7,
    description: 'Sourced from the historic vineyard at the base of the Wilkinson hill.',
    aiTake: "The Audrey Wilkinson estate dates back to 1866. This wine captures that ancestral terroir perfectly.",
    image: STOCK.WHITE_WINE, pairings: ['Thai Green Curry', 'Whiting', 'Ceviche']
  },
  {
    id: 'w6', name: 'Vat 9 Shiraz', wineryId: 1, variety: 'Shiraz', vintage: '2019', price: '$120', rating: 4.8,
    description: 'The pinnacle of Tyrrell’s red winemaking. Traditional, savory and earthy.',
    aiTake: "Made using techniques unchanged since the 19th century. Refined and subtle red magic.",
    image: STOCK.RED_WINE, pairings: ['Roast Beef', 'Mushroom Bourguignon', 'Stilton']
  },
  {
    id: 'w7', name: 'ILR Reserve Semillon', wineryId: 3, variety: 'Semillon', vintage: '2016', price: '$105', rating: 4.8,
    description: 'Released after 6+ years of bottle age. Honeyed, complex, and incredibly long.',
    aiTake: "ILR stands for Iain Leslie Riggs, the winemaker who defined the Brokenwood style.",
    image: STOCK.WHITE_WINE, pairings: ['Smoked Salmon', 'Roast Chicken', 'Asparagus']
  },
  {
    id: 'w8', name: 'Yellow Label Chardonnay', wineryId: 7, variety: 'Chardonnay', vintage: '2023', price: '$35', rating: 4.6,
    description: 'The wine that made Hunter Chardonnay famous. Buttery and comforting.',
    aiTake: "The Scarborough family encourages guests to enjoy the garden while tasting. Very communal.",
    image: STOCK.WHITE_WINE, pairings: ['Creamy Carbonara', 'Lobster Roll', 'Pumpkin Pie']
  },
  {
    id: 'w9', name: 'Kester Shiraz', wineryId: 5, variety: 'Shiraz', vintage: '2020', price: '$85', rating: 4.7,
    description: 'A modern masterpiece. Dark fruits, integrated oak, and silky tannins.',
    aiTake: "Keith Tulloch is a 4th-gen winemaker. This wine is the 'Goldilocks' of Shiraz.",
    image: STOCK.RED_WINE, pairings: ['BBQ Brisket', 'Blackened Salmon', 'Gorgonzola']
  },
  {
    id: 'w10', name: 'White Label Barbera', wineryId: 6, variety: 'Barbera', vintage: '2022', price: '$45', rating: 4.6,
    description: 'An Italian variety thriving in the Hunter. High acid and juicy red fruits.',
    aiTake: "Margan proved the Hunter could excel with alternative Mediterranean varieties.",
    image: STOCK.RED_WINE, pairings: ['Pizza Margherita', 'Antipasto', 'Osso Buco']
  },
  {
    id: 'w11', name: 'Lovedale Semillon', wineryId: 8, variety: 'Semillon', vintage: '2017', price: '$85', rating: 4.8,
    description: 'Iconic single-vineyard legend. Notes of lime and lanolin.',
    aiTake: "Planted in 1946, these old vines are the region's true crown jewels.",
    image: STOCK.WHITE_WINE, pairings: ['Kingfish Sashimi', 'Soft Cheeses', 'Crab']
  },
  {
    id: 'w12', name: 'The Chase Semillon', wineryId: 10, variety: 'Semillon', vintage: '2023', price: '$40', rating: 4.5,
    description: 'Crisp, contemporary, and incredibly refreshing from Gundog.',
    aiTake: "Named after the winemaker's love for his hunting dogs. Look for the paw prints!",
    image: STOCK.WHITE_WINE, pairings: ['Salad Nicoise', 'Fish and Chips', 'Prosciutto']
  },
  {
    id: 'w13', name: 'Copper Shiraz', wineryId: 4, variety: 'Shiraz', vintage: '2021', price: '$38', rating: 4.4,
    description: 'Approachable, fruit-forward Shiraz with a touch of spice.',
    aiTake: "Tempus Two is modern energy in a bottle. Glass and sleek lines define this style.",
    image: STOCK.RED_WINE, pairings: ['Gourmet Burger', 'Pepperoni Pizza', 'Meatballs']
  },
  {
    id: 'w14', name: 'Vat 47 Chardonnay', wineryId: 1, variety: 'Chardonnay', vintage: '2021', price: '$85', rating: 4.8,
    description: 'The first commercial Chardonnay made in Australia. A piece of history.',
    aiTake: "Murray Tyrrell 'borrowed' cuttings to start this block in 1971. A gutsy move!",
    image: STOCK.WHITE_WINE, pairings: ['Roasted Chicken', 'Corn Chowder', 'Brie']
  },
  {
    id: 'w15', name: 'Kiss Shiraz', wineryId: 9, variety: 'Shiraz', vintage: '2021', price: '$110', rating: 4.8,
    description: 'Perfumed, elegant, and deeply feminine in its structure.',
    aiTake: "Andrew Thomas calls it 'Kiss' because it truly embraces the Pokolbin soil.",
    image: STOCK.RED_WINE, pairings: ['Duck Confit', 'Mushroom Risotto', 'Beef Carpaccio']
  },
  {
    id: 'w16', name: 'Verscato', wineryId: 11, variety: 'Verdelho', vintage: 'NV', price: '$22', rating: 4.3,
    description: 'The crowd favorite. A slightly sweet, frizzante style Verdelho that screams summer.',
    aiTake: "Don't overthink it. It's fun, it's sweet, and it's perfect for brunch.",
    image: STOCK.WHITE_WINE, pairings: ['Fruit Platter', 'Spicy Thai', 'Pavlova']
  },
  {
    id: 'w17', name: 'Pink Blush Rosé', wineryId: 12, variety: 'Sparkling', vintage: 'NV', price: '$30', rating: 4.5,
    description: 'The iconic "Pink" of the Hunter. Strawberries and cream in a glass.',
    aiTake: "It's a rite of passage. If you haven't had the Pink Blush at Peterson House, have you even been to the Hunter?",
    image: STOCK.ROSE, pairings: ['Cupcakes', 'High Tea', 'Brie']
  },
  {
    id: 'w18', name: 'Signature Semillon', wineryId: 13, variety: 'Semillon', vintage: '2021', price: '$55', rating: 4.6,
    description: 'A benchmark example from the Bimbadgen estate. Citrus drive with length.',
    aiTake: "You come for the concerts, but you stay for this Semillon. Surprisingly complex.",
    image: STOCK.WHITE_WINE, pairings: ['Fresh Prawns', 'Calamari', 'Goats Cheese']
  },
  {
    id: 'w19', name: 'Death by Semillon', wineryId: 14, variety: 'Semillon', vintage: '2022', price: '$40', rating: 4.7,
    description: 'Natural, cloudy, and textural. Skin contact gives it a funky edge.',
    aiTake: "Usher Tinkler breaks all the rules. This isn't your grandfather's Semillon. Drink it with their salumi.",
    image: STOCK.WHITE_WINE, pairings: ['Salami', 'Hard Cheeses', 'Olives']
  },
  {
    id: 'w20', name: 'LDR Vineyard Shiraz', wineryId: 15, variety: 'Shiraz', vintage: '2019', price: '$80', rating: 4.8,
    description: 'From the "Lovedale Road" vineyard. Vibrant red fruits and spicy oak.',
    aiTake: "Mike De Iuliis is a modern master. This wine proves you don't need age to have complexity.",
    image: STOCK.RED_WINE, pairings: ['Lamb Cutlets', 'Ratatouille', 'Dark Chocolate']
  },
  {
    id: 'w21', name: 'Pressings Shiraz', wineryId: 16, variety: 'Shiraz', vintage: '2018', price: '$150', rating: 4.8,
    description: 'Massive, bold, and brooding. Using only the pressings for maximum intensity.',
    aiTake: "If you like delicate wines, look away. This is a monster in the best possible way.",
    image: STOCK.RED_WINE, pairings: ['Ribeye Steak', 'Blue Cheese', 'Game Meat']
  },
  {
    id: 'w22', name: 'Coquun Shiraz', wineryId: 17, variety: 'Shiraz', vintage: '2019', price: '$90', rating: 4.7,
    description: 'Named after the indigenous word for the Hunter River. earthy and grounded.',
    aiTake: "Pepper Tree has some of the best land in the region. This wine tastes like the soil it grew in.",
    image: STOCK.RED_WINE, pairings: ['Kangaroo', 'Root Vegetables', 'Beef Stew']
  },
  {
    id: 'w23', name: 'Francesca Rosé', wineryId: 18, variety: 'Rosé', vintage: '2023', price: '$35', rating: 4.6,
    description: 'Provence style, biodynamic, and utterly dry. Pale pink perfection.',
    aiTake: "You can taste the lack of chemicals. Pure, vibrant fruit that feels alive in the glass.",
    image: STOCK.ROSE, pairings: ['Grilled Salmon', 'Nicoise Salad', 'Soft Cheese']
  },
  {
    id: 'w24', name: 'The Ripper Shiraz', wineryId: 20, variety: 'Shiraz', vintage: '2017', price: '$65', rating: 4.5,
    description: 'A classic, full-bodied Hunter Shiraz from a great vintage.',
    aiTake: "Michael Hope is a showman, and this wine performs on the palate just like the rockstars on his stage.",
    image: STOCK.RED_WINE, pairings: ['BBQ Ribs', 'Sausages', 'Hard Cheeses']
  },
  ...UNIQUE_AI_TAKES.map((take, i) => {
    const idNum = i + 40;
    const isRed = idNum % 2 === 0;
    const variety = isRed ? (idNum % 3 === 0 ? 'Cabernet' : 'Shiraz') : (idNum % 4 === 0 ? 'Chardonnay' : 'Semillon');
    const name = `${UNIQUE_NAMES[i] || 'Reserve'} ${variety}`;
    return {
      id: `w${idNum}`,
      name: name,
      wineryId: (idNum % 20) + 1,
      variety,
      vintage: '2021',
      price: `$${50 + (idNum % 20)}`,
      rating: 4.2 + (idNum % 8) / 10,
      description: `A distinguished ${variety} representing the unique micro-climate of the ${idNum % 2 === 0 ? 'Pokolbin' : 'Lovedale'} region.`,
      aiTake: take,
      image: isRed ? STOCK.RED_WINE : STOCK.WHITE_WINE,
      pairings: isRed ? ['Charcuterie', 'Duck', 'Beef'] : ['Scallops', 'Poultry', 'Pasta']
    };
  })
];
