# Design Guidelines

## OneRupeeProject

Version 1.0

---

# Design Philosophy

The UI should feel closer to:

- Vercel
- Linear
- Arc Browser
- Stripe Dashboard
- GitHub

NOT

- Bootstrap Admin Templates
- Material Dashboard
- Enterprise CRUD software

The goal is to feel calm, fast, modern and uncluttered.

Every screen should communicate only what the user needs right now.

---

# Core Principles

## Less UI

If something can be removed, remove it.

Whitespace is useful.

Empty boxes are not.

---

## Progressive Disclosure

Do not show every piece of information.

Show:

Essential

↓

Expandable

↓

Advanced

Campaign ID should not appear above campaign title.

---

## Density

Optimize for desktop.

Use horizontal space.

Avoid long vertical pages.

Prefer

2-column

3-column

or

split layouts

instead of stacking cards.

---

## One Primary Action

Every page should answer:

"What is the user supposed to do?"

Only one button should visually dominate.

Example

Campaign Page

Primary

Save Changes

Secondary

Archive

Delete

---

# Layout

Maximum content width

1400px

Never stretch forms across the entire monitor.

---

## Spacing Scale

Use only

4

8

12

16

24

32

48

No random spacing values.

---

## Grid

Desktop

12-column grid

Large forms

2 columns

Statistics

4-column cards

Lists

Full width

---

# Typography

Use

Geist

or

Inter

Sizes

Page Title

32

Section Title

20

Card Title

16

Body

14

Caption

12

Never exceed 3 font weights.

400

500

600

---

# Cards

Avoid cards inside cards.

Most pages should have

1 outer container

with sections inside.

Padding

20–24px

Radius

12px

Border

1px neutral

Shadow

Very subtle

---

# Tables

Prefer tables over large forms.

Example

Support Tiers

Instead of

4 giant cards

Use

---

## Tier Daily Monthly Active

Daily ₹1 ₹30 ✓ Lunch ₹10 ₹300 ✓ Community ₹35 ₹1000 ✓

---

Edit opens a drawer.

---

# Forms

Split into logical sections.

Campaign

---

Basic Information

Media

Support Tiers

Publishing

Never show 30 inputs at once.

---

# Navigation

Sidebar

240px

Icons

18px

Collapsed mode supported.

Top navigation should be minimal.

---

# Colors

Background

White

Cards

White

Borders

Neutral 200

Text

Neutral 900

Muted text

Neutral 500

Accent

Green

Only use red

for destructive actions.

---

# Icons

Lucide Icons only.

18–20px

Never decorative.

Every icon must communicate meaning.

---

# Buttons

Primary

Solid

Secondary

Outline

Danger

Destructive

No gradients.

No shadows.

---

# Statistics

Use compact stat cards.

Instead of

Huge KPI blocks

Use

---

Raised

## ₹1.2L

Height

80px

Maximum

4 cards per row.

---

# Empty States

Every empty state should explain:

Why it is empty.

What action to take.

Provide one CTA.

---

# Responsive

Mobile first.

Desktop should feel information dense.

Do not simply stack every card vertically.

---

# Animations

Subtle only.

100–200ms

Opacity

Translate

No bouncing.

No scaling.

---

# Component Library

Always use shadcn/ui.

Preferred components

Card

Table

Badge

Dialog

Drawer

Popover

Dropdown

Sheet

Tabs

Command

ScrollArea

Tooltip

Toast

Avoid custom implementations.

---

# AI Agent Instructions

When generating UI:

- Prefer fewer components.
- Remove unnecessary text.
- Reduce visual noise.
- Maximize information density.
- Minimize scrolling.
- Avoid nested cards.
- Avoid oversized typography.
- Avoid large empty areas.
- Think like Linear, not Salesforce.
- Reuse existing components before creating new ones.

Every screen should feel like a professional SaaS product rather than an admin template.
