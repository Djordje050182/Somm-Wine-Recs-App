# Somm — Redesign Brief

*For the design agent. This repo is the live product; everything referenced here exists in it. Read real files rather than inventing content — every estate, wine, rating and photo mentioned below is real and verified.*

---

## What Somm is

A wine-region travel companion. Pick a region (Hunter Valley, Margaret River, Barossa Valley — more coming), browse its cellar doors like a well-edited guidebook, talk to "the Somm" — a voice AI sommelier who recommends, plans routed days and opens bookings — and walk out with a day plan. Live at https://djordje050182.github.io/Somm-Wine-Recs-App/.

**Audience:** couples and small groups planning wine trips; ranges from first-timers to serious drinkers. Mobile-first — they use it standing in a vineyard with one hand holding a glass.

**The product's soul (non-negotiable, carries into any redesign):**
- **Honesty is the brand.** Every photo comes from the venue's own site and is visually verified. Every rating is harvested (Google, Vivino), never invented. Venues that can't be verified are dropped. The design must feel like it was written by a person who has actually been to these places.
- **Editorial voice.** Copy reads like a trusted friend who knows the valley — "walked, tasted and argued over" — not like a booking platform. The design should give the writing room to breathe.
- **Voice-first.** "Talk to the Somm" is the hero action, not a chatbot bolted on.

## Current design (what you're replacing)

Editorial serif look: claret `#5E1A26`, parchment/paper neutrals `#F5F0E6`-ish, brass `#96742E`, ink `#211A16`. Display serif headlines, sans UI labels with letterspaced kickers, hairline borders, flat panels. It's decent but safe — the client wants a genuinely new look and feel, designed to world-class standard.

**Keep (as principles, not pixels):** the editorial confidence, long-form estate stories as first-class content, restrained colour discipline, real photography given prominence, the mobile bottom nav with a central mic action.

**Open to change:** everything visual — type system, palette, layout language, card design, navigation patterns, motion. Do not feel bound by the current claret/parchment scheme.

## Hard constraints

