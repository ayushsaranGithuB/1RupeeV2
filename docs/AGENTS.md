# AGENTS.md

# OneRupeeProject — AI Coding Agent Instructions

## Mission

Build the smallest possible MVP to validate whether users will build a habit of recurring charitable giving through daily micro-donations.

The MVP is a 3-month pilot with approximately 8–10 manually onboarded NGOs.

---

## Core Principles

- Simplicity over completeness.
- Prefer convention over abstraction.
- Avoid premature optimization.
- Build only what is explicitly documented.
- Everything must support the MVP goal.
- Always optimize for shipping quickly.

---

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Bun (development and deployment runtime)
- Fly.io (deployment)
- Neon PostgreSQL
- Drizzle ORM
- Better Auth
- Razorpay
- TanStack Query
- Zod
- React Hook Form

---

## UI Guidelines

- Minimal
- Light theme only
- White backgrounds
- Neutral gray palette
- shadcn/ui components
- Mobile-first
- Responsive
- Accessible
- Light minimal shadcn theme only
- Accessible labels
- Consistent spacing

---

## Coding Standards

### General

- TypeScript everywhere (no `any` unless explicitly justified)
- Bun as package manager/runtime for local development
- Prefer async/await
- Keep files under ~300 lines where practical
- Keep files small
- Prefer composition
- Never duplicate business logic

### Architecture

- Business logic belongs in `services/`
- Database access belongs in `repositories/`
- Routes/controllers should orchestrate only
- Validate every request with Zod
- Reuse shared types and schemas from `server/types` and `server/schemas`

### File & Naming Conventions

**Files:** kebab-case.ts **Components:** PascalCase.tsx **Variables/functions:** camelCase **Enums:** PascalCase **Constants:** UPPER_SNAKE_CASE

### React

- Server Components by default
- Client Components only when required
- Functional React components
- Prefer composition
- Reuse shadcn/ui components wherever possible

### API

**Response Format (Success):**

```json
{
  "success": true,
  "data": {}
}
```

**Response Format (Error):**

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

### Database

- UUID primary keys
- Store money in rupees (INTEGER)
- Never mutate wallet ledger or donation history
- Use transactions for multi-step writes

### Logging

**Log:**

- Payment webhooks
- CRON runs
- Payout generation
- Authentication failures

**Never log:**

- Secrets or payment tokens

---

## Do NOT Build (MVP Scope)

- Mobile app
- NGO dashboard
- Referral system
- Social feed
- Comments
- Gamification
- AI features
- Notifications beyond essential emails
- CMS
- Multi-admin roles
- NGO self-service portal

---

## Decision Framework

For any feature or implementation question:

1. **Is it documented?** Build it.
2. **Is it explicitly out of scope?** Don't build it.
3. **Will it ship faster without it?** Skip it.
4. **Does it support the MVP goal?** Only then consider it.

**When in doubt: keep it simple.**
