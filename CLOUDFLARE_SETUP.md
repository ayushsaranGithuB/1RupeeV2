# Cloudflare Workers Setup (OpenNext)

Deploy the 1Rupee web app to **Cloudflare Workers** using the
[OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare).

> **Why Workers, not Pages?** The web app is a full Next.js App Router SSR app
> with dynamic `/api/*` routes (including the Better Auth proxy). Cloudflare
> Pages' static/`next-on-pages` path is edge-runtime only and can't run this
> app. `@opennextjs/cloudflare` bundles the Next.js Node server into a Worker
> (`nodejs_compat`), so server components, API routes, and auth all work.

## How it fits together

- [`apps/web/open-next.config.ts`](apps/web/open-next.config.ts) — adapter config.
- [`apps/web/wrangler.jsonc`](apps/web/wrangler.jsonc) — Worker config: entry
  (`.open-next/worker.js`), `nodejs_compat`, static `ASSETS` binding, runtime vars.
- [`apps/web/next.config.js`](apps/web/next.config.js) — calls
  `initOpenNextCloudflareForDev()` so `next dev` sees Cloudflare bindings.
- Build output lands in `apps/web/.open-next/` (git-ignored).

## Local development

Normal dev is unchanged:

```bash
bun dev            # next dev on :8080, with Cloudflare bindings wired in
```

To run the actual Workers build locally (matches production):

```bash
cd apps/web
bun run preview    # builds with OpenNext + serves via workerd
```

For local runtime secrets during `preview`, create `apps/web/.dev.vars`
(git-ignored):

```
API_URL=http://127.0.0.1:3001
```

## One-time Cloudflare setup

1. Create a free Cloudflare account: https://dash.cloudflare.com
2. Grab your credentials:
   - **Account ID**: https://dash.cloudflare.com/profile/overview (bottom right)
   - **API Token**: https://dash.cloudflare.com/profile/api-tokens →
     *Create Token* → **Edit Cloudflare Workers** template.

## Manual deploy

```bash
cd apps/web
bunx wrangler login          # once
bun run deploy               # builds + deploys the Worker
```

First deploy creates the `1rupee-web` Worker and gives you a
`1rupee-web.<your-subdomain>.workers.dev` URL.

## Runtime environment variables

`NEXT_PUBLIC_*` vars are **inlined at build time**; everything else is read at
runtime from Worker vars/secrets.

| Variable              | Where it's set                          | Notes                                   |
| --------------------- | --------------------------------------- | --------------------------------------- |
| `API_URL`             | `wrangler.jsonc` `vars` / dashboard     | Backend base URL used by the proxy route |
| `NEXT_PUBLIC_APP_URL` | build env (CI secret)                   | Public origin, inlined into the bundle   |
| `NEXT_PUBLIC_API_URL` | build env (CI secret)                   | Inlined into the bundle                  |

Set non-secret runtime vars in `wrangler.jsonc` under `vars`, or per-env in the
dashboard. For secrets:

```bash
cd apps/web
bunx wrangler secret put BETTER_AUTH_SECRET
```

## Auto-deploy from GitHub

[`.github/workflows/deploy-workers.yml`](.github/workflows/deploy-workers.yml)
deploys on every push to `main`. Add these repo secrets under
**Settings → Secrets and variables → Actions**:

```
CLOUDFLARE_API_TOKEN    = <your-token>
CLOUDFLARE_ACCOUNT_ID   = <your-account-id>
NEXT_PUBLIC_API_URL     = <public API url>     # optional, build-time
NEXT_PUBLIC_APP_URL     = <public app origin>  # optional, build-time
```

## Typed bindings (optional)

Regenerate `cloudflare-env.d.ts` after changing bindings/vars:

```bash
cd apps/web
bun run cf-typegen
```

## Custom domain

In the Cloudflare dashboard → **Workers & Pages → 1rupee-web → Settings →
Domains & Routes**, add your domain. HTTPS is automatic.

## Troubleshooting

- **Build fails on a Node API** — ensure `nodejs_compat` is in
  `compatibility_flags` and `compatibility_date` is recent (see `wrangler.jsonc`).
- **`API_URL` undefined at runtime** — set it as a Worker var/secret, not just a
  build-time env var.
- **Deploy 403** — the API token needs the *Workers Scripts:Edit* permission.
