import { Winery, Experience, Region } from '../types';

// The Somm drafts a trip from his own book — no cloud, no waiting. The
// catalogue already knows who suits kids, who cooks, who does the best reds;
// this module turns chips + free text into the same trip shape the Claude
// concierge returns, so the UI cannot tell them apart. When the AI proxy is
// live it takes over; this is the always-on floor.

export interface PlannerParams {
  days: number;
  group: string;
  vibe: string;
  style: string;
  budget: string;
}

interface TripActivity {
  time: string;
  activity: string;
  description: string;
  type: 'winery' | 'dining' | 'experience' | 'travel';
}

export interface DraftTrip {
  tripName: string;
  summary: string;
  stops: string[];
  days: { dayTitle: string; activities: TripActivity[] }[];
}

const wants = (text: string, ...words: string[]) => words.some(w => text.includes(w));

export function draftTrip(
  region: Region,
  params: PlannerParams,
  freeText: string,
  wineries: Winery[],
  experiences: Experience[]
): DraftTrip {
  const text = freeText.toLowerCase();

  // Free text sharpens the chips, never fights them
  const withKids = params.group.includes('Family') || params.group.includes('kids') || wants(text, 'kid', 'child', 'children', 'family');
  const withDog = wants(text, 'dog', 'pup');
  const style =
    wants(text, 'red', 'shiraz', 'cabernet') ? 'Reds'
    : wants(text, 'white', 'semillon', 'chardonnay', 'riesling') ? 'Whites'
    : wants(text, 'sparkling', 'bubbles', 'fizz') ? 'Sparkling'
    : params.style;
  const budget =
    wants(text, 'cheap', 'budget', 'save') ? 'Save'
    : wants(text, 'splurge', 'fancy', 'luxury', 'best of the best') ? 'Splurge'
    : params.budget;
  const wantsLunch = wants(text, 'lunch', 'eat', 'restaurant', 'food', 'table') || params.vibe === 'Foodie' || true;

  const styleMatch = (w: Winery) => {
    const spec = (w.specialty + ' ' + w.wines.join(' ')).toLowerCase();
    if (style === 'Reds') return spec.includes('shiraz') || spec.includes('cabernet') || spec.includes('red');
    if (style === 'Whites') return spec.includes('semillon') || spec.includes('chardonnay') || spec.includes('verdelho');
    if (style === 'Sparkling') return spec.includes('sparkling');
    return true;
  };
  const budgetMatch = (w: Winery) => {
    if (budget === 'Save') return w.tastingFee <= 10;
    if (budget === 'Splurge') return w.priceRange === '$$$' || w.tastingFee >= 20;
    return true;
  };

  // Score the field: style and budget are gates, then rating decides,
  // with a nudge for restaurants (lunch solves itself) and kid-friendliness.
  let field = wineries.filter(w => styleMatch(w) && budgetMatch(w));
  if (withKids) field = field.filter(w => w.kidFriendly);
  if (withDog) field = field.filter(w => w.dogFriendly);
  if (field.length < 3) field = wineries.filter(w => (withKids ? w.kidFriendly : true));
  if (field.length < 3) field = [...wineries];

  const ranked = [...field].sort(
    (a, b) => b.rating + (b.hasRestaurant ? 0.05 : 0) - (a.rating + (a.hasRestaurant ? 0.05 : 0))
  );

  const dining = [...experiences]
    .filter(e => e.category === 'Dining')
    .sort((a, b) => b.rating - a.rating);
  const outdoors = [...experiences]
    .filter(e => e.category === 'Nature' || e.category === 'Adventure' || (withKids && e.category === 'Family'))
    .sort((a, b) => b.rating - a.rating);

  // Day one: two or three estates and a proper lunch
  const dayOneEstates = ranked.slice(0, 3);
  const lunch = wantsLunch ? dining[0] : undefined;
  const stops: string[] = lunch
    ? [dayOneEstates[0]?.name, dayOneEstates[1]?.name, lunch.name, dayOneEstates[2]?.name].filter(Boolean) as string[]
    : (dayOneEstates.map(w => w.name) as string[]);

  const note = (w?: Winery) => w?.sommNote ?? w?.description ?? '';

  const days: DraftTrip['days'] = [];
  days.push({
    dayTitle: 'Day one — the proper introduction',
    activities: [
      dayOneEstates[0] && {
        time: '10:00',
        activity: `Tasting at ${dayOneEstates[0].name}`,
        description: note(dayOneEstates[0]),
        type: 'winery' as const,
      },
      dayOneEstates[1] && {
        time: '11:45',
        activity: `Tasting at ${dayOneEstates[1].name}`,
        description: note(dayOneEstates[1]),
        type: 'winery' as const,
      },
      lunch && {
        time: '13:15',
        activity: `Lunch at ${lunch.name}`,
        description: lunch.sommNote ?? lunch.description,
        type: 'dining' as const,
      },
      dayOneEstates[2] && {
        time: '15:00',
        activity: `Tasting at ${dayOneEstates[2].name}`,
        description: note(dayOneEstates[2]),
        type: 'winery' as const,
      },
    ].filter(Boolean) as TripActivity[],
  });

  // Further days: fresh estates, one thing beyond the vines
  for (let d = 1; d < Math.min(params.days, 3); d++) {
    const estates = ranked.slice(d * 3, d * 3 + 2);
    const beyond = outdoors[d - 1];
    days.push({
      dayTitle: d === 1 ? 'Day two — off the beaten rows' : 'Day three — the slow goodbye',
      activities: [
        beyond && {
          time: '09:30',
          activity: beyond.name,
          description: beyond.sommNote ?? beyond.description,
          type: 'experience' as const,
        },
        estates[0] && {
          time: '11:30',
          activity: `Tasting at ${estates[0].name}`,
          description: note(estates[0]),
          type: 'winery' as const,
        },
        dining[d] && {
          time: '13:30',
          activity: `Lunch at ${dining[d].name}`,
          description: dining[d].sommNote ?? dining[d].description,
          type: 'dining' as const,
        },
        estates[1] && {
          time: '15:15',
          activity: `Tasting at ${estates[1].name}`,
          description: note(estates[1]),
          type: 'winery' as const,
        },
      ].filter(Boolean) as TripActivity[],
    });
  }

  const styleWord =
    style === 'Reds' ? 'red-soaked' : style === 'Whites' ? 'white-wine' : style === 'Sparkling' ? 'sparkling' : 'well-balanced';
  const groupWord = withKids
    ? 'the whole family in tow'
    : params.group === 'Couple' ? 'just the two of you'
    : params.group === 'Solo' ? 'a glass entirely to yourself'
    : 'the group';

  return {
    tripName: `The ${styleWord} run through ${region.shortName}`,
    summary:
      `${params.days === 1 ? 'One day' : `${params.days} days`} in ${region.name} with ${groupWord}: ` +
      `${dayOneEstates.map(w => w.name).join(', ')}${lunch ? `, and a proper table at ${lunch.name}` : ''}. ` +
      `Drawn from the Somm's own book — every stop walked, tasted and argued over.`,
    stops,
    days,
  };
}
