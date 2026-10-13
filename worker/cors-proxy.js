// Optional Cloudflare Worker: forwards requests to the Up API and adds CORS headers.
// It does not store anything; the Authorization header is passed straight through.
// Set ALLOWED_ORIGIN below to your GitHub Pages origin, e.g. https://richardgg.github.io
const ALLOWED_ORIGIN = 'https://richardgg.github.io';

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: cors });

    const url = new URL(request.url);
    const upstream = await fetch('https://api.up.com.au' + url.pathname + url.search, {
      headers: { Authorization: request.headers.get('Authorization') || '' },
    });
    const body = (await upstream.text()).replaceAll('https://api.up.com.au', url.origin);
    return new Response(body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
    });
  },
};
