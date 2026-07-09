# Drizzle Database Schema

## OneRupeeProject MVP

This document is the canonical source of truth for the database.

---

# Enums

## UserRole

```ts
USER;
ADMIN;
```

---

## WalletTransactionType

```ts
TOPUP;
DONATION;
REFUND;
ADJUSTMENT;
```

---

## CampaignStatus

```ts
DRAFT;
ACTIVE;
PAUSED;
COMPLETED;
ARCHIVED;
```

---

## NGOStatus

```ts
PENDING;
VERIFIED;
REJECTED;
SUSPENDED;
```

---

## PledgeStatus

```ts
ACTIVE;
PAUSED;
CANCELLED;
```

---

## PayoutStatus

```ts
PENDING;
PROCESSING;
COMPLETED;
FAILED;
```

---

# users

Stores authenticated users.

| Column     | Type           |
| ---------- | -------------- |
| id         | uuid PK        |
| email      | varchar UNIQUE |
| name       | varchar        |
| avatar_url | text           |
| role       | UserRole       |
| status     | varchar        |
| created_at | timestamp      |
| updated_at | timestamp      |
| deleted_at | timestamp null |

Indexes

- email
- role
- status

Notes

- status: "active" or "suspended"
- deleted_at: soft delete timestamp (soft deletes for GDPR compliance)

---

# wallets

One wallet per user.

| Column         | Type      |
| -------------- | --------- |
| id             | uuid PK   |
| user_id        | FK users  |
| cached_balance | integer   |
| created_at     | timestamp |
| updated_at     | timestamp |

Indexes

- user_id UNIQUE

---

# wallet_transactions

Immutable ledger.

Never edit.

Never delete.

| Column       | Type                  |
| ------------ | --------------------- |
| id           | uuid PK               |
| wallet_id    | FK                    |
| type         | WalletTransactionType |
| amount       | integer               |
| reference_id | uuid nullable         |
| description  | text                  |
| created_at   | timestamp             |

Indexes

- wallet_id
- type
- created_at

Current balance

```
SUM(amount)
```

Positive

```
TOPUP

ADJUSTMENT
```

Negative

```
DONATION

REFUND
```

---

# ngos

| Column              | Type           |
| ------------------- | -------------- |
| id                  | uuid PK        |
| name                | varchar        |
| slug                | varchar UNIQUE |
| logo_url            | text           |
| description         | text           |
| website             | text           |
| email               | varchar        |
| phone               | varchar        |
| verification_status | NGOStatus      |
| payout_account      | jsonb          |
| created_at          | timestamp      |
| deleted_at          | timestamp null |

Notes

- deleted_at: soft delete timestamp (soft deletes for GDPR compliance)

---

# campaigns

| Column            | Type           |
| ----------------- | -------------- |
| id                | uuid PK        |
| ngo_id            | FK             |
| title             | varchar        |
| slug              | varchar UNIQUE |
| short_description | text           |
| description       | text           |
| hero_image        | text           |
| goal_amount       | integer        |
| raised_amount     | integer        |
| supporter_count   | integer        |
| status            | CampaignStatus |
| created_at        | timestamp      |
| deleted_at        | timestamp null |

Indexes

- ngo_id
- slug
- status

Notes

- deleted_at: soft delete timestamp (soft deletes for GDPR compliance)

---

# campaign_tiers

Each campaign owns its own support tiers.

Example

Daily Supporter

School Lunch Sponsor

Community Champion

| Column             | Type    |
| ------------------ | ------- |
| id                 | uuid PK |
| campaign_id        | FK      |
| title              | varchar |
| description        | text    |
| impact_description | text    |
| daily_amount       | integer |
| monthly_equivalent | integer |
| display_order      | integer |
| active             | boolean |

Indexes

- campaign_id

---

# pledges

Represents a user's recurring support.

| Column           | Type           |
| ---------------- | -------------- |
| id               | uuid PK        |
| user_id          | FK             |
| campaign_tier_id | FK             |
| status           | PledgeStatus   |
| started_at       | timestamp      |
| paused_at        | timestamp null |
| cancelled_at     | timestamp null |

Indexes

- user_id
- campaign_tier_id

---

# donations

Created every day by CRON.

Immutable.

| Column                | Type      |
| --------------------- | --------- |
| id                    | uuid PK   |
| pledge_id             | FK        |
| campaign_id           | FK        |
| wallet_transaction_id | FK        |
| amount                | integer   |
| donated_at            | timestamp |

Indexes

- campaign_id
- donated_at

---

# payouts

Monthly payout to NGOs.

| Column       | Type           |
| ------------ | -------------- |
| id           | uuid PK        |
| ngo_id       | FK             |
| period_start | date           |
| period_end   | date           |
| total_amount | integer        |
| receipt_url  | text           |
| status       | PayoutStatus   |
| completed_at | timestamp null |

---

# transparency_reports

| Column      | Type      |
| ----------- | --------- |
| id          | uuid PK   |
| title       | varchar   |
| file_url    | text      |
| report_type | varchar   |
| created_at  | timestamp |

---

# audit_logs

Tracks manual wallet adjustments and other admin actions.

| Column     | Type         |
| ---------- | ------------ |
| id         | uuid PK      |
| admin_id   | FK users     |
| user_id    | FK users     |
| action     | varchar      |
| amount     | integer null |
| reason     | text         |
| created_at | timestamp    |

Notes

- action: "credit", "debit", "suspend", "unsuspend", etc.
- amount: null for non-wallet actions
- reason: explanation of why action was taken

Indexes

- admin_id
- user_id
- created_at

---

# Relationships

```
User
 │
 ├──────── Wallet
 │             │
 │             └──────── Wallet Transactions
 │
 ├──────── Pledges
 │             │
 │             └──────── Campaign Tier
 │                           │
 │                           └──────── Campaign
 │
 └──────── Audit Logs
          (admin logs user actions)

Campaign
 │
 ├──────── NGO
 │
 ├──────── Campaign Tiers
 │
 └──────── Donations
              │
              ├──────── Pledge
              │
              └──────── Wallet Transaction

NGO
 └──────── Monthly Payouts
```

---

# Important Rules

## Ledger

Wallet balance is **never** stored as the source of truth.

The ledger is.

```
Current Balance

=

SUM(wallet_transactions.amount)
```

`cached_balance` is only a performance optimization.

---

## Soft Deletes

Never physically delete:

- users (GDPR compliance)
- ngos
- campaigns

Always soft delete using `deleted_at` timestamp.

---

## Donations

Every donation must have

- one pledge
- one wallet transaction
- one campaign

Donation records are immutable and must never be deleted.

---

## Audit Logging

Every admin action that modifies wallet balance or user status must be logged to audit_logs:

- User ID being modified
- Admin ID performing action
- Action type (credit, debit, suspend, etc.)
- Amount (if applicable)
- Reason

---

## Daily CRON

For every ACTIVE pledge

```
Wallet balance >= daily_amount ?

↓

Yes

↓

Create wallet transaction

↓

Create donation

↓

Update campaign totals
```

---

# Future Tables (NOT MVP)

- notifications
- referrals
- audit_logs
- volunteer_programs
- campaign_updates
- comments
- achievements
- organizations_users