1. **Never the generic-AI aesthetic.** No purple gradients, no glassmorphism, no emoji in UI, no dark-mystical-tech look. This must look like it came from a world-class independent studio working for a wine client — model it on real-world reference sites (e.g. Noble Rot magazine, Berry Bros. & Rudd, 67 Pall Mall, Monocle's travel guides), not on other AI products.
2. **Mobile-first.** Design at 390px first; desktop is the adaptation. The region-switcher, filters and modals must work one-handed.
3. **Photography is hotlinked from venues' own sites** — mixed aspect ratios, mixed quality, cannot be art-directed. The system must flatter imperfect real photos (crops, overlays, frames) rather than assume perfect assets.
4. **Data density varies honestly.** Some estates have galleries, films, visitor summaries and 3 rated wines; others have one photo and a story. Cards and detail layouts must degrade gracefully without looking broken — absence of data is honest, not a bug.
5. **Long-form text matters.** Estate stories run 80–120 words; briefings have three labelled parts (icebreaker / pro move / hidden gem); somm notes are one-liners with personality. Typography must make these a pleasure, not an afterthought.

## Screen inventory (design the starred ones first)

- ★ **Region home** — hero, "Talk to the Somm" CTA, today-in-the-valley strip (live weather), curated rails ("For your palate"), region switcher (3 live + 2 coming-soon regions).
- ★ **Guide directory** — 28–55 estate cards per region; search; subregion filter chips; tabs: Wineries / Experiences / What's on / The land.
- ★ **Estate detail** — hero photo, open-now status (timezone-aware), Google + Vivino ratings, "The story", the three-part briefing, wines with scores, gallery + lightbox, "In motion" film embed, "What visitors say" summary, honest booking handoff (date/party picker → estate's own booking page; "Somm never takes a commission").
- **The land** (region explorer) — variety-mix chart, ranked vintage list ("the ones to hunt"), seasons, terroir story, Acknowledgement of Country.
- **Plan** — day-run builder threaded on a map, shareable memento runs.
- **Wines** — bottle directory with real Vivino scores; label scanner.
- **Voice Somm** — full-screen live conversation UI.
- **Cellar** (account) — tasting book, favourites. **Portal** — winery self-service uploads.

## Real content to design with (use these, don't invent)

Region strapline: *"Old-vine Shiraz and Lutheran bakeries — Australia's grandest red wine country."* (Barossa)

Estate card samples:
- **Rockford Wines** — Tanunda · est. 1984 · Google 4.8 (615). "Robert O'Callaghan's stone-barn winery makes cult Basket Press Shiraz on lovingly restored 19th-century equipment, and the cellar door still says OPEN off the side of a 1950s Bedford truck."
- **Chateau Yaldara** — Lyndoch & Williamstown · est. 1947 · Google 4.9 (1,875). "Hermann Thumm arrived in 1947 with little but determination and built a European château from salvaged stone and second-hand machinery."
- **Tscharke Wines** — Marananga & Seppeltsfield · est. 2001 · Google 4.9 (232). Underground cellar door; wines literally named "Shiraz Shiraz Shiraz".
- **Hentley Farm** — est. 1997 · Google 4.8 (512) · booking essential · degustation in 1880s stables.

Briefing sample (Rockford): icebreaker *"Everything here is made on restored 19th-century machinery — the basket presses aren't museum pieces, they press every vintage."* / pro move *"Groups max out at six and the good stuff pours for those who linger; come as a pair, not a bus."* / hidden gem *"Ask about the Stonewall lunches — long-table affairs in the winery yard that locals plan birthdays around."*

Somm note sample: *"Basket Press is the icon, but if they'll pour you the sparkling Black Shiraz, cancel your afternoon. The waiting list exists for a reason."*

Wine row sample: **Basket Press Shiraz** · Shiraz · 2021 · $85 · Vivino 4.5 (14,483) — *"The cult classic pressed on 19th-century machinery — deep, savoury, old-school Barossa Shiraz that ages like a promise kept."*

Vintage list sample (ranked): 1. **2012** — Exceptional 97/100 · 2. **2021** — Exceptional 96/100 · 3. **2018** — Exceptional 96/100 …with one-line notes each.

Real hero/venue images (hotlink, mixed ratios — treat as found photography):
- https://images.unsplash.com/photo-1652397144274-1923a97f4f1a (Seppeltsfield palm avenue — region hero)
- https://seppeltsfield.com.au/wp-content/uploads/village-hero.jpg (estate aerial)
- https://turkeyflat.com.au/cdn/shop/files/cellar-door-1.webp?crop=center&height=1200&width=800 (bluestone cellar door)
- https://torbreck.com/cdn/shop/files/hillside-cellar-barossa-valley-wine-tasting-tours.jpg?width=1600 (stone barn)
- https://www.bethany.com.au/cdn/shop/files/Dragan2-original.jpg (vineyard sunset)

Acknowledgement (renders in footer, treat respectfully): *"Somm acknowledges the Ngadjuri, Peramangk and Kaurna peoples, Traditional Custodians of the Barossa — a meeting place of three nations, as Nuriootpa's own name records — and pays respect to Elders past and present."*

Full data lives in this repo: `data/regions/<id>/` (region.ts, wineries-*.ts, wines-*.ts, experiences-full.ts, events.ts). Current components in `components/` and `features/`. Current tokens in the Tailwind config.

## What to deliver

1. **Three distinct art directions** as region-home concepts (390px) — e.g. one "modern wine magazine", one "luxury cellar-door minimal", one wildcard. Real content from above, no lorem ipsum. Name each direction.
2. After one is chosen: **the three starred screens** in that direction, mobile first, then desktop region home.
3. **A design-token sheet** for the chosen direction: palette, type scale + faces, spacing, radius, elevation, card anatomy, chip/filter states, rating-display treatment — structured so it can be translated into a Tailwind config.
4. State coverage: open/closed status, booking-required badge, data-sparse estate card (one photo, no ratings), coming-soon region row, loading/fallback for a dead image.

Judge every screen against: "would a discerning wine-world client sign this off from a top studio?" If a screen would look at home in a generic SaaS template, it fails.
