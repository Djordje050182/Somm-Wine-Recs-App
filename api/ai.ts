// The Somm's Claude proxy as a Vercel serverless function — same origin as
// the site, so no CORS ceremony. Set ANTHROPIC_API_KEY in Vercel's project
// environment and VITE_AI_PROXY_URL=/api/ai, and every AI surface upgrades
// from its agent fallback to Claude automatically.
//
// Cost posture: callers choose from a small allowlist; Haiku is the workhorse
// (chat, scanner, concierge, pairings), Sonnet stays available for anything
// that earns it.

export const config = { maxDuration: 60 };

const ALLOWED_MODELS = ['claude-haiku-4-5', 'claude-sonnet-4-6'];
const DEFAULT_MODEL = 'claude-haiku-4-5';
const MAX_TOKENS_CAP = 4000;

// Per-instance sliding window; serverless instances recycle, which is fine
// as a first gate against casual abuse.
const RATE = { windowMs: 5 * 60 * 1000, max: 20 };
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => t > now - RATE.windowMs);
  if (list.length >= RATE.max) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || 'unknown').toString().split(',')[0];
  if (limited(ip)) {
    res.status(429).json({ error: 'The Somm needs a breather — try again in a few minutes.' });
    return;
  }

  const body = req.body ?? {};
  const model = ALLOWED_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP),
        system: body.system,
        messages: body.messages,
      }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'proxy error' });
  }
}
