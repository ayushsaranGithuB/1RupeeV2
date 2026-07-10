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

Serverless-first.

Deploy to Cloudflare Workers + Neon PostgreSQL.

Keep infrastructure inexpensive and horizontally scalable.

No unnecessary complexity.

---

## Documentation

- [API Reference](docs/API.md)
- [Payments Guide](docs/PAYMENTS.md)
- [Architecture](docs/architecture.md)
- [Development Roadmap](docs/development-roadmap.md)
