# Mobile-Friendly Dashboard Guide

## Overview

The 1Rupee dashboard has been redesigned with a mobile-first approach using shadcn/ui components. All pages are now fully responsive and optimized for small screens while maintaining a beautiful experience on desktop.

## Design Principles

- **Mobile-first**: Build for small screens first, enhance for larger screens
- **Touch-friendly**: Adequate touch targets (minimum 44x44px for buttons)
- **Responsive layouts**: Use flexbox and grid to adapt to screen sizes
- **Component consistency**: Use shadcn/ui components throughout
- **Minimal scrolling**: Optimize layouts to reduce vertical scrolling on mobile
- **Clear hierarchy**: Typography scales based on screen size

## Responsive Breakpoints

We use Tailwind CSS breakpoints:
- **sm**: 640px (small devices)
- **md**: 768px (tablets, large phones)
- **lg**: 1024px (desktops)

## Component Updates

### Navigation

The dashboard navigation is now mobile-aware:
- **Mobile (< 768px)**: Hamburger menu icon that toggles a full-width dropdown menu
- **Desktop (≥ 768px)**: Horizontal navigation bar with pill-shaped buttons

```tsx
// Mobile menu button
<Button variant="ghost" size="icon" className="md:hidden">
  <Menu className="h-5 w-5" />
</Button>

// Desktop nav
<nav className="hidden flex-1 gap-1 md:flex">
  {/* Nav items */}
</nav>
```

### Cards

All content sections use shadcn Card component for consistency:

```tsx
import { Card } from "@/components/ui/card";

<Card className="p-6">
  {/* Content */}
</Card>
```

Cards have padding of 6 units (24px) which works well on both mobile and desktop.

### Forms

Form inputs use the shadcn Input component with proper spacing:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-700">Label</label>
  <Input type="text" placeholder="..." />
</div>
```

Forms stack vertically on mobile and remain single-column on all sizes for better readability.

### Buttons

Buttons are responsive based on context:

```tsx
// Full-width on mobile, auto-width on desktop
<Button className="w-full sm:w-auto">
  Action
</Button>

// Stack vertically on mobile
<div className="flex flex-col gap-2 sm:flex-row">
  <Button className="w-full sm:w-auto">Action 1</Button>
  <Button className="w-full sm:w-auto">Action 2</Button>
</div>
```

## Page-Specific Layouts

### Dashboard Home (`/dashboard`)

Shows key metrics and active pledges:
- Wallet balance card (emerald-tinted)
- Active pledges summary

**Mobile layout**: Stacked vertically
**Desktop layout**: Same layout, larger typography

### Wallet (`/dashboard/wallet`)

Displays balance and recent transactions:
- Available balance card
- Top-up button (full-width on mobile)
- Transaction list (horizontal on desktop, vertical on mobile)

**Responsive transaction items**:
```tsx
<li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
  <div>/* Transaction details */</div>
  <span className="shrink-0">/* Amount */</span>
</li>
```

### Pledges (`/dashboard/pledges`)

Lists all user pledges with action buttons:
- Mobile: Buttons stack vertically below pledge details
- Desktop: Buttons appear to the right in a row

**Responsive pledge item**:
```tsx
<li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex-1">/* Pledge info */</div>
  <div className="flex flex-col gap-2 sm:flex-row">
    {/* Buttons */}
  </div>
</li>
```

### Donations (`/dashboard/donations`)

Collapsible donation history grouped by month:
- Month headers with total and donation count
- Expandable daily donations
- Responsive donation list items

**Daily donation item**:
```tsx
<div className="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex-1 min-w-0">/* Date and details */</div>
  <p className="font-semibold shrink-0">/* Amount */</p>
</div>
```

### Profile (`/dashboard/profile`)

Edit user information:
- Profile summary card
- Edit form with all inputs stacked
- Buttons full-width on mobile

**Profile info layout**:
```tsx
<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
  <Avatar />
  <div>/* User info */</div>
