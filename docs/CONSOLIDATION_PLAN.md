# Consolidation Plan: Hono API → Next.js, drop Turborepo

Status: **DONE (historical).** This consolidation was completed; the Hono app it describes mounting into Next was later removed entirely in favor of native Next.js Route Handlers (see `docs/architecture.md` / `docs/API.md` for the current API layer). Kept for historical context only — do not use as a description of the current codebase.

## Goal

Collapse the two-app monorepo into a **single Next.js app** that serves both the UI and the API, remove the HTTP proxy hop, add an automated daily-deduction scheduler with machine-to-machine auth, and delete Turborepo / workspaces.

### End state

- One deployable Next.js app (Bun/Node on Fly), one `Dockerfile`, one `fly.toml`.
- The existing Hono app is **mounted inside Next** via a catch-all route handler (Option A from the evaluation — keeps routes/services/repositories/tests largely as-is; lowest rewrite risk).
- Better Auth runs **first-party** on the web origin — the `/api/proxy/*` gateway and the per-route proxy handlers are deleted.
- Daily wallet deductions run via an **external scheduler → secret-guarded endpoint** (no in-process cron).
- No `turbo`, no `workspaces`, no `apps/` — a single package at the repo root.

---

## Target directory layout

Single app at the repo **root** (the root already contains the skeleton dirs `app/ components/ lib/ server/ services/ …`, so this matches the original intent). All API code goes under `server/` to avoid `lib/`+`types/` name clashes with the web side.

```
/                         # repo root = the Next.js app
  app/                    # ← apps/web/app  (Next routes/pages)
    api/
      [[...route]]/route.ts   # NEW: mounts the Hono app (app.fetch)
  components/             # ← apps/web/components
  lib/                    # ← apps/web/lib  (client helpers: auth-client, public, dashboard, admin, utils)
  hooks/  features/  types/   # ← apps/web/* (if present)
  server/                 # ← apps/api/src  (routes, services, repositories, schemas, middleware, utils, lib{auth,senders}, types)
    app.ts                # ← apps/api/src/index.ts MINUS Bun.serve bootstrap (exports the Hono app)
  db/                     # unchanged (already at root)
  public/                 # ← apps/web/public
  next.config.js  tsconfig.json  tailwind.config.ts  postcss.config.js
  eslint.config.js  vitest.config.ts
  Dockerfile  fly.toml
  package.json  bun.lock  bunfig.toml  drizzle.config.ts
```

Deleted at the end: `apps/`, `turbo.json`, `fly.api.toml`, `apps/*/Dockerfile`, root skeleton dirs that stay empty, `app/api/proxy/`, `app/api/admin/{campaigns,ngos,payouts}/route.ts`.

---

## Path aliases (root `tsconfig.json`)

Unify both apps' aliases:

| Alias | Maps to |
| --- | --- |
| `@/*` | `./*` |
| `@db` / `@db/*` | `./db` / `./db/*` |
| `@components/*`, `@lib/*`, `@hooks/*`, `@types/*` | `./components/*`, `./lib/*`, … |

The API's **internal relative imports** (`../repositories/x`, `../lib/auth`) survive the move because `apps/api/src/*` moves to `server/*` as a block. Only `@db` / `@db/schema` need to resolve — they already do at root.

---

## How the Hono app mounts in Next

`server/app.ts` exports the Hono instance with a base path:

```ts
// server/app.ts  (former apps/api/src/index.ts, Bun.serve removed)
const app = new Hono().basePath("/api");
// ...all existing routes: /campaigns, /admin/*, /auth/*, etc.
export default app;
```

`app/api/[[...route]]/route.ts`:

```ts
import app from "@/server/app";
export const GET = (req: Request) => app.fetch(req);
export const POST = (req: Request) => app.fetch(req);
export const PATCH = (req: Request) => app.fetch(req);
export const DELETE = (req: Request) => app.fetch(req);
export const PUT = (req: Request) => app.fetch(req);
export const OPTIONS = (req: Request) => app.fetch(req);
export const runtime = "nodejs"; // NOT edge — needs postgres/Better Auth
```

Because Next owns the request, previous route paths become `/api/campaigns`, `/api/admin/*`, `/api/auth/*`, etc.

---

## Auth changes (first-party, no proxy)

- **Server** (`server/lib/auth.ts`): set `basePath: '/api/auth'`; `baseURL` becomes the web origin (env `BETTER_AUTH_URL` / `WEB_URL`). CORS middleware in the Hono app can be **dropped** for same-origin (keep a minimal config only if needed for local tooling).
- **Client** ([lib/auth-client.ts](../apps/web/lib/auth-client.ts)): `basePath: '/api/auth'` (was `/api/proxy/auth`). `baseURL` stays the origin.
- **Web data callers** (`lib/public.ts`, `lib/dashboard.ts`, `lib/admin.ts`): change base from `/api/proxy/...` → `/api/...`. _(Pre-flight: confirm exactly how each builds its URL.)_
- **Delete** `app/api/proxy/[...path]/route.ts` and the redundant `app/api/admin/{campaigns,ngos,payouts}/route.ts` proxy handlers.
- Cookie is now first-party to the single origin — removes the cookie/origin forwarding logic entirely.

