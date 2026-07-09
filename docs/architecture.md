# Architecture

## Authentication

**Framework:** Better Auth

**Methods:**

- Google OAuth
- Magic Link

**Roles:**

- User
- Admin

Protect all dashboard routes. Never expose admin APIs without role verification.

---

## Database (Drizzle - Source of Truth)

### Schema

**Users**

- id (uuid)
- name
- email
- avatar_url
- created_at

**Wallets**

- id
- user_id (unique)
- cached_balance
- updated_at

**Wallet Transactions**

- id
- wallet_id
- type (TOPUP|DONATION|ADJUSTMENT|REFUND)
- amount
- reference_id
- created_at

**NGOs**

- id
- name
- slug
- logo
- description
- verified
- payout_details

**Campaigns**

- id
- ngo_id
- title
- slug
- description
- cover_image
- goal_amount
- raised_amount
- status

**Campaign Tiers**

- id
- campaign_id
- title
- daily_amount
- monthly_equivalent
- impact_description
- display_order

**Pledges**

- id
- user_id
- campaign_tier_id
- status
- started_at
- paused_at

**Donations**

- id
- pledge_id
- campaign_id
- wallet_transaction_id
- amount
- donated_at

**Payouts**

- id
- ngo_id
- amount
- period_start
- period_end
- status
- receipt_url

**Indexing & Constraints:** Use UUID primary keys, timestamps, foreign keys. Index on email, slug, campaign_id, ngo_id, user_id. Never delete ledger or donation records. Use soft deletes for users, NGOs, and campaigns.

### Entity Relationships

- User -> Wallet (1:1)
- User -> Pledges (1:N)
- Wallet -> Wallet Transactions (1:N)
- NGO -> Campaigns (1:N)
- Campaign -> Campaign Tiers (1:N)
- Campaign -> Donations (1:N)
- Pledge -> Donations (1:N)
- Payout -> NGO (N:1)

### Seed Data

Generate:

- 10 NGOs
- 20 Campaigns
- 4 tiers per campaign
- 100 users
- Random wallet balances
- Random pledges
- 2,000 donation records

---

## Wallet Ledger

Wallet balance is derived from immutable transactions.

**Transaction Types:**

- TOPUP
- DONATION
- ADJUSTMENT
- REFUND

**Calculation:** Current balance = SUM(all transactions)

Never update historical transactions. Adjustments must create new ledger entries.

---

## Payment Flow

1. User selects top-up amount
2. Razorpay Checkout opens
3. Webhook verifies payment
4. Create TOPUP wallet transaction
5. Update cached wallet balance
6. Return success

**Critical:** Do not trust client-side payment success. Only webhooks create wallet credits.

---

## Daily CRON Workflow

Runs once every 24 hours.

**For each active pledge:**

- Check wallet balance >= tier.daily_amount
- Create DONATION ledger transaction
- Create donation record
- Update campaign totals
- Update cached wallet balance
- Skip pledges with insufficient balance

**Monthly:**

- Admin runs payout generation
- Aggregate donations by NGO
- Generate payout report

---

## Deployment

**Frontend:** Next.js on Cloudflare Workers

**API:** Hono on Cloudflare Workers

**Database:** Neon PostgreSQL

**Storage:** Cloudflare R2

**Email:** Resend

**Payments:** Razorpay

Secrets managed through Cloudflare. Separate development and production environments.

---

## Folder Structure

```
app/
components/
features/
lib/
server/
services/
repositories/
db/
schemas/
hooks/
types/
```

**Rules:**

- Business logic → services
- Database → repositories
- Validation → schemas
- UI grouped by feature
- Shared utilities in lib
