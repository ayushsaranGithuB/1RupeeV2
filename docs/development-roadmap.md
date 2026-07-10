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
- [x] System Status Page - Shows API health, public API and admin API , Logs Status etc..

Deliverable: Operations team can manage the platform. ✅

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
- [x] Wallet
- [x] Top-up + Checkout Pages
- [x] Current Pledges
- [x] Full Donation history
- [x] User Profile

Deliverable: Complete donor experience. ✅

---

## Phase 8 — Pledge Checkout Flow

- [x] Campaign detail page with tier selection
- [x] Plan selection page (3 months / 6 months / 1 year + custom 1-12 months)
- [x] Pricing calculation (daily amount × plan length)
- [x] Cart/Review page showing tier + plan + total price + wallet top-up
- [x] Payment page (Razorpay-ready, simplified to button)
- [x] Payment success page with transaction details
- [x] Payment failure handling with error message and retry
- [x] POST /pledges endpoint (create new pledge)
- [x] Wallet balance validation
- [x] Transaction completion (deduct from wallet, create pledge, log donation)
- [x] Tests: pledge creation with various scenarios
- [x] Database migrations (plan_length_months column)
- [x] Auth route restructuring (/auth/* → root-level routes)

Deliverable: Users can pledge to campaigns and are charged upfront. ✅

See [PHASE8-PLEDGE-CHECKOUT.md](PHASE8-PLEDGE-CHECKOUT.md) for implementation details, architecture notes, and known issues.

---

## Phase 9 — CI/CD and UI Test Coverage

- [x] CI pipeline for lint, typecheck, unit tests, and build
- [x] Branch protections and required status checks (documented in CONTRIBUTING.md)
- [x] Preview deployments for pull requests
- [x] Component test suite for all shared UI components (`apps/web/components/ui/*`)
- [ ] Admin page interaction tests for drawer workflows and table filters
- [ ] Visual regression snapshots for critical admin flows

Deliverable: Reliable release pipeline with test-verified UI quality.

Status: Component tests framework set up (Vitest + React Testing Library). Tests created for Button, Input, and Badge. API unit tests already in place.

---

## Phase 10 — Polish

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
