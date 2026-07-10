# 1Rupee — Recurring Giving Platform

## Vision

Create India's simplest recurring giving platform where anyone can support charitable causes from as little as ₹1 per day.

Instead of one-time donations, users build a long-term habit of giving.

---

## MVP Goal

Validate over a 3-month pilot:

- Will users recharge a donation wallet?
- Will users maintain recurring daily pledges?
- Will NGOs trust the platform?
- Will users increase their support through impact tiers?

---

## Pilot Scope

- 8–10 manually onboarded NGOs
- One platform administrator
- Public website
- User dashboard
- Admin panel
- Wallet top-ups
- Daily pledge processing
- Monthly NGO payouts

---

## Product Philosophy

People donate to outcomes, not amounts.

Every campaign defines impact tiers such as:

- ₹1/day — Daily Supporter
- ₹5/day — Impact Supporter
- ₹10/day — School Lunch Sponsor
- ₹35/day — Community Champion

Each NGO customizes the impact statement while the platform only stores:

- daily_amount
- impact_description

---

## Success Metrics

- User registrations
- Wallet recharge conversion
- Active daily donors
- Average wallet recharge
- Average donation per user
- Tier distribution
- 30/60/90 day retention
- Monthly donation volume

---

## Technical Philosophy

Deploy to Fly.io (containers) + Neon PostgreSQL.

Keep infrastructure inexpensive and horizontally scalable.

No unnecessary complexity.

---

## Local Development

```bash
bun install

# One-time: apply DB migrations to Neon, then seed
bun run scripts/apply-migration.ts db/migrations/0006_auth_tables.sql
bun run db:seed          # ensures an ADMIN user (ADMIN_EMAIL, default ayushsaran@gmail.com)

bun run dev              # API on http://localhost:3001, web on http://localhost:8080
```

### Auth (passwordless)

Auth is [Better Auth](https://better-auth.com) with email magic link + phone OTP. See [Architecture → Authentication](docs/architecture.md#authentication).

- **Email magic link:** sign in at `/auth/sign-in`; in dev the link is printed in the **API server console** (no email is sent unless `RESEND_API_KEY` is set).
- **Phone OTP:** in dev the OTP is always **`0000`** (`DEV_PHONE_OTP`; no SMS sent unless `MSG91_API_KEY` is set).
- **Admin login:** sign in with the seeded admin email via magic link. Admins can "Log in as user" (audited, reversible impersonation) from the admin Users screen.

Env: copy `apps/api/.env.example` → `apps/api/.env.local` and set `BETTER_AUTH_SECRET`, `DATABASE_URL`.

## Documentation

- [API Reference](docs/API.md)
- [Payments Guide](docs/PAYMENTS.md)
- [Architecture](docs/architecture.md)
- [Development Roadmap](docs/development-roadmap.md)
