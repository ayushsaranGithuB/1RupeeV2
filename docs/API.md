# Backend API

Related docs:

- [Payments Guide](PAYMENTS.md)

## Tech Stack

- Next.js Route Handlers running on Fly.io (Docker/Bun)
- Neon PostgreSQL
- Drizzle ORM
- Better Auth
- Zod validation
- TypeScript

---

## API Principles

- REST API
- JSON only
- Typed responses
- Zod validation
- Consistent error format
- One route per file
- One controller per resource

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

---

## Public Endpoints

- `GET /campaigns`
- `GET /campaigns/:slug`
- `GET /stats`
- `GET /stats/reports`

---

## Authenticated Endpoints

### User Profile

- `GET /me` — Get current user
- `PATCH /me` — Update current user

### Wallet

- `GET /wallet` — View balance
- `GET /wallet/transactions` — View transaction history
- `POST /wallet/topup` — Initiate top-up

### Pledges

- `GET /pledges` — List user pledges
- `POST /pledges` — Create new pledge
- `PATCH /pledges/:id` — Update pledge (pause/resume)
- `DELETE /pledges/:id` — Remove pledge

### Donations

- `GET /donations` — View donation history

---

## Admin Endpoints

### Users

- `GET /admin/users` — Search and list users

### NGOs

- `GET /admin/ngos` — List NGOs
- `POST /admin/ngos` — Create NGO

### Campaigns

- `GET /admin/campaigns` — List campaigns
- `POST /admin/campaigns` — Create campaign
- `POST /admin/campaigns/:id/tiers` — Add campaign tier

### Payouts

- `GET /admin/payouts` — List payouts
- `POST /admin/payouts/run` — Generate monthly payouts

### Jobs

- `POST /admin/cron/daily-run` — Run daily pledge processing
- `GET /admin/jobs/runs` — List CRON and payout run history

---

## Coding Standards

- Business logic lives in services/
- Database access only through repositories/
- Never expose ORM directly to routes
- All writes are transactional
- Validate all input with Zod
- Never perform business logic inside routes
- Service layer contains business logic
- Validate all API input with Zod
- Keep files small
- Prefer composition
- Never duplicate business logic

---

## Background Jobs

### Daily CRON (00:00 UTC configurable)

For every active pledge:

- Verify wallet balance >= daily_amount
- Create DONATION ledger transaction
- Create wallet transaction
- Update campaign total
- Update cached wallet balance
- Skip pledges with insufficient balance

Never delete ledger records.

### Monthly Payout

Admin initiated.

- Aggregate donations by NGO
- Generate payout report
- Mark payout complete
- Store payout receipt

---

## Database Architecture

See [architecture.md](architecture.md) for schema, relationships, and indexing details.

---

## Key Business Rules

### Wallet & Ledger

- Wallet balance is derived from immutable transactions
- Transaction types: TOPUP, DONATION, ADJUSTMENT, REFUND
- Current balance = SUM(all transactions)
- Never update historical transactions
- Adjustments must create new ledger entries

### Payment

- Do not trust client-side payment success
- Only webhooks create wallet credits
- Razorpay handles payment processing

### Donations

- Daily donations processed via CRON
- Never delete ledger or donation records
- Use soft deletes for users, NGOs, and campaigns

### NGOs & Campaigns

- NGOs can have multiple campaigns
- Campaigns can have 3-5 support tiers
- Tiers define daily_amount and impact_description
- Campaign totals updated on each donation
