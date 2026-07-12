# Phase 8 Implementation Plan — Pledge Checkout Flow

## Overview

Enable authenticated users to pledge to a campaign by selecting a tier, choosing a plan duration (3/6/12 months), and completing a mock payment. The flow creates a pledge record, deducts the first month's amount from the user's wallet, and logs a donation.

## User Flow

```
Campaign Page (public)
  ↓ [Select Tier + click "Pledge Now"]
Tier Details + Plan Selection Page
  ↓ [Select 3/6/12 months or custom 1-12 months]
Cart/Review Page (shows total price: daily_amount × days)
  ↓ [Click "Checkout"]
Mock Payment Page
  ↓ [Enter mock card details, submit]
  ├─ Success → Success Page (show pledge + transaction details)
  └─ Failure → Cart Page (show error, offer retry)
  
Success Page
  ├─ Links: "Go to Dashboard" / "See More Campaigns"
```

## Database Schema

### New Columns (if needed)
- None required; use existing `pledges` and `donations` tables.

### Relevant Tables
- `pledges`: Stores pledge records (campaign_tier_id, user_id, status, started_at, etc.)
- `donations`: Stores individual donation records (pledge_id, amount, donated_at)
- `wallets`: User wallet balances
- `wallet_transactions`: Ledger of top-ups, deductions, refunds

## API Endpoints

### 1. POST /pledges
**Purpose**: Create a new pledge and deduct first month's amount from wallet.

**Request**:
```json
{
  "campaign_tier_id": "uuid",
  "plan_length_months": 6,
  "reference_id": "uuid"  // for idempotency + payment tracking
}
```

**Response (success)**:
```json
{
  "success": true,
  "data": {
    "pledge": {
      "id": "pledge-id",
      "campaign_tier_id": "tier-id",
      "user_id": "user-id",
      "status": "ACTIVE",
      "started_at": "2026-07-10T...",
      "campaign_title": "...",
      "tier_title": "...",
      "daily_amount": 100
    },
    "transaction": {
      "id": "txn-id",
      "amount": 9000,  // ₹100/day × 90 days
      "type": "DONATION",
      "description": "First month pledge to [Campaign] at [Tier]"
    },
    "wallet_balance_after": 55459
  }
}
```

**Error cases**:
- 400: Invalid campaign_tier_id or plan_length_months
- 401: User not authenticated
- 409: User already has an active pledge to this campaign tier
- 402: Insufficient wallet balance (suggest top-up link)
- 500: Transaction failed (wallet debit failed, etc.)

**Validations**:
1. User is authenticated
2. campaign_tier_id exists and belongs to an ACTIVE campaign
3. plan_length_months is 1–12
4. User wallet balance ≥ (tier.daily_amount × plan_length_months × days_in_plan)
5. User doesn't already have an ACTIVE pledge to this tier (can't have duplicates)

**Logic**:
1. Calculate amount_to_charge = tier.daily_amount × (plan_length_months × 30 rounded up or actual calendar days)
2. Check wallet balance ≥ amount_to_charge
3. Create pledge record with status=ACTIVE, started_at=now, plan_length_months
4. Deduct from wallet (POST /wallets/debit or POST /wallets/topup with negative amount)
5. Create donation record with amount=amount_to_charge, donated_at=now, pledge_id
6. Return pledge + transaction details

### 2. GET /campaigns/:id
**Update**: Include all tiers in the response so the campaign detail page can show them inline.

**Current response**: Should already include tiers; verify `apps/api/src/routes/campaigns.ts` returns `campaign_tiers` joined.

## Frontend Pages

### 1. Campaign Detail Page (`apps/web/app/campaigns/[slug]/page.tsx`)

**Current state**: Likely shows campaign details but not tier selection.

**Changes**:
- Add tier cards below campaign description
- Each tier card shows:
  - Title, daily_amount, features (JSON array → bullet list)
  - "Pledge Now" button (only if user is authenticated)
- On unauthenticated user click: redirect to `/auth/sign-in`
- On authenticated user click: navigate to `/checkout/tier-select?tier_id=<tier-id>&campaign_id=<campaign-id>`

**Code structure**:
```tsx
// Inside campaign detail page:
{campaign.tiers?.map((tier) => (
  <TierCard key={tier.id} tier={tier} campaignId={campaign.id} />
))}

// TierCard component:
<button onClick={() => {
  if (!session?.user) {
    router.push('/auth/sign-in');
    return;
  }
  router.push(`/checkout/tier-select?tier_id=${tier.id}&campaign_id=${campaign.id}`);
}}>
  Pledge Now
</button>
```

### 2. Plan Selection Page (`apps/web/app/checkout/tier-select/page.tsx`)

**Purpose**: Show selected tier + plan duration options.

**URL params**: `tier_id`, `campaign_id`

