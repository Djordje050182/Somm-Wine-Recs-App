# Somm.

**The world's great wine regions, walked properly.**

Somm is a wine-country companion app: find the estates worth your time, the
bottles worth your cellar and the tables worth booking — then let the Somm
(a Claude-powered master sommelier) plan the day, read a label through your
camera, or argue with you about Semillon.

The Hunter Valley is the founding region. The architecture is multi-region by
design: adding Barossa, Champagne or Tuscany is a data directory and one
registry line — no component changes.

## Architecture

```
React 19 + Vite + Tailwind (static SPA, GitHub Pages, hash routing)
        │
        ├── data/regions/<region-id>/     region config + wineries + wines + experiences
        │       └── data/regions/index.ts  REGION_REGISTRY — one line per region
        │
        ├── services/auth/                 AuthService interface
        │       └── localAuthService       demo impl (hashed, localStorage) — swap for Supabase
        │
        ├── services/commerce/             PaymentProvider interface + catalogue/cart/orders
        │       └── demoPaymentProvider    demo impl — swap for Stripe via worker /checkout
        │
        └── worker/                        Cloudflare Worker: Claude API proxy (key stays server-side)
```

- **Consumer side** — editorial home, region guide (wineries, experiences,
  what's on, terroir), shoppable wine library, route builder + AI concierge,
  Ask-the-Somm chat and label scanner, personal cellar, favourites, orders.
- **Winery side** — estates sign in to manage their listing, wines and special
  offers, and pay membership fees (Listed / Featured / Premier). Portal edits
  appear live on the consumer side through the catalogue merge layer.
- **Payments** — demonstration mode end to end (no card is ever charged). The
  `PaymentProvider` contract and the worker's `/checkout` stub define the seam
  where Stripe drops in.

## Adding a region

1. Copy `data/regions/hunter-valley/` to `data/regions/<new-region>/`.
2. Rewrite `region.ts` (identity, subregions, terroir, vintages, seasons,
   sommelier persona, weather) and author the wineries/wines/experiences files.
   IDs are region-prefixed slugs (`hv-tyrrells` → `bv-penfolds`).
3. Register it in `data/regions/index.ts`. Done — routing, the switcher, the
   guide, the Somm's prompts and the maps all follow the config.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

AI features need the proxy: copy `.env.example` to `.env.local` and set
`VITE_AI_PROXY_URL` to your deployed worker URL. Without it the app runs fine
with AI features disabled.

## Deploy

- **App** — push to `main`; GitHub Actions builds and publishes to GitHub Pages
  (`VITE_AI_PROXY_URL` comes from a repository secret).
- **Worker** — `cd worker && npx wrangler deploy`, with `ANTHROPIC_API_KEY` set
  as a Wrangler secret. The worker allow-lists the Pages origin.
