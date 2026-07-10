# Deployment Guide

1Rupee deploys to **Fly.io** as two containerized apps:

```
┌─────────────────────────────────────────┐
│  1rupee-web  (Fly app, public)          │
│  - Next.js SSR: UI, auth pages, proxy   │
│  - https://1rupee-web.fly.dev           │
├─────────────────────────────────────────┤
│  1rupee-api  (Fly app, private)         │
│  - Bun/Hono API                         │
│  - reached at 1rupee-api.internal:3001  │
├─────────────────────────────────────────┤
│  Neon PostgreSQL                        │
└─────────────────────────────────────────┘
```

The web app talks to the API over **Fly private networking**, so the API is
never exposed to the public internet.

👉 **Full setup and commands: [FLY_DEPLOY.md](../FLY_DEPLOY.md)**

Quick deploy (from the repo root, after `fly auth login`):

```bash
fly deploy -c fly.api.toml   # API first
fly deploy -c fly.web.toml   # then web
```