**On load**:
1. Fetch campaign + tier details (GET /campaigns/:id, extract tier from tiers array)
2. Show tier card (title, daily_amount, features, impact_description)
3. Show three preset plan buttons (3 months, 6 months, 12 months)
4. Show custom plan input (min 1, max 12 months)
5. Live calculation: show "Total: ₹X for Y days"

**On select plan**:
- Validate plan_length ≥ 1 and ≤ 12
- Check user wallet balance via GET /wallets
- If insufficient: show error "You need ₹X more. [Top up wallet]" (link to /dashboard/wallet/topup)
- If sufficient: navigate to `/checkout/cart?tier_id=<tier_id>&plan_length=<months>`

**Code**:
```tsx
const presetPlans = [
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 }
];

const daysInPlan = months * 30; // Simplified; could use actual calendar
const totalPrice = tier.daily_amount * daysInPlan;

// When user clicks next:
if (wallet.cached_balance < totalPrice) {
  setError(`Insufficient balance. You need ₹${(totalPrice - wallet.cached_balance) / 100} more.`);
  return;
}
router.push(`/checkout/cart?tier_id=${tier_id}&plan_length=${months}`);
```

### 3. Cart/Review Page (`apps/web/app/checkout/cart/page.tsx`)

**Purpose**: Final review before payment. Handle wallet insufficiency with inline/redirect top-up.

**URL params**: `tier_id`, `plan_length`

**Display**:
- Campaign name (from tier.campaign_id → fetch campaign)
- Tier title, daily amount, features
- Plan duration (X months)
- Total price calculation: `daily_amount × plan_length × 30`
- Wallet balance current + after pledge
- Summary: "You'll be charged ₹X today for a 6-month pledge to [Campaign] at [Tier]."

**Wallet Validation**:
- If balance ≥ total price: show [Checkout] button
- If balance < total price:
  - Show "Insufficient balance" error
  - Show a "Top up wallet" form with:
    - Amount input (suggest the shortfall)
    - Quick buttons (₹100, ₹500, ₹1000)
    - "Add funds" button (simulates mock payment like /dashboard/wallet/topup)
  - OR link to `/dashboard/wallet/topup?redirect_to=/checkout/cart?tier_id=X&plan_length=Y`
  - After successful top-up, stay on cart page with updated balance, ready to [Checkout]

**Actions**:
- [Back] → goes to tier-select
- [Add funds] → mock payment → update wallet balance on this page
- [Checkout] → navigate to `/checkout/payment?tier_id=<tier_id>&plan_length=<months>`

**Code sketch**:
```tsx
const totalPrice = tier.daily_amount * plan_length * 30;
const balanceAfter = wallet.cached_balance - totalPrice;
const shortfall = Math.max(0, totalPrice - wallet.cached_balance);

if (shortfall > 0) {
  return (
    <div>
      <p>Insufficient balance. You need ₹{formatPaisa(shortfall)} more.</p>
      {/* Inline top-up form OR link to dashboard/wallet/topup */}
      <TopupForm shortfall={shortfall} onSuccess={refetchWallet} />
    </div>
  );
}

// Sufficient balance
return (
  <div>
    <h2>{campaign.title}</h2>
    <p>Balance: ₹{formatPaisa(wallet.cached_balance)}</p>
    <p>After pledge: ₹{formatPaisa(balanceAfter)}</p>
    <button onClick={() => router.push(`/checkout/payment?...`)}>
      Checkout
    </button>
  </div>
);
```

### 4. Mock Payment Page (`apps/web/app/checkout/payment/page.tsx`)

**Purpose**: Simulate Razorpay payment. Accept any input for testing.

**URL params**: `tier_id`, `plan_length`

**Display**:
- Order summary (campaign, tier, amount, plan)
- Mock payment form:
  - Card number (any 16 digits, no validation)
  - Cardholder name
  - Expiry (MM/YY)
  - CVV
- "Pay ₹X" button
- Success/error messages

**Logic**:
1. On submit, show loading state
2. Delay 2 seconds (simulate network)
3. 90% success rate (random choice for testing both paths)
   - Success: redirect to `/checkout/success?pledge_id=<pledge_id>&tier_id=<tier_id>`
   - Failure: show error "Payment declined. Insufficient funds." → offer [Retry] or [Back to Cart]

**Code**:
```tsx
async function handlePayment(e) {
  e.preventDefault();
  setLoading(true);
  
  // Fetch tier + campaign for order details
  const tier = await fetchTier(tier_id);
  const campaign = await fetchCampaign(tier.campaign_id);
  const totalPrice = tier.daily_amount * plan_length * 30;
  
  // Simulate delay
  await new Promise(r => setTimeout(r, 2000));
  
  // Mock success/failure (90% success)
  const success = Math.random() < 0.9;
  
  if (success) {
    // Call POST /pledges
    const result = await pledgesRequest('POST', '/pledges', {
      campaign_tier_id: tier_id,
      plan_length_months: plan_length,
      reference_id: crypto.randomUUID()
    });
    
    if (result.success) {
      router.push(`/checkout/success?pledge_id=${result.data.pledge.id}`);
    } else {
      setError(result.error.message);
    }
  } else {
    setError('Payment declined. Insufficient funds.');
    setLoading(false);
  }
}
```

