# 1Rupee — Codebase Guide

**India's simplest recurring giving platform for daily micro-donations.**

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server (port 8080)
bun dev

# Run tests
bun test

# Run Storybook (port 6006)
bun storybook
```

## Architecture

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS + class-variance-authority
- **Components**: Custom UI components in `components/ui/` (Button, Card, Badge, Dialog, etc.)
- **Markdown**: React-markdown for rendering campaign descriptions
- **Toasts**: Sonner for notifications
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth 1.6.23 (phone OTP, email-based)
- **API**: Route handlers in Next.js (REST endpoints)
- **Validation**: Zod schemas

### Key Routes
- `/dashboard` — User dashboard with pledges overview
- `/dashboard/pledges` — Manage user pledges (pause, cancel, resume)
- `/dashboard/wallet` — Wallet balance and top-up
- `/dashboard/donations` — View donation history
- `/campaigns` — Browse and pledge to campaigns
- `/sign-in` — Authentication

## Development Workflow

### Dev Login (Local Testing)
- Phone: Any number
- OTP: `0000`
- Better Auth is configured in dev to accept this for testing

### Close all `bun` processes before running dev server
```bash
# On Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*bun*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force
```

## Project Structure

```
app/                    # Next.js App Router
├── dashboard/          # Protected dashboard routes
│   ├── page.tsx        # Overview (active pledges, impact)
│   ├── pledges/        # Manage pledges with dialogs & confetti
│   ├── wallet/         # Wallet balance & top-up
│   ├── donations/      # Donation history
│   └── layout.tsx      # Dashboard layout with nav
├── campaigns/          # Browse campaigns
├── sign-in/            # Auth flow
└── layout.tsx          # Root layout

components/            # Reusable components
├── ui/                # Shadcn-style UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx     # Custom modal dialog
│   └── ...
└── confetti.tsx       # Celebration animation

lib/
├── auth-client.ts     # Better Auth client setup
├── dashboard.ts       # Dashboard data helpers
├── public.ts          # Public utilities (formatInr)
└── utils.ts           # Tailwind merge utilities

db/
├── schema.ts          # Drizzle schema definitions
├── seed.ts            # Database seeding
└── index.ts           # DB connection

public/               # Static assets
├── logo.png
├── lineunder.svg      # Decorative underline
├── wavebg.svg         # Wave background
└── illustrations/     # Campaign & dashboard illustrations
```

## Key Features & UI Patterns

### Dashboard (Main Overview)
- Centered, friendly greeting with user's first name
- "Currently Supporting" cards showing active pledges
- "Your Generosity Funded For" section with runway calculation
- "Your Impact" stats showing total raised
- Empty state for users with no pledges: "Start Your Impact Journey"
- Color scheme: Primary blue `#4077A4`, kalam font for headings

### Pledges Page
- Matches dashboard's centered, elegant style
- Shows all pledges (ACTIVE, PAUSED, CANCELLED)
- Pause/Cancel buttons in one row; Cancel is ghost variant
- Confirmation dialogs with emotional appeals
- Resume button is "hero" style with sparkles: `✨ Resume Supporting ✨`
- Confetti animation + celebration message on resume
- Toast notifications on success/error

### Donations Display
- Donations grouped by month (collapsed view)
- Expandable to daily view
- Shows actual daily amounts, not full pledge upfront

## Important Notes

### Auth & Sessions
- Uses Better Auth for phone/email OTP
- Session persists via secure cookies
- Dashboard routes require authentication (redirects to `/sign-in` if not logged in)
- In dev, use phone `0000` as OTP for any number

### API Conventions
- Dashboard API endpoints: `/api/dashboard/*`
- Pledges: GET `/pledges`, PATCH `/pledges/:id`
- Wallet: GET `/wallets`, POST `/wallet/topup`
- Donations: GET `/donations`

### Styling
- Tailwind CSS with custom theme
- CSS variables for primary color (`--primary` = `#4077A4`)
- Custom fonts: Kalam (headings), Instrument Sans (body)
- Responsive: `sm:` breakpoint at 640px

### Database
- Drizzle ORM for type-safe queries
- PostgreSQL connection via environment variables
- Seed database: `bun run db/seed.ts`
- Generate migrations: `bun run db:generate`
- Push to database: `bun run db:push`

## Common Commands

```bash
# Development
bun dev              # Start dev server (8080)
bun lint             # Run ESLint
bun type-check       # TypeScript type checking
bun test             # Run Vitest
bun test:ui          # Vitest with UI
bun test:coverage    # Coverage report

# Storybook (component docs)
bun storybook        # Start Storybook (6006)
bun build-storybook  # Build Storybook

# Database
bun run db:seed      # Seed database
bun run db:generate  # Generate migrations
bun run db:push      # Apply migrations
bun run db:studio    # Drizzle Studio UI

# Production
bun build            # Build for production
bun start            # Start production server
```

## Deployment

- **Host**: Fly.io (single container)
- **Port**: 8080
- **Entrypoint**: Must run via `bun` not `node`
- **Auto-deploy**: On push to `main` branch
- **Cron Jobs**: Wallet processing via GitHub Actions (secrets in "production" environment)
- **Alerts**: Via Resend to `ADMIN_EMAIL` (ayushsaran@gmail.com)

## Testing & Review

- **Tests**: Vitest for unit tests
- **Coverage**: Run `bun test:coverage`
- **Type Safety**: TypeScript + Zod validation
- **Linting**: ESLint with flat config
- **Storybook**: For UI component development and documentation

## Common Development Tasks

### Add a new UI component
1. Create in `components/ui/ComponentName.tsx`
2. Add Storybook story in `components/ui/stories/ComponentName.stories.ts`
3. Document with JSDoc comments

### Update dashboard data
1. Edit helpers in `lib/dashboard.ts`
2. Update API endpoints in `app/api/dashboard/*`
3. Update component state in dashboard page

### Change styling
- Use Tailwind classes or update `globals.css`
- CSS variables use `hsl(var(--primary))` format
- Update theme in `tailwind.config.ts` if needed

### Debug database
- Use `bun run db:studio` to browse data with Drizzle UI
- Check migrations in `drizzle/` folder
- Verify schema in `db/schema.ts`
