interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_ORIGIN = 'https://phx.beauty';

function getHost(request: Request, url: URL): string {
  const headerHost = request.headers.get('host');
  if (headerHost) {
    return headerHost.toLowerCase().replace(/:\d+$/, '');
  }

  return url.hostname.toLowerCase();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = getHost(request, url);

    if (host === 'www.phx.beauty') {
      const target = new URL(url.pathname + url.search, CANONICAL_ORIGIN);
      return Response.redirect(target.toString(), 301);
    }

    if (url.pathname === '/index.html' || url.pathname === '/index.html/') {
      return Response.redirect(`${CANONICAL_ORIGIN}/`, 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