### 5. Success Page (`apps/web/app/checkout/success/page.tsx`)

**Purpose**: Confirm pledge creation and show transaction details.

**URL params**: `pledge_id`

**On load**:
1. Fetch pledge details (GET /pledges/:id or from cached result)
2. Display:
   - Checkmark icon + "Pledge Successful!"
   - Campaign + Tier + Plan length
   - Amount charged + wallet balance after
   - Transaction ID (for support)
   - "You're now supporting [Campaign]! A ₹X donation will be charged each month for the next X months."

**Actions**:
- [Go to Dashboard] → `/dashboard`
- [See More Campaigns] → `/campaigns` (or `/campaigns?category=...` if applicable)

**Code**:
```tsx
const pledge = pledgeData; // From URL param or fetched
const campaign = pledge.campaign_title;
const tier = pledge.tier_title;

return (
  <div className="text-center space-y-6">
    <div className="text-4xl">✓</div>
    <h1>Pledge Successful!</h1>
    <p>You're now supporting <strong>{campaign}</strong></p>
    <p>Tier: {tier} • ₹{formatPaisa(pledge.daily_amount)}/day</p>
    <p>Plan: {pledge.plan_length_months} months</p>
    <p className="text-lg font-bold">Charged: ₹{formatPaisa(totalPrice)}</p>
    <p className="text-sm text-slate-600">Transaction ID: {pledge.id}</p>
    <div className="space-y-2">
      <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      <button variant="secondary" onClick={() => router.push('/campaigns')}>See More Campaigns</button>
    </div>
  </div>
);
```

## Implementation Status ✅

### Backend
- [x] Create POST /pledges endpoint with validations (campaign_tier_id, plan_length_months)
- [x] Wallet balance validation before pledge creation
- [x] Wallet deduction via transaction system
- [x] Donation logging on pledge creation (full amount for entire duration)
- [x] Error handling: tier not found, wallet not found, insufficient balance, duplicate pledge
- [x] Tests for pledge creation scenarios (success, insufficient balance, duplicate, invalid inputs)
- [x] Database migration: added plan_length_months and updated_at columns to pledges

### Frontend
- [x] Campaign detail page: TierCard component with "Pledge Now" button
- [x] Tier select page: preset options (3/6/12 months) + custom duration input (1-12 months)
- [x] Price calculation: daily_amount × plan_length × 30 days
- [x] Wallet balance display and validation
- [x] Cart page: order review with campaign/tier/duration/total
- [x] Cart page: inline wallet top-up with quick buttons (₹100, ₹500, ₹1000) and custom amount
- [x] Payment page: simplified to "Proceed to Payment" button (Razorpay ready)
- [x] Success page: pledge confirmation with transaction details
- [x] Error handling: specific error messages for all failure scenarios
- [x] Auth check: redirect unauthenticated users to /sign-in

### UX Improvements
- [x] Auth routes restructured: /auth/sign-in → /sign-in, /auth/verify → /verify
- [x] Footer positioning: fixed footer floating on short pages with flexbox layout
- [x] Cart page error handling: non-blocking wallet fetch with loading state
- [x] Payment page error display: shows specific API errors with retry option
- [x] Duration selection: no default selection, user must explicitly choose

### Testing
- [x] 5 integration tests in apps/api/src/__tests__/checkout.test.ts
- [x] Tests cover: validation errors, plan length validation, missing fields, auth requirements

## Known Issues & Future Work

### Donation Display
Currently, when a user pledges for multiple months, the full amount is logged as a single donation record. This should be improved to show daily donations grouped by month for better transparency. See [[donation-display]] in memory for details.

### Daily Donation Processing
The current system logs donations upfront. A future daily processing job (CRON) should:
- Create individual daily donation records as pledges process
- Replace the upfront donation logging
- Enable monthly grouping in the UI

### Razorpay Integration
The payment page is currently a simplified "Proceed to Payment" button. Future work:
- Replace with real Razorpay Checkout.js
- The upstream flow (tier selection → plan → cart) requires no changes
- Only the payment page logic needs updating

### Plan Length Enforcement
The daily CRON should verify pledges don't charge past their plan_length_months end date. Current implementation doesn't enforce this cutoff.

## Architecture Notes

- **Idempotency**: reference_id ensures retries don't double-charge
- **Wallet ledger**: All transactions logged via wallet_transactions table
- **Auth routes**: Moved from /auth/* to root-level routes (/sign-in, /verify)
- **Footer positioning**: Fixed via flexbox layout on body (min-height 100vh with flex column)
