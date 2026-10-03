# Changelog — phx.beauty optimization

## 2026-10-03 — Comprehensive optimization (FEAT)

Technical foundation:
- Full Schema.org set: Organization, WebSite, Product/Offer ($8k), FAQPage, BreadcrumbList
- Canonical tags on all pages, robots control, XML sitemap via @astrojs/sitemap
- Security/caching headers: CSP, HSTS, X-Frame-Options, nosniff, immutable asset caching
- Perf: preconnect/dns-prefetch/preload hero image, eager+high-priority hero, lazy below-fold by default, minimal inline JS, static Astro output

SEO:
- Title format: "phx.beauty | Premium Domain for Sale | SDL Luxury Beauty Phoenix"
- Meta description with price/availability + CTA + UVP
- Long-tail keywords: buy .beauty domains, premium domain names, investment domains, brandable domains
- H1 = domain name, H2s = benefits/features/market; internal links: /faq/, /valuation-guide/, portfolio
- New content pages for DA building: /faq/, /valuation-guide/ (weekly-blog ready)

CRO:
- Above-the-fold: domain + price panel ($8k) + triple CTA (Buy Now / Make Offer / Contact Agent)
- Trust signals: Escrow.com, SSL/verified ownership, transaction guarantee, 24–48h response + badge bar
- Urgency: viewer counter (daily-stable), "1 of 1 available"
- Social proof: 3 testimonials + comps range
- Inquiry form POSTs to /api/inquire with validation + honeypot + mailto fallback; exit-intent email capture POSTs to /api/subscribe
- Sticky mobile CTA bar; data-track hooks on all CTAs

Mobile:
- Viewport-fit cover, 16px base, 48px tap targets, collapsible hamburger nav, no horizontal scroll (overflow-x clip)

Design:
- Clean minimal SDL system, restrained amber accent, dark/light toggle (persisted, OS-aware), smooth reveal + hover animations, portfolio search + category filters (geo/beauty/brandable), reduced-motion support

Worker (free plan only):
- GET /api/health, POST /api/inquire (min $8k), POST /api/subscribe, CORS, www→apex 301, /index.html→/ 301, ASSETS binding, run_worker_first /api/*
- workers_dev + preview_urls enabled; no paid bindings

Validation:
- `npm run build` passes; manual QA: nav/menu/theme, form validation + API, portfolio filter/search, exit-intent, 404, sitemap + robots
