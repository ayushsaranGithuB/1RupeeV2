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

- [ ] Wallet
- [ ] Top-up
- [ ] Pledges
- [ ] Donation history
- [ ] Profile

Deliverable: Complete donor experience.

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
