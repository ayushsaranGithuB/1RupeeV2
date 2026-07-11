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

## Deploys

Fly.io is connected to this GitHub repo for continuous deployment: every push
to `main` triggers a build and rollout automatically (configured in the Fly
dashboard, not a workflow file in this repo). No manual `fly deploy` needed
for normal changes.

To deploy manually anyway (e.g. testing a local Dockerfile change before
pushing):

```bash
fly deploy
```

Run `fly logs` to tail the running app, and `fly status` to check machine
health.

## Secrets

Set required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`CRON_SECRET`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`) via
`fly secrets set NAME=value`.

`ADMIN_EMAIL` (defaults to `ayushsaran@gmail.com` if unset) is where cron
failure alerts are sent — see below. `RESEND_API_KEY` must also be set for
those alert emails to actually deliver; without it they're only logged via
`fly logs` (see [server/lib/senders.ts](../server/lib/senders.ts)).

## Daily wallet cron

[.github/workflows/cron-daily-deductions.yml](../.github/workflows/cron-daily-deductions.yml)
calls `POST /api/internal/cron/daily-run` on the deployed app every day at
18:30 UTC (00:00 IST), guarded by the `X-Cron-Secret` header. This requires
two **GitHub Actions repo secrets** (Settings → Secrets and variables →
Actions on GitHub, separate from Fly secrets):

- `CRON_SECRET` — must match the value set on Fly via `fly secrets set CRON_SECRET=...`
- `APP_URL` — the deployed app's base URL, e.g. `https://1rupee-v2.fly.dev`

The workflow fails the run (and should trigger GitHub's own failure
notification) on any non-2xx response, and the endpoint itself emails
`ADMIN_EMAIL` on failures or partial failures. Recent runs — automated or
admin-triggered via `/api/admin/cron/daily-run` — are visible on
`/admin/system-status`, which also flags a stale (>26h) or failed last run.
