interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'www.phx.beauty') {
      url.hostname = 'phx.beauty';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/index.html' || url.pathname === '/index.html/') {
      return Response.redirect(`${url.origin}/`, 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
