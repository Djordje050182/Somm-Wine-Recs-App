// Generate the Somm's knowledge-base document for a region, in the same
// format as the Hunter Valley doc the voice agent already carries.
//
//   ./node_modules/.bin/esbuild scripts/generate-kb.mts --bundle --format=esm \
//     --platform=node --outfile=<out>.mjs && node <out>.mjs <region-id> > kb.md
//
// The output is uploaded to ElevenLabs as a text knowledge-base document and
// attached to the agent — one document per region.

import { REGION_REGISTRY } from '../data/regions';
import { RegionData, Winery, WineDetail, Experience } from '../types';

const regionId = process.argv[2];
const data: RegionData | undefined = REGION_REGISTRY[regionId];
if (!data) {
  console.error(`Unknown region '${regionId}'. Known: ${Object.keys(REGION_REGISTRY).join(', ')}`);
  process.exit(1);
}

const { region, wineries, wines, experiences } = data;

const wineLine = (w: WineDetail): string => {
  const parts = [
    `- WINE: ${w.name} (${w.vintage} ${w.variety}, ${w.price}, rated ${w.rating}).`,
    w.description,
    w.sommNote,
    w.pairings?.length ? `Pairs with: ${w.pairings.join(', ')}.` : '',
    w.drinkFrom && w.drinkTo ? `Drink ${w.drinkFrom}–${w.drinkTo}.` : '',
  ];
  return parts.filter(Boolean).join(' ');
};

const estateEntry = (e: Winery): string => {
  const lines = [
    `### ${e.name} (${e.subregion})`,
    `Established ${e.established}. Specialty: ${e.specialty}. Style: ${e.style}. Rating ${e.rating}/5.`,
    e.description,
    e.story ?? '',
    e.sommNote ? `Somm's note: ${e.sommNote}` : '',
    e.community ? `Google rating: ${e.community.score} from ${e.community.count} reviews.` : '',
    e.visitorSummary ? `What visitors say: ${e.visitorSummary}` : '',
    `Cellar door: ${e.opens}–${e.closes}. Tasting fee: $${e.tastingFee}.${e.bookingRequired ? ' Booking required.' : ''}`,
    [e.phone, e.website].filter(Boolean).length
      ? `Contact: ${[e.phone, e.website].filter(Boolean).join(' · ')}`
      : '',
    ...wines.filter(w => w.wineryId === e.id).map(wineLine),
  ];
  return lines.filter(Boolean).join('\n');
};

const experienceLine = (x: Experience): string =>
  `- ${x.name} (${x.category}, ${x.subregion}): ${[x.description, x.sommNote].filter(Boolean).join(' ')} Hours ${x.opens}–${x.closes}, price ${x.priceRange}.`;

const doc = [
  `# ${region.name} — the Somm's working knowledge`,
  '',
  region.strapline,
  '',
  '## The region',
  `- Where: ${region.state}, ${region.country}.`,
  `- Terroir: ${region.terroir.soils} ${region.terroir.climate}`,
  `- Story: ${region.terroir.story}`,
  `- Variety mix: ${region.varietyMix.map(v => `${v.name} ${v.value}%`).join(', ')}`,
  `- Vintages: ${region.vintages.map(v => `${v.year}: ${v.quality} (${v.rating}/100)${v.note ? ` — ${v.note}` : ''}`).join(' | ')}`,
  `- Seasons: ${region.seasons.map(s => `${s.name} (${s.range}, avg ${s.avgTemp}): ${s.description}`).join(' ')}`,
  `- Subregions: ${region.subregions.map(s => `${s.name} — ${s.blurb}`).join(' | ')}`,
  '',
  `## The estates (${wineries.length})`,
  '',
  wineries.map(estateEntry).join('\n\n'),
  '',
  `## Beyond the vines — experiences (${experiences.length})`,
  experiences.map(experienceLine).join('\n'),
].join('\n');

console.log(doc);
