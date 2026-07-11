# Deployment Guide

1Rupee is a single Next.js app (UI + API routes) deployed to **Cloudflare Workers** via [OpenNext](https://opennext.js.org/cloudflare).

```
┌─────────────────────────────────────────┐
│  Cloudflare Worker                       │
│  - Next.js SSR + API routes (app/api/*) │
├─────────────────────────────────────────┤
│  Neon PostgreSQL                        │
└─────────────────────────────────────────┘
```

There is no separate API service — `app/api/**/route.ts` handlers run in the
same Worker as the rest of the app.

## Configuration

- `open-next.config.ts` — OpenNext build config.
- `wrangler.jsonc` — Worker name, entry point (`.open-next/worker.js`), and
  static asset directory (`.open-next/assets`).

## Quick deploy

```bash
bun run cf:build     # builds Next.js, then adapts it for Workers via OpenNext
bun run cf:deploy     # deploys the built Worker to Cloudflare
```

Use `bun run cf:preview` to run the Workers build locally before deploying.

## Secrets

Set required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`CRON_SECRET`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`) via
the Cloudflare dashboard or `wrangler secret put <NAME>`.
