# Deployment Guide

1Rupee is a single Next.js app (UI + API routes) deployed to **Fly.io** as a
Docker container.

```
┌─────────────────────────────────────────┐
│  Fly.io machine (Docker/Bun)             │
│  - Next.js SSR + API routes (app/api/*) │
├─────────────────────────────────────────┤
│  Neon PostgreSQL                        │
└─────────────────────────────────────────┘
```

There is no separate API service — `app/api/**/route.ts` handlers run in the
same container as the rest of the app.

## Configuration

- `Dockerfile` — builds and runs the app on the `oven/bun` image.
- `docker-entrypoint.js` — prerenders pages on `bun run start`, then launches
  the given command (run via `bun`, since the base image has no Node binary).
- `fly.toml` — app name, region, and `internal_port` (8080, matching the
  `next start -p 8080` script).

## Quick deploy

```bash
fly deploy
```

Run `fly logs` to tail the running app, and `fly status` to check machine
health.

## Secrets

Set required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`CRON_SECRET`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`) via
`fly secrets set NAME=value`.