</div>
```

### Wallet Top-up (`/dashboard/wallet/topup`)

Amount selection and custom input:
- Preset amount buttons in 3-column grid on mobile
- Inline buttons on desktop
- Custom amount input field
- Submit button full-width

**Preset buttons**:
```tsx
<div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
  {/* Buttons */}
</div>
```

## Typography Scaling

Text scales responsively:

```tsx
// Responsive heading sizes
<h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
  Heading
</h1>

// Large amount display
<p className="text-3xl font-bold sm:text-4xl">
  ₹1,234
</p>
```

- Mobile headings: 24px (text-2xl)
- Desktop headings: 30px (text-3xl)
- Mobile large amounts: 30px (text-3xl)
- Desktop large amounts: 36px (text-4xl)

## Spacing & Layout

Consistent spacing system:
- `space-y-6`: Large sections
- `space-y-4`: Medium sections
- `space-y-3`: Small sections
- `gap-2`: Compact horizontal gaps
- `gap-4`: Medium horizontal gaps

## Error States

Error messages use Card component with red styling:

```tsx
<Card className="border-red-200 bg-red-50 p-4">
  <p className="text-sm text-red-700">{error}</p>
</Card>
```

Same pattern for success and warning states with appropriate colors.

## Testing Mobile Responsiveness

### Using Chrome DevTools

1. Press F12 to open DevTools
2. Click the mobile device toggle (Ctrl+Shift+M)
3. Test at common breakpoints:
   - **iPhone SE**: 375x667
   - **iPhone 12**: 390x844
   - **iPad**: 768x1024

### Common mobile issues to check

- [ ] Navigation menu toggles properly
- [ ] Form inputs are full-width and touch-friendly
- [ ] Buttons have adequate spacing
- [ ] Text is readable (minimum 16px)
- [ ] Images scale properly
- [ ] No horizontal scroll
- [ ] Touch targets are ≥44x44px

## Building on Mobile-First Design

When adding new features to the dashboard:

1. **Start with mobile layout**: Design and implement mobile first
2. **Use Tailwind breakpoints**: Add `sm:`, `md:`, etc. for responsive changes
3. **Test on real devices**: Use Chrome DevTools responsive mode
4. **Use shadcn components**: Ensure consistency
5. **Follow spacing patterns**: Use the established space and gap utilities
6. **Make buttons and inputs full-width on mobile**: Better touch targets
7. **Stack layouts vertically on mobile**: Reduce horizontal scrolling

## Example: New Feature Checklist

```tsx
// 1. Use Card for sections
<Card className="p-6">
  {/* Content */}
</Card>

// 2. Responsive text
<h2 className="text-xl font-semibold sm:text-2xl">Heading</h2>

// 3. Responsive layout
<div className="flex flex-col gap-4 sm:flex-row">
  {/* Stack vertical on mobile, horizontal on desktop */}
</div>

// 4. Full-width buttons on mobile
<Button className="w-full sm:w-auto">Action</Button>

// 5. Touch-friendly spacing
<div className="space-y-4">
  {/* Items with 16px spacing */}
</div>
```

## Performance Considerations

- Mobile-first CSS is naturally lighter (base styles are minimal)
- Conditional rendering using `hidden md:block` instead of conditional imports
- Leverage Tailwind's purging to remove unused styles
- Images are lazy-loaded where applicable

## Accessibility

All pages maintain WCAG 2.1 AA accessibility:
- Proper heading hierarchy
- Color contrast ratios (WCAG AA minimum)
- Touch targets ≥44x44px
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation supported

## Future Enhancements

Potential mobile improvements:
- Pull-to-refresh for transaction lists
- Swipe gestures for pledges list
- Bottom sheet for action menus (instead of dropdowns)
- Haptic feedback for button presses (on supported devices)
- Offline support for transaction history
