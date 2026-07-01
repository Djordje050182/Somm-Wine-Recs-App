# Somm — Design System & Voice

The reference points are Noble Rot's confidence, Cereal magazine's restraint and
Mr Porter's typographic discipline. Wine-country editorial, not tech product.
Nothing may look "AI-app generic": **no purple, no glassmorphism, no emoji,
no gradient blobs, no pill-shaped everything, no badge-speak.**

## Type

- `font-display` — **Fraunces** (serif). Headlines, numbers that matter, the wordmark.
  Weights 300–900, italics allowed for editorial flourish.
- `font-body` — **Newsreader** (serif). Long-form copy: descriptions, tasting notes, stories.
- `font-ui` — **Archivo** (grotesque). Buttons, labels, nav, metadata, form fields.
- The house idiom: a small-caps kicker (`.kicker` class or `<Kicker>`) above a Fraunces
  headline. Kickers are 11px, uppercase, letter-spaced, brass.

## Palette (Tailwind tokens)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#211A16` | text, dark blocks, footer |
| `parchment` | `#F6F1E7` | page background |
| `paper` | `#FFFDF8` | card background |
| `claret` | `#5E1A26` | primary brand: links, active nav, filled buttons |
| `claret-deep` | `#40111B` | hover/pressed |
| `brass` | `#96742E` | kickers, prices, accents |
| `brass-soft` | `#B79A5B` | subtle brass on dark |
| `vine` | `#4A5D3A` | success, "open now", availability |
| `hairline` | `#E2D9C8` | ALL borders and rules, 1px |
| `terracotta` | `#B4552D` | sparse highlight: sale tags, alerts |

Never use tailwind grays (`gray-*`) for text on parchment — use `ink` with opacity
(`text-ink/60`, `text-ink/40`). Never use pure white or pure black.

## Shape & surface

- Cards: `bg-paper border border-hairline` with radius `rounded-sm` (2px) or none.
  **Kill `rounded-xl/2xl/3xl/full` on cards, inputs and buttons.**
- Buttons: rectangles, `rounded-sm`. Primary = `bg-claret text-parchment hover:bg-claret-deep`.
  Secondary = `border border-ink/20 text-ink hover:border-ink`. UI font, tracking-wide,
  text-xs/sm, uppercase for small buttons.
- Avatars/dots may stay round. Nothing else.
- Section separation: thin `border-hairline` rules (the wine-list idiom), generous whitespace.
- Images: edge-to-edge in their card, no inner padding, subtle `bg-ink/5` while loading.
- No `shadow-xl`/`shadow-2xl` glamour shadows. `shadow-sm` at most, prefer borders.
- Header/nav: solid parchment + hairline border. **No backdrop-blur.**
- recharts: use claret/brass/vine/ink only, hairline gridlines, Archivo tick labels.

## Voice (British English, always)

The narrator is *the Somm* — a trusted insider with wit and taste, never a
"powered by AI" feature badge. The register: confident, aspirational, a little
whimsical. Like the best bits of a good wine list.

- Banned: "AI-Powered", "VinoAI", "The Future of Taste", "Intelligent", "Smart",
  "Revolutionary", "Experience wine like never before", all emoji, exclamation-mark enthusiasm.
- Renames in force:
  - "AI Sommelier" → **"The Somm"** (nav: "Sommelier")
  - "VinoAI Tip" / "Insider Tidbit" → **"The Somm's note"**
  - "Sommelier's Forecast" → **"Today in the valley"**
  - "Intelligent Trips" → **"Plan the perfect run"**
  - "Added to Cellar" toast → **"In your case"**
  - Cart title: **"Your case"** (cellar = the user's saved collection, case = shopping)
- Empty states are invitations, not apologies: "Nothing here yet. The valley awaits."
- AI features are presented as a person: "Ask the Somm", "The Somm suggests…".
- Sentence case for headings (not Title Case), full sentences in body copy.

## Layout

- Max width `max-w-screen-xl`, generous vertical rhythm (`py-12`+ between sections).
- Mobile-first; bottom nav on mobile, top nav on desktop.
- Section headers: Kicker + Fraunces h2 + optional one-line Newsreader standfirst.

## Shared primitives (components/ui/index.tsx)

`<Kicker>`, `<SectionHeading kicker title standfirst>`, `<Button variant="primary|secondary|ghost">`,
`<Card>`, `<Tag>`, `<Rule>`, `<EmptyState title body action>`. Use them; don't reinvent.
`<ImageWithLoader asset={ImageAsset}>` for all imagery (handles alt + credit).
