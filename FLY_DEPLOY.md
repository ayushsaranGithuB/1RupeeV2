# Deploying 1Rupee to Fly.io

Two Fly apps run as long-running containers:

- **`1rupee-web`** — Next.js SSR app (public), built from [apps/web/Dockerfile](apps/web/Dockerfile).
- **`1rupee-api`** — Bun/Hono API (private), built from [apps/api/Dockerfile](apps/api/Dockerfile).

The web app reaches the API over Fly private networking at
`http://1rupee-api.internal:3001` — the API is never exposed publicly.

Configs live at the repo root: [fly.web.toml](fly.web.toml), [fly.api.toml](fly.api.toml).
Both use the **monorepo root as the Docker build context**.

## Prerequisites

```bash
# Install flyctl: https://fly.io/docs/flyctl/install/
fly auth login
```

> App names in the fly.toml files (`1rupee-web`, `1rupee-api`) are globally
> unique on Fly. If they're taken, change `app = "..."` in each file.

## First-time setup

Run everything **from the repo root**.

```bash
# 1. Create the two apps (no deploy yet)
fly apps create 1rupee-api
fly apps create 1rupee-web

# 2. Set secrets (not committed). At minimum the API needs the DB + auth secret:
fly secrets set -c fly.api.toml \
  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
  BETTER_AUTH_SECRET="<random-string>"

# Add any others the API uses (Razorpay, Resend, etc.):
# fly secrets set -c fly.api.toml RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RESEND_API_KEY=...

# 3. Deploy the API first (web depends on it over .internal)
fly deploy -c fly.api.toml

# 4. Deploy the web app
fly deploy -c fly.web.toml
```

The web app is then live at `https://1rupee-web.fly.dev` (or your app name).

## Day-to-day deploys

```bash
fly deploy -c fly.api.toml   # ship the API
fly deploy -c fly.web.toml   # ship the web app
```

## Environment variables

| Variable | App | Where | Notes |
|---|---|---|---|
| `API_URL` | web | `fly.web.toml` `[env]` | Proxy target; defaults to `http://1rupee-api.internal:3001` |
| `DATABASE_URL` | api | `fly secrets set` | Neon/Postgres connection string |
| `BETTER_AUTH_SECRET` | api | `fly secrets set` | Auth signing secret |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_APP_URL` | web | build arg | Inlined at build; set via `[build.args]` in `fly.web.toml` |

Public (`NEXT_PUBLIC_*`) vars must be present **at build time** — set them under
`[build.args]` in [fly.web.toml](fly.web.toml). Everything else is a runtime
secret/var.

## Notes

- **Region:** both configs use `bom` (Mumbai). Change `primary_region` if you
  prefer elsewhere.
- **Private API:** `fly.api.toml` has no `[http_service]`, so the API is only
  reachable over `.internal` from other apps in your Fly org. Its machine runs
  continuously (no autostop without a service).
- **Local Docker not required:** Fly builds remotely on its builders by default.
- **Scale/cost:** `shared-cpu-1x` / 512MB each. The web app auto-stops when idle
  (`min_machines_running = 0`); raise it to keep one warm.
