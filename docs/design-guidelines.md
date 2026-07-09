# Design Guidelines

## OneRupee Admin UI

Version 1.1

## Product Direction

The admin should feel like a focused operations console.

Reference product qualities:

- Fast and calm
- Dense but readable
- Workflow-first
- Minimal decoration

Avoid:

- Marketing-style hero sections inside admin pages
- Large decorative cards as primary content pattern
- Long stacked forms with no grouping

## Core UX Rules

### 1) One Primary Action

Each screen should have one clear primary CTA in solid green. Examples:

- Campaign workspace: Save Changes
- Report publishing: Publish
- Payout workflow: Generate Payout or Mark Complete (context dependent)

Secondary actions use outline buttons. Destructive actions use red text/border treatment.

### 2) Table-First Operations

Default to tables for lists, queues, and history. Use card grids only when visual scanning is materially better.

Primary table use cases:

- Users list
- NGO list
- Donation and ledger feeds
- Payout queue
- Reports index
- Tier listings

### 3) Progressive Disclosure

Show essentials first; push metadata and advanced controls lower. Do not lead with IDs or backend fields.

### 4) Workflow Split

Where needed, split workflows into dedicated routes:

- Campaign list page: browse/filter/open only
- Create campaign page: creation form only
- Campaign detail page: workspace tabs (Overview, Support Tiers, Analytics, Settings)

## Layout System

### Width and Spacing

- Max content width: 1400px
- Standard page rhythm: compact vertical spacing (primarily 16px blocks)
- Prefer horizontal toolbars with wrap on smaller screens

### Containers

- Use one main surface per section: rounded-xl, neutral border, white background
- Avoid card-within-card chains
- For grouped content inside a surface, use subtle dividers and rounded-lg inner blocks

### Header Pattern

Use this order:

1. Breadcrumb-like context line (example: Admin / Users)
2. Page title
3. Optional top-right actions

## Typography

- Page title: 30px semibold
- Section title: 18px semibold
- Body: 14px
- Caption/meta: 12px
- Keep font weights restrained (400/500/600)

## Color and Visual Tokens

- App background: neutral light gray
- Primary surfaces: white
- Borders: neutral 200
- Main text: neutral 900
- Secondary text: neutral 500
- Accent: emerald for primary actions and links
- Error state: red border + pale red fill

## Form Design

- Keep forms in logical groups and compact rows
- Use 2-column layouts on desktop for medium/large forms
- Keep labels and placeholders clear and task-specific
- Never render large unstructured walls of inputs

## Filters and Search

- Place filters and search in one horizontal toolbar
- Toolbar must wrap for smaller breakpoints
- Keep filter controls width-constrained and consistent

## States

Every major section should visibly handle:

- Loading
- Empty
- Error
- Success/updated

Use inline states inside the relevant surface, not full-page blockers.

## Campaign Workspace Standard

The campaign detail experience is the model for complex admin workflows:

- Sticky mental model with tabs
- KPI strip first
- Editable content in scoped sections
- Tier and donation data shown in tables
- Save as the dominant action
- Publish/Archive as secondary actions

## Dashboard Standard

Dashboard should prioritize operator usefulness:

- Compact metrics row
- Quick links to high-frequency workflows
- Checklist/status area for operational coverage

Avoid oversized decorative stat cards.

## Accessibility and Responsiveness

- Maintain usable layouts through wide desktop ranges (including ~1500px)
- Keep action bars and filter rows wrapping cleanly
- Ensure touch targets and contrast remain accessible

## Consistency Rule

Any new admin page should reuse these patterns before introducing new visual language. If a deviation is needed, document why in the PR and update this file.
