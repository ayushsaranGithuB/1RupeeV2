# Frontend

## Framework & Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

---

## Design System

**Theme:** Light only (no dark mode for MVP)

**Colors:**

- White backgrounds
- Neutral grays
- Green as primary accent
- Red only for destructive actions

**Spacing:** 4/8/16/24/32 scale **Radius:** lg **Typography:** Geist or Inter with clear hierarchy and comfortable whitespace

**No gradients or custom styling.**

---

## Page Routes

### Public Pages

- `/` — Landing page
- `/about` — About page
- `/campaigns` — Campaign listing
- `/campaigns/[slug]` — Campaign detail
- `/login` — Login
- `/transparency` — Transparency widget
- `/faq` — FAQ

### Authenticated Dashboard

- `/dashboard` — Home (wallet balance, donation runway, active tiers, recent activity)
- `/dashboard/wallet` — Wallet management and top-up
- `/dashboard/pledges` — My Support (view, add, pause, resume, remove pledges)
- `/dashboard/donations` — Donation history with year filtering
- `/dashboard/profile` — Profile management and authentication

### Admin Dashboard

- `/admin` — Admin dashboard (stats overview)
- `/admin/ngos` — NGO management
- `/admin/campaigns` — Campaign management
- `/admin/users` — User management
- `/admin/payouts` — Payout management

---

## Core Components

Navbar, Footer, CampaignCard, SupportTierCard, WalletCard, StatsCard, DataTable, EmptyState, Dialog, Form, Pagination, SearchBar, Badge, Avatar, Toast

**Rule:** Reuse shadcn components whenever possible. Avoid custom components unless necessary.

---

## State Management

- Server Components by default
- Client Components only when necessary
- TanStack Query only for authenticated dashboard interactions
- React Hook Form + Zod for all forms

---

## Empty States

Provide friendly onboarding when:

- No wallet balance
- No pledges
- No donations

Guide users to discover campaigns.

---

## Layout Principles

- Mobile-first
- Responsive
- Accessible
- Fast and uncluttered
- Keep pages thin
- Keep dashboard clean and minimal

---

## Coding Standards

- Use Server Components by default
- TypeScript everywhere
- Functional React components
- Validate all input with Zod
- Use React Hook Form for forms
- Keep files small
- Prefer composition
- Never duplicate business logic
- Feature-specific UI grouped by domain
- Components under components/
- Forms use React Hook Form + Zod
- Use shadcn/ui wherever possible
- Mobile-first layouts
- Light minimal white theme
