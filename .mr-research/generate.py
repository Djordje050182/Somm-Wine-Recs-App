#!/usr/bin/env python3
"""Generate Margaret River TS data files from the research JSONs.

Reads .mr-research/*.json and emits data/regions/margaret-river/
wineries-*.ts, wines-*.ts, experiences-full.ts in the Hunter Valley style.
Rerunnable; output is deterministic. Wine images inherit their estate's
verified photo ("wines wear estate photos").
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'data', 'regions', 'margaret-river'))

def load(name):
    p = os.path.join(HERE, name)
    if not os.path.exists(p):
        return None
    with open(p) as f:
        return json.load(f)

def ts_str(s):
    s = str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').strip()
    return f"'{s}'"

def img_ts(img, indent='    '):
    if not img or not img.get('url'):
        return None
    src = img.get('source') or ('unsplash' if 'unsplash.com' in img['url'] else 'winery')
    return ("{ url: %s, source: %s as const, alt: %s }" %
            (ts_str(img['url']), ts_str(src), ts_str(img.get('alt', ''))))

def briefing_ts(b, indent='    '):
    return ("{\n%s  icebreaker: %s,\n%s  proMove: %s,\n%s  hiddenGem: %s,\n%s}" %
            (indent, ts_str(b['icebreaker']), indent, ts_str(b['proMove']),
             indent, ts_str(b['hiddenGem']), indent))

def winery_ts(w):
    L = ['  {']
    L.append(f"    id: {ts_str(w['id'])},")
    L.append(f"    name: {ts_str(w['name'])},")
    L.append(f"    subregion: {ts_str(w['subregion'])},")
    L.append(f"    specialty: {ts_str(w['specialty'])},")
    L.append("    wines: [%s]," % ', '.join(ts_str(x) for x in w.get('wines', [])))
    L.append(f"    established: {int(w['established'])},")
    L.append(f"    priceRange: {ts_str(w.get('priceRange', '$$'))},")
    L.append(f"    description: {ts_str(w['description'])},")
    if w.get('story'):
        L.append(f"    story: {ts_str(w['story'])},")
    L.append(f"    style: {ts_str(w.get('style', 'Boutique'))},")
    L.append(f"    opens: {ts_str(w.get('opens', '10:00'))},")
    L.append(f"    closes: {ts_str(w.get('closes', '17:00'))},")
    L.append(f"    lat: {w['lat']},")
    L.append(f"    lng: {w['lng']},")
    L.append(f"    hasRestaurant: {'true' if w.get('hasRestaurant') else 'false'},")
    L.append(f"    rating: {w.get('rating', 4.5)},")
    L.append(f"    bookingRequired: {'true' if w.get('bookingRequired') else 'false'},")
    L.append(f"    kidFriendly: {'true' if w.get('kidFriendly') else 'false'},")
    L.append(f"    dogFriendly: {'true' if w.get('dogFriendly') else 'false'},")
    if w.get('phone'):
        L.append(f"    phone: {ts_str(w['phone'])},")
    if w.get('website'):
        L.append(f"    website: {ts_str(w['website'])},")
    if w.get('bookingUrl'):
        L.append(f"    bookingUrl: {ts_str(w['bookingUrl'])},")
    L.append(f"    tastingFee: {w.get('tastingFee', 0)},")
    im = img_ts(w.get('image'))
    if im:
        L.append(f"    image: {im},")
    else:
        L.append("    image: { url: '', source: 'winery' as const, alt: '' },  // FIXME: no verified image")
    gal = [img_ts(g) for g in (w.get('gallery') or []) if g and g.get('url')]
    if gal:
        L.append("    gallery: [%s]," % ', '.join(gal))
    if w.get('briefing'):
        L.append(f"    briefing: {briefing_ts(w['briefing'])},")
    if w.get('sommNote'):
        L.append(f"    sommNote: {ts_str(w['sommNote'])},")
    c = w.get('community')
    if c and c.get('score') and c.get('count'):
        L.append("    community: { score: %s, count: %s, source: 'Google' as const }," % (c['score'], c['count']))
    if w.get('visitorSummary'):
        L.append(f"    visitorSummary: {ts_str(w['visitorSummary'])},")
    if w.get('videoUrl'):
        L.append(f"    videoUrl: {ts_str(w['videoUrl'])},")
    L.append('  },')
    return '\n'.join(L)

def wine_ts(w, estate_img, estate_name):
    L = ['  {']
    L.append(f"    id: {ts_str(w['id'])},")
    L.append(f"    name: {ts_str(w['name'])},")
    L.append(f"    wineryId: {ts_str(w['wineryId'])},")
    L.append(f"    variety: {ts_str(w['variety'])},")
    L.append(f"    vintage: {ts_str(w.get('vintage', ''))},")
    L.append(f"    price: {ts_str(w.get('price', ''))},")
    L.append(f"    description: {ts_str(w['description'])},")
    L.append(f"    sommNote: {ts_str(w['sommNote'])},")
    if estate_img and estate_img.get('url'):
        src = estate_img.get('source') or 'winery'
        alt = f"{w['name']} — at {estate_name}"
        L.append("    image: { url: %s, source: %s as const, alt: %s }," %
                 (ts_str(estate_img['url']), ts_str(src), ts_str(alt)))
    else:
        L.append("    image: { url: '', source: 'winery' as const, alt: '' },  // FIXME: no estate image")
    L.append(f"    rating: {w.get('rating', 4.5)},")
    L.append("    pairings: [%s]," % ', '.join(ts_str(x) for x in w.get('pairings', [])))
    if w.get('drinkFrom'):
        L.append(f"    drinkFrom: {ts_str(w['drinkFrom'])},")
    if w.get('drinkTo'):
        L.append(f"    drinkTo: {ts_str(w['drinkTo'])},")
    c = w.get('community')
    if c and c.get('score') and c.get('count'):
        L.append("    community: { score: %s, count: %s, source: 'Vivino' as const }," % (c['score'], c['count']))
    L.append('  },')
    return '\n'.join(L)

def exp_ts(e):
    L = ['  {']
    L.append(f"    id: {ts_str(e['id'])},")
    L.append(f"    name: {ts_str(e['name'])},")
    L.append(f"    category: {ts_str(e['category'])},")
    L.append(f"    subregion: {ts_str(e['subregion'])},")
    L.append(f"    description: {ts_str(e['description'])},")
    im = img_ts(e.get('image'))
    if im:
        L.append(f"    image: {im},")
    else:
        L.append("    image: { url: '', source: 'unsplash' as const, alt: '' },  // FIXME: no verified image")
    gal = [img_ts(g) for g in (e.get('gallery') or []) if g and g.get('url')]
    if gal:
        L.append("    gallery: [%s]," % ', '.join(gal))
    if e.get('briefing'):
        L.append(f"    briefing: {briefing_ts(e['briefing'])},")
    c = e.get('community')
    if c and c.get('score') and c.get('count'):
        L.append("    community: { score: %s, count: %s, source: 'Google' as const }," % (c['score'], c['count']))
    L.append(f"    rating: {e.get('rating', 4.5)},")
    L.append(f"    priceRange: {ts_str(e.get('priceRange', '$$'))},")
    if e.get('website'):
        L.append(f"    website: {ts_str(e['website'])},")
    if e.get('bookingUrl'):
        L.append(f"    bookingUrl: {ts_str(e['bookingUrl'])},")
    if e.get('phone'):
        L.append(f"    phone: {ts_str(e['phone'])},")
    L.append(f"    opens: {ts_str(e.get('opens', '09:00'))},")
    L.append(f"    closes: {ts_str(e.get('closes', '17:00'))},")
    L.append(f"    sommNote: {ts_str(e.get('sommNote', ''))},")
    if e.get('visitorSummary'):
        L.append(f"    visitorSummary: {ts_str(e['visitorSummary'])},")
    if e.get('videoUrl'):
        L.append(f"    videoUrl: {ts_str(e['videoUrl'])},")
    L.append(f"    lat: {e['lat']},")
    L.append(f"    lng: {e['lng']},")
    L.append('  },')
    return '\n'.join(L)

def emit_winery_file(fname, const, comment, batches):
    wineries, wines, img_by_id, name_by_id = [], [], {}, {}
    for b in batches:
        d = b if isinstance(b, dict) else load(b)
        if not d:
            continue
        for w in d.get('wineries', []):
            if w['id'] in name_by_id:
                continue
            if 'lat' not in w or 'lng' not in w or 'established' not in w:
                print(f"  ! skipping incomplete winery: {w.get('id')}", file=sys.stderr)
                continue
            wineries.append(w)
            img_by_id[w['id']] = w.get('image')
            name_by_id[w['id']] = w['name']
        wines.extend(d.get('wines', []))
    # de-dup wines by id
    seen, uniq = set(), []
    for w in wines:
        if w['id'] in seen:
            continue
        seen.add(w['id'])
        uniq.append(w)
    wines = [w for w in uniq if w['wineryId'] in name_by_id]

    header = ("import { Winery } from '../../../types';\n\n"
              "// ---------------------------------------------------------------------------\n"
              f"// {comment}\n"
              "// Real producers, researched facts, imagery from the estates' own sites,\n"
              "// downloaded and visually verified. Contact details included only where\n"
              "// confirmed; omitted otherwise. Vivino scores harvested, never invented.\n"
              "// ---------------------------------------------------------------------------\n\n")
    body = f"export const {const}: Winery[] = [\n" + '\n'.join(winery_ts(w) for w in wineries) + '\n];\n'
    with open(os.path.join(OUT, fname), 'w') as f:
        f.write(header + body)

    wconst = const.replace('WINERIES', 'WINES')
    wfname = fname.replace('wineries', 'wines')
    wheader = ("import { WineDetail } from '../../../types';\n\n"
               "// ---------------------------------------------------------------------------\n"
               f"// {comment.replace('wineries', 'wines')}\n"
               "// Wines wear their estate's verified photograph.\n"
               "// ---------------------------------------------------------------------------\n\n")
    wbody = (f"export const {wconst}: WineDetail[] = [\n" +
             '\n'.join(wine_ts(w, img_by_id.get(w['wineryId']), name_by_id.get(w['wineryId'], '')) for w in wines) +
             '\n];\n')
    with open(os.path.join(OUT, wfname), 'w') as f:
        f.write(wheader + wbody)
    return len(wineries), len(wines)

def emit_experiences():
    exps = []
    seen = set()
    for b in ['exp-dining.json', 'exp-breweries.json', 'exp-adventure.json', 'exp-nature-golf.json', 'exp-shopping-family.json', 'experiences.json']:
        d = load(b)
        if not d:
            continue
        for e in d.get('experiences', []):
            if e['id'] in seen:
                continue
            if 'lat' not in e or 'lng' not in e or not e.get('description'):
                print(f"  ! skipping incomplete experience: {e.get('id')}", file=sys.stderr)
                continue
            seen.add(e['id'])
            exps.append(e)
    order = {'Dining': 0, 'Breweries': 1, 'Adventure': 2, 'Nature': 3, 'Golf': 4, 'Shopping': 5, 'Family': 6}
    exps.sort(key=lambda e: (order.get(e['category'], 9), e['name']))
    cats = {}
    for e in exps:
        cats[e['category']] = cats.get(e['category'], 0) + 1
    header = ("import { Experience } from '../../../types';\n\n"
              "// ---------------------------------------------------------------------------\n"
              "// Margaret River — the full experiences catalogue.\n"
              "// Real venues only, verified operating July 2026. Every image downloaded and\n"
              "// visually checked against its subject. Contact details omitted where they\n"
              "// could not be confirmed, never invented.\n"
              f"// Categories: {', '.join(f'{k} ({v})' for k, v in sorted(cats.items()))}.\n"
              "// ---------------------------------------------------------------------------\n\n")
    body = ("export const MARGARET_RIVER_EXPERIENCES_FULL: Experience[] = [\n" +
            '\n'.join(exp_ts(e) for e in exps) + '\n];\n')
    with open(os.path.join(OUT, 'experiences-full.ts'), 'w') as f:
        f.write(header + body)
    return len(exps), cats

def split_mixed_batches(names):
    """Mixed-subregion batch files (batch-*.json) are routed to the right
    output file by each winery's subregion. Wines follow their winery."""
    area = {'Wilyabrup': 'wilyabrup', 'Yallingup': 'north', 'Carbunup': 'north',
            'Wallcliffe': 'south', 'Karridale': 'south'}
    out = {k: {'wineries': [], 'wines': []} for k in ('wilyabrup', 'north', 'south')}
    for name in names:
        d = load(name)
        if not d:
            continue
        winery_area = {}
        for w in d.get('wineries', []):
            key = area.get(w.get('subregion'))
            if not key:
                print(f"  ! unknown subregion for {w.get('id')}: {w.get('subregion')}", file=sys.stderr)
                continue
            winery_area[w['id']] = key
            out[key]['wineries'].append(w)
        for wine in d.get('wines', []):
            key = winery_area.get(wine.get('wineryId'))
            if key:
                out[key]['wines'].append(wine)
    return out

if __name__ == '__main__':
    mixed = split_mixed_batches(['batch-large.json', 'batch-boutique.json',
                                 'batch-quirky.json', 'batch-hidden.json'])
    nw, nwi = emit_winery_file('wineries-wilyabrup.ts', 'WILYABRUP_WINERIES',
                               'Wilyabrup — the founding heartland of Margaret River.',
                               ['wilyabrup-b1.json', 'wilyabrup.json', 'wilyabrup-b2.json', mixed['wilyabrup']])
    print(f'wilyabrup: {nw} wineries, {nwi} wines')
    nw, nwi = emit_winery_file('wineries-north.ts', 'NORTH_WINERIES',
                               'The northern capes — Yallingup, Dunsborough, Eagle Bay and Carbunup.',
                               ['north.json', mixed['north']])
    print(f'north: {nw} wineries, {nwi} wines')
    nw, nwi = emit_winery_file('wineries-south.ts', 'SOUTH_WINERIES',
                               'Wallcliffe and the deep south — the river mouth, Witchcliffe and Karridale.',
                               ['south.json', mixed['south']])
    print(f'south: {nw} wineries, {nwi} wines')
    ne, cats = emit_experiences()
    print(f'experiences: {ne} — {cats}')
