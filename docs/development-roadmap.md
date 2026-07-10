# Development Roadmap

## Phase 1 — Foundation

- [x] Setup Turborepo
- [x] Configure Bun workspaces
- [x] Configure TypeScript
- [x] Setup Cloudflare + Neon
- [x] Configure Better Auth

Deliverable: Repository builds successfully. ✅

---

## Phase 2 — Database

- [x] Implement Drizzle schema
- [x] Create migrations
- [x] Seed data
- [x] Verify relationships

Deliverable: Database ready. ✅

---

## Phase 3 — API

- [x] Hono application
- [x] Auth middleware
- [x] Campaign endpoints
- [x] Wallet endpoints
- [x] Pledge endpoints
- [x] Automated tests

Deliverable: Core API complete. ✅

---

## Phase 4 — Business Logic

- [x] Wallet ledger
- [x] Daily CRON
- [x] Monthly payout generation
- [x] Razorpay webhook

Deliverable: Recurring donations functional. ✅

Notes:

- Daily CRON now includes idempotency guard to prevent duplicate same-day pledge charging.
- Monthly payout run supports period-level duplicate prevention per NGO.
- Job run history is stored for CRON and payout run auditability.

---

## Phase 5 — Admin

- [x] NGO management
- [x] Campaign management
- [x] Support tier editor
- [x] User search
- [x] Payout workflow
- [x] Donations and ledger operations views
- [x] Transparency report publishing view
- [x] Unified admin design system and UX guidelines
- [x] Table-first operations UI with right-side drawer workflows (details/add/edit)

Deliverable: Operations team can manage the platform. ✅

Notes:

- Admin dashboard now shows operational KPIs from the platform data.
- Admin screens now cover donations, ledger review, and transparency reports from `FEATURES.md`.
- Shared admin proxy now supports mutating requests so the screens work end-to-end.
- Admin workflow now follows a consistent SaaS interaction model across screens (search/filter table -> drawer -> inline edit -> save).

---

## Phase 6 — Public Website

- [x] Landing page
- [x] Campaigns
- [x] Campaign details
- [x] Transparency
- [x] Authentication

Deliverable: Public MVP. ✅

---

## Phase 7 — User Dashboard

- [x] Signup / Login / Logout Routes - No passwords, Email Magic Link or Phone based OTP
- [ ] Wallet
- [ ] Top-up + Checkout Pages
- [ ] Current Pledges
- [ ] Full Donation history
- [ ] User Profile

Deliverable: Complete donor experience.

Notes:

- Real passwordless auth (Better Auth) now backs the platform: email magic link + phone OTP. Previously all auth was mocked (any `Bearer` token → hardcoded test user/admin); the mock middleware has been replaced with real session verification in `apps/api/src/index.ts`. Admins must now sign in (magic link) to use the admin console. Set the admin via `ADMIN_EMAIL` in the seed (default `ayushsaran@gmail.com`).
- Admin **user impersonation** ("log in as user"): admin-only, session-based (Better Auth `admin` plugin), time-limited (30 min), reversible, and audited to `audit_logs` (`IMPERSONATE_START`). A sticky banner shows while impersonating; admin APIs are blocked during an impersonation session.
- Phone OTP is mocked to `0000` in development (guarded by `NODE_ENV`/`DEV_PHONE_OTP`); wire an SMS provider (MSG91/Twilio) for production. Magic-link + OTP messages are logged to the API console in dev; wire Resend for production email.
- DB migration `0006_auth_tables` adds Better Auth `sessions`/`accounts`/`verifications` tables and auth columns on `users`.

---

## Phase 8 — CI/CD and UI Test Coverage

- [ ] CI pipeline for lint, typecheck, unit tests, and build
- [ ] Branch protections and required status checks
- [ ] Preview deployments for pull requests
- [ ] Component test suite for all shared UI components (`apps/web/components/ui/*`)
- [ ] Admin page interaction tests for drawer workflows and table filters
- [ ] Visual regression snapshots for critical admin flows

Deliverable: Reliable release pipeline with test-verified UI quality.

---

## Phase 9 — Polish

- [ ] Responsive QA
- [ ] Accessibility
- [ ] Analytics
- [ ] Monitoring
- [ ] Deployment
- [ ] Pilot launch

Success Criteria

- Wallet top-ups work.
- Daily CRON processes pledges.
- Monthly payouts generated.
- Users can support campaign tiers.
- Ready for 3-month pilot.
