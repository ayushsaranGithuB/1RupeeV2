# Architecture

## Authentication

**Framework:** Better Auth (`better-auth`), session/cookie based.

**Methods (passwordless):**

- Email magic link (`magicLink` plugin) — dev logs the link to the API console; wire Resend for production.
- Phone OTP (`phoneNumber` plugin) — **dev accepts a fixed OTP `0000`** (`DEV_PHONE_OTP`, guarded by `NODE_ENV`); wire an SMS provider (MSG91/Twilio) for production.

**Roles:** `USER`, `ADMIN` (existing `users.role` enum). Better Auth's `admin` plugin is configured with a custom access-control `roles` map keyed by these uppercase values (`adminRoles: ['ADMIN']`, `defaultRole: 'USER'`).

**Where it lives:**

- The Better Auth instance is defined in `server/lib/auth.ts` and mounted at `app/api/auth/[...all]/route.ts` (`auth.handler(request)`), same-origin with the rest of the app. It owns `sessions`, `accounts`, `verifications` tables and auth columns on `users` (migration `0006_auth_tables`), reusing the existing `users` table via field mapping.
- The web app and API are a single Next.js app (port **8080**), so the session cookie is first-party by default — no proxy gateway. Client: `lib/auth-client.ts`.

**Authorization:** Every protected route handler calls a shared guard from `server/lib/session.ts` (`requireUser` or `requireAdmin`) at the top of the function; `/api/wallets/*`, `/api/pledges/*`, `/api/donations/*` need any user, `/api/admin/*` needs `role === 'ADMIN'`. Admin APIs are also blocked for impersonating sessions. A test-only seam (`x-test-auth`, active only when `NODE_ENV==='test'`) exists for route tests.

### Admin impersonation ("log in as user")

Admins can start an audited, time-limited session as any user to view their dashboard (support/troubleshooting), via Better Auth's `admin` plugin.

- Start: `admin.impersonateUser({ userId })` from the admin Users screen → creates a session with `session.impersonatedBy = <adminId>` (auto-expires in 30 min).
- Audit: a `databaseHooks.session.create.after` hook writes an `audit_logs` row (`action = 'IMPERSONATE_START'`, `admin_id`, `user_id`).
- While impersonating: a sticky banner is shown (`components/impersonation-banner.tsx`) and `/admin/*` APIs return 403.
- Stop: `admin.stopImpersonating()` restores the admin session.

**Dev admin login:** the seed ensures an `ADMIN` (email from `ADMIN_EMAIL`, default `ayushsaran@gmail.com`); sign in via magic link and copy the link from the API console.

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

**App:** Single Next.js app (UI + API routes) on Cloudflare Workers via OpenNext

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
