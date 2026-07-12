# Database Setup

## Overview

1Rupee uses **Drizzle ORM** with **PostgreSQL** (Neon) for type-safe database operations.

## Files

- `schema.ts` — Complete Drizzle schema with all tables, enums, and relationships
- `index.ts` — Database connection initialization
- `seed.ts` — Development seed script
- `migrations/` — Auto-generated migrations (created by drizzle-kit)

## Getting Started

### 1. Set up DATABASE_URL

Create `.env.local` in the project root:

```bash
DATABASE_URL=postgresql://username:password@host:5432/1rupee
```

### 2. Generate Migrations

```bash
bun run db:generate
```

This creates SQL migration files based on schema changes.

### 3. Push Schema to Database

```bash
bun run db:push
```

Applies all pending migrations to your database.

### 4. Seed Development Data

```bash
bun run db/seed.ts
```

Creates:
- 100 test users
- 10 NGOs
- 20 campaigns
- 80 campaign tiers (4 per campaign)
- Wallets for all users with random balances

## Schema Overview

### Core Tables

**users**
- UUID primary key
- Email (unique), name, avatar
- Role (USER | ADMIN), status (active | suspended)
- Soft delete support (deleted_at)

**wallets**
- 1:1 relationship with users
- cached_balance (rupees/integer, derived from wallet_transactions)
- Derives actual balance from wallet_transactions

**wallet_transactions** (Immutable Ledger)
- Never edit or delete
- Types: TOPUP, DONATION, REFUND, ADJUSTMENT
- Current balance = SUM(all transactions)

**ngos**
- Soft delete support
- Verification status (PENDING, VERIFIED, REJECTED, SUSPENDED)
- Payout account details (JSONB)

**campaigns**
- Belongs to NGO
- Status: DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED
- Tracks raised_amount and supporter_count
- Soft delete support

**campaign_tiers**
- 3-5 tiers per campaign
- Daily amount in paise
- Impact description for donors

**pledges**
- User's recurring support commitment
- Status: ACTIVE, PAUSED, CANCELLED
- References campaign tier

**donations**
- Created daily by CRON
- Immutable record of each donation
- Links: pledge → campaign → wallet_transaction

**payouts**
- Monthly payout to NGOs
- Status: PENDING, PROCESSING, COMPLETED, FAILED
- Stores period start/end and receipt

**audit_logs**
- Tracks all admin wallet adjustments
- References admin and user
- Stores action, amount, and reason

**transparency_reports**
- Annual reports, audit reports, transparency data

## Relationships

```
User (1) ←→ (N) Pledges ←→ (1) Campaign Tier
   ↓
 Wallet (1) ←→ (N) Wallet Transactions
   ↓
 (N) Donations ←→ (1) Campaign
                    ↓
                  NGO (1) ←→ (N) Payouts
```

## Important Rules

✅ **DO:**
- Use transactions for multi-step writes
- Store money in **paise** (INTEGER)
- Use soft deletes for users, NGOs, campaigns
- Keep wallet_transactions immutable
- Log all admin actions to audit_logs

❌ **DON'T:**
- Edit or delete wallet_transactions
- Edit or delete donations
- Store balance in users/campaigns (derive from ledger)
- Trust client-side payment success (webhooks only)

## Development

### Type Safety

All database operations are fully typed through Drizzle relations:

```typescript
const db = getDb();
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId),
  with: {
    wallet: true,
    pledges: {
      with: {
        tier: true,
      },
    },
  },
});
```

### Connection Pool

Connection pooling is configured in `db/index.ts`:
- Dev: max 5 connections
- Prod: max 10 connections

Current setup uses the `postgres` driver, running on Fly.io (Bun/Docker), so no
edge-runtime adapter is needed.
