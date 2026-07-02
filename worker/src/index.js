const ALLOWED_ORIGINS = [
  'https://djordje050182.github.io',
  'http://localhost:3000',
  'http://localhost:4173',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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

    // Future Stripe Checkout endpoint. The client's stripePaymentProvider will
    // POST { lines: [{description, unitAmount, quantity, ref}], currency,
    // customerEmail, mode: 'payment' | 'subscription', tierId? } and expect
    // { url } — a Stripe Checkout Session URL created server-side with
    // env.STRIPE_SECRET_KEY. Not yet implemented.
    if (url.pathname === '/checkout') {
      return new Response(
        JSON.stringify({ error: 'Checkout is not live yet — the app runs demonstration payments client-side.' }),
        { status: 501, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    // Default: proxy to the Claude Messages API (path '/' or '/ai').
    try {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
  },
};
