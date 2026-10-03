/**
 * phx.beauty — Cloudflare Worker (free plan) serving static assets + tiny JSON APIs.
 * - GET  /api/health    -> { ok: true }
 * - POST /api/inquire   -> validates inquiry, returns { ok: true } (logs; wire KV/email later)
 * - POST /api/subscribe -> validates email capture, returns { ok: true }
 * - www -> apex 301, /index.html -> / 301
 * - All other requests -> static assets (Astro dist)
 *
 * No paid bindings. Compatible with Workers free plan.
 */

interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_ORIGIN = 'https://phx.beauty';

const CORS = {
  'Access-Control-Allow-Origin': 'https://phx.beauty',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

function isEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function getHost(request: Request, url: URL): string {
  const headerHost = request.headers.get('host');
  if (headerHost) {
    return headerHost.toLowerCase().replace(/:\d+$/, '');
  }
  return url.hostname.toLowerCase();
}

async function handleInquire(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  // Honeypot
  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return json({ ok: true }); // silently accept bots
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const useCase = typeof body.useCase === 'string' ? body.useCase.trim() : '';
  const offer = Number(body.offer);
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';

  if (name.length < 2) return json({ ok: false, error: 'Name required' }, 400);
  if (!isEmail(email)) return json({ ok: false, error: 'Valid email required' }, 400);
  if (!useCase) return json({ ok: false, error: 'Use case required' }, 400);
  if (!Number.isFinite(offer) || offer < 8000)
    return json({ ok: false, error: 'Minimum offer is $8,000' }, 400);

  // Free-plan: structured log (visible in wrangler tail). Upgrade later to KV/Queue/Email.
  console.log(
    JSON.stringify({ type: 'inquiry', domain: 'phx.beauty', name, email, useCase, offer, message, at: new Date().toISOString() }),
  );

  return json({ ok: true, message: 'Inquiry received. We reply within 24–48 hours.' });
}

async function handleSubscribe(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!isEmail(email)) return json({ ok: false, error: 'Valid email required' }, 400);
  console.log(JSON.stringify({ type: 'subscribe', domain: 'phx.beauty', email, at: new Date().toISOString() }));
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = getHost(request, url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'phx-beauty-v1', at: new Date().toISOString() });
    }
    if (url.pathname === '/api/inquire' && request.method === 'POST') {
      return handleInquire(request);
    }
    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request);
    }
    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Not found' }, 404);
    }

    if (host === 'www.phx.beauty') {
      const target = new URL(url.pathname + url.search, CANONICAL_ORIGIN);
      return Response.redirect(target.toString(), 301);
    }

    if (url.pathname === '/index.html' || url.pathname === '/index.html/') {
      return Response.redirect(`${CANONICAL_ORIGIN}/`, 301);
    }

    // Static assets (Astro dist). Honors not_found_handling / html_handling from wrangler.toml.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