---

## Daily deduction scheduler + machine auth

Business logic is unchanged (`DailyDonationProcessorService.runDailyProcessing`, already idempotent per UTC date). Two additions:

1. **Secret-guarded internal endpoint** — new Hono route `POST /api/internal/cron/daily-run`, guarded by a `CRON_SECRET` header check (constant-time compare), NOT the admin-session guard. Calls `runDailyProcessing`. _(Pre-flight: `runDailyProcessing(adminId, …)` needs an actor id for `job_runs`/audit — add a `SYSTEM` sentinel id or make it optional.)_ Keep the existing admin-triggered `/api/admin/cron/daily-run` for manual runs.
2. **Scheduler** — GitHub Actions scheduled workflow (`on: schedule: cron`), simplest + free + visible. It `curl`s the endpoint daily with the secret. Deductions key off **UTC date**, so pick the cron time deliberately (e.g. `30 18 * * *` UTC ≈ 00:00 IST). Alternative noted: a Fly scheduled Machine.

New secrets: `CRON_SECRET` (on Fly + as a GitHub Actions secret).

---

## Build tooling (drop Turbo/workspaces)

- **Single root `package.json`**: merge deps from `apps/web` + `apps/api` + current root. Remove `workspaces`, remove `turbo` dep, replace turbo scripts:
  - `dev`: `next dev -p 8080`
  - `build`: `next build`
  - `start`: `next start -p 8080`
  - `lint`: `eslint .`
  - `type-check`: `tsc --noEmit`
  - `test`: web/vitest; `test:api`: bun test _(Pre-flight: confirm the API tests' runner — `bun:test` vs vitest — and unify or keep two commands.)_
  - `db:*`: unchanged (drizzle-kit)
- Delete `turbo.json`, `.turbo/`, `apps/`.
- `next.config.js`: keep `output: 'standalone'`; drop the monorepo `outputFileTracingRoot` (root is now the app root).
- `bunfig.toml`, `drizzle.config.ts` unchanged.

---

## Deploy changes

- **One `Dockerfile`** at root (Next standalone; build context = root).
- **One `fly.toml`** (rename from `fly.web.toml`): public web service on 8080. Remove `API_URL` (calls are in-process now) and everything private-networking.
- **Delete** `fly.api.toml`, `apps/api/Dockerfile`, `apps/web/Dockerfile`.
- Update `.dockerignore` (no `apps/`).
- Update `FLY_DEPLOY.md`: one app, add `fly secrets set CRON_SECRET=…`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

---

## Execution phases (each ends at a green checkpoint)

1. **Branch**: `git switch -c refactor/consolidate-api`.
2. **Pre-flight discovery** (read-only): confirm the items marked _Pre-flight_ above (web lib URL construction, API test runner, web `hooks/features/types` contents, both tsconfigs).
3. **Move files**: `apps/api/src → server/`, `apps/web/* → root`, wire root configs + unified `tsconfig.json` + `package.json`. `bun install`.
4. **Mount Hono** in Next (`server/app.ts` + catch-all route). `type-check`.
5. **Auth first-party**: update server basePath + client basePath + web callers; delete proxies. Verify sign-in/session locally.
6. **Cron**: secret endpoint + GitHub Actions schedule.
7. **Tooling/deploy**: drop turbo/workspaces; single Dockerfile/fly.toml; docs.
8. **Verify**: `type-check`, `lint`, `build` (standalone), `test` (both suites), and a manual smoke test of: sign-in, a public route, a protected route, an admin route, and `curl` the cron endpoint with the secret.
9. **Commit** on the branch; summarize; you review/merge.

Checkpoints run at the end of 4, 5, 6, 8.

---

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Import-path breakage during the big move | Move API code as a block (relative imports intact); rely on `tsc --noEmit` after each phase |
| Better Auth basePath/cookie regressions | Verify sign-in + session read locally before proceeding (phase 5 checkpoint) |
| API tests coupled to Bun server / `app.fetch` | Tests move with `server/`; confirm runner in pre-flight; they exercise `app.fetch`, which still works |
| Next standalone tracing after flatten | Default tracing root once single-package; verify `.next/standalone` boots |
| Dual Drizzle instances (`authDb` + `getDb`) | Unchanged by the move — leave as-is |
| Cron double-run / wrong day | Idempotent per UTC date already; choose cron time deliberately |

## Rollback

All work is on `simplified`. Abandon = `git switch main` and delete the branch; `main` is untouched.

---

## Decisions (confirmed)

1. **Layout**: flatten to repo **root**.
2. **Scheduler**: **GitHub Actions cron**.
3. **Cron time**: **00:00 IST** → `30 18 * * *` (UTC) in the workflow.
4. **Tests**: **unify everything under vitest** (migrate API `bun:test` suites to vitest; single `test` command).
