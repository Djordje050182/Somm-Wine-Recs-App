# Somm — production plan

The path from "impressive demo" to a live product on a real domain with a
database behind it, with the right model doing the right job at the right
price. ElevenLabs Agents was the fastest way to get a talking sommelier;
it is not automatically the endgame for every AI job in the product.

## Guiding rule

**Right model for the job, and no model at all where code will do.**
Recommendations, routing, filtering and pricing are deterministic — data
problems, not AI problems. AI is for conversation, vision and language.

## The AI jobs, one by one

| Job | Today | Production choice | Why / cost |
|---|---|---|---|
| **Voice Somm** (live conversation) | ElevenLabs Agents (Claude Haiku brain, EL TTS, EL RAG) | **Keep ElevenLabs Agents for launch.** Revisit at ~3,000+ voice minutes/month | Best conversation latency/turn-taking for zero infra. ~$0.08–0.12/min all-in. Self-hosting the pipeline (LiveKit/Pipecat + Deepgram STT ~$0.004/min + Claude Haiku + Cartesia or EL Flash TTS ~$0.02–0.04/min) cuts per-minute cost roughly 60% but you own barge-in, latency and reliability. That trade only pays at volume. |
| **Text chat** ("Ask the Somm") | EL websocket in text mode | **Claude Haiku 4.5 via our own serverless proxy** (`api/` already built) | An exchange costs a fraction of a cent; no reason to route text through a voice product. Removes an EL dependency. |
| **Label scanner** | EL agent vision override (Gemini) | **Gemini 2.5 Flash or Claude Haiku vision, called directly from the proxy** | Pennies per hundred scans; direct call is simpler and faster than tunnelling through a conversation session. |
| **Concierge / trip planning** | Deterministic `sommPlanner` (+ Claude path when proxy live) | **Keep deterministic as default**; Claude Sonnet 4.5 only for messy free-text requests | The route-threading is code and should stay code. LLM adds taste, not maths. |
| **Knowledge/RAG** | EL knowledge base + EL RAG index | While on EL Agents: keep. If self-hosting voice later: **pgvector in Supabase** + a cheap embedding model | The KB generator (`scripts/generate-kb.mts`) already produces the corpus either way. |
| **Guest memory** | `services/tasteProfile.ts` → `guest_profile` dynamic variable | Same, synced via Supabase | No model needed. The Somm "remembers" via a one-line profile in the prompt. |
| **Research/content pipeline** | Claude (this workflow) with verify-everything rules | Same | Editorial stays human-standard: every fact traced or dropped. |

**Cost picture at friends-testing scale (≈50 users, light voice use):**
EL Agents ~$5–20/mo of minutes, LLM proxy <$5/mo, everything else $0.
**At ~1,000 MAU:** voice becomes the only line that matters (~$150–400/mo
depending on adoption) — that is the moment to price the self-hosted
pipeline against it.

## The platform

| Layer | Choice | Notes |
|---|---|---|
| Hosting | **Vercel** (already deploying) | Serverless functions for the AI proxy live in `api/`. GitHub Pages becomes staging or is retired. |
| Domain | e.g. `somm.wine`, `getsomm.app`, `drinksomm.com.au` | Point at Vercel; set `VITE_SITE_ORIGIN` so canonicals/sitemap move to the real domain in one env var. |
| Database & auth | **Supabase** (free tier → Pro $25/mo) | Postgres + row-level security + social sign-in + storage for portal photo uploads + pgvector later. Schema ready in `supabase/schema.sql`. |
| Sync model | Offline-first localStorage, mirrored per-user via `services/cloudSync.ts` | App works signed-out forever; sign-in adds cross-device memory. Zero feature rewrites. |
| Payments (portal tiers) | Stripe via the existing `services/commerce` seam | Only when a real winery wants to pay. |
| Bookings | Deep-link handoff today (`services/booking.ts`) → provider APIs (SevenRooms/Rezdy/NowBookIt) under partnership | The commercial conversation, not just code. |

## Rollout phases

1. **Now — friends test (zero new cost).** Current stack. Share the GitHub
   Pages or Vercel URL. Collect feedback; the build stamp in the footer
   tells you who's on a stale version.
2. **Phase 1 — real site.** Buy domain → Vercel. Create Supabase project →
   run `supabase/schema.sql` → set `VITE_SUPABASE_URL` + anon key + add
   `@supabase/supabase-js` → swap demo sign-in for Supabase auth →
   cloudSync lights up. Set `VITE_AI_PROXY_URL` → text chat and scanner
   move off ElevenLabs onto Haiku/Gemini direct.
3. **Phase 2 — money.** Stripe on portal tiers; booking API partnerships;
   winery analytics emails.
4. **Phase 3 — scale calls.** If voice minutes justify it, self-host the
   voice pipeline; move RAG to pgvector; add regions at cadence.

## Keys DJ holds / needs

- ElevenLabs API key (have) · Anthropic API key for proxy (have)
- Domain registrar, Supabase account, Stripe account (Phase 1–2)
- Google Search Console: verify site + submit `sitemap.xml` (do now)
