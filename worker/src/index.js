const ALLOWED_ORIGINS = [
  'https://djordje050182.github.io',
  'http://localhost:3000',
  'http://localhost:4173',
];

// Only the models the app actually uses may pass through the proxy.
const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5'];
const MAX_TOKENS_CAP = 4000;
const MAX_BODY_BYTES = 6 * 1024 * 1024; // label scans send a base64 photo

// Per-IP sliding-window rate limit. In-memory per isolate — resets when the
// isolate recycles, which is fine as a first gate against casual abuse.
const RATE_LIMIT = { windowMs: 5 * 60 * 1000, maxRequests: 20 };
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  const timestamps = (hits.get(ip) || []).filter(t => t > windowStart);
  if (timestamps.length >= RATE_LIMIT.maxRequests) {
    hits.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  // keep the map from growing unbounded
  if (hits.size > 5000) {
    for (const [key, val] of hits) {
      if (val.every(t => t <= windowStart)) hits.delete(key);
    }
  }
  return false;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Browsers send Origin on cross-site POSTs; anything else is not the app.
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Origin not allowed.' }, 403, origin);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip)) {
      return json({ error: 'The Somm needs a breather — try again in a few minutes.' }, 429, origin);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: 'Request too large.' }, 413, origin);
    }

    // Future Stripe Checkout endpoint. The client's stripePaymentProvider will
    // POST { lines: [{description, unitAmount, quantity, ref}], currency,
    // customerEmail, mode: 'payment' | 'subscription', tierId? } and expect
    // { url } — a Stripe Checkout Session URL created server-side with
    // env.STRIPE_SECRET_KEY. Not yet implemented.
    if (url.pathname === '/checkout') {
      return json(
        { error: 'Checkout is not live yet — the app runs demonstration payments client-side.' },
        501,
        origin
      );
    }

    // Default: proxy to the Claude Messages API (path '/' or '/ai').
    try {
      const body = await request.json();

      if (!ALLOWED_MODELS.includes(body.model)) {
        return json({ error: 'Model not allowed.' }, 400, origin);
      }
      body.max_tokens = Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP);
      // The client only ever sends these fields; drop anything else.
      const forward = {
        model: body.model,
        max_tokens: body.max_tokens,
        system: body.system,
        messages: body.messages,
      };

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(forward),
      });

      const data = await res.json();
      return json(data, res.status, origin);
    } catch (err) {
      return json({ error: err.message }, 500, origin);
    }
  },
};
