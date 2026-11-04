---
name: Modern Financial Ledger
colors:
  surface: '#fafcfb'
  surface-dim: '#dad9e3'
  surface-bright: '#fafcfb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f7f4'
  surface-container: '#eef4f0'
  surface-container-high: '#e7efe9'
  surface-container-highest: '#dfe9e4'
  on-surface: '#1a1b22'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#2fa084'
  primary: '#2fa084'
  on-primary: '#ffffff'
  primary-container: '#2fa084'
  on-primary-container: '#c9eddd'
  inverse-primary: '#bfe9d8'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#dcefe7'
  on-secondary-container: '#656466'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9f2e7'
  primary-fixed-dim: '#bfe9d8'
  on-primary-fixed: '#052e20'
  on-primary-fixed-variant: '#1f6b4d'
  secondary-fixed: '#dcefe7'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1c1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fafcfb'
  on-background: '#1a1b22'
  surface-variant: '#dfe9e4'
  income: '#10b981'
  expense: '#f43f5e'
  budget-warning: '#f59e0b'
  budget-danger: '#e11d48'
  surface-bg: '#fafafa'
  surface-card: '#ffffff'
  surface-muted: '#f4f4f5'
  border-subtle: '#e4e4e7'
  text-strong: '#18181b'
  text-body: '#52525b'
  text-muted: '#71717a'
  cat-food: '#f97316'
  cat-transport: '#3b82f6'
  cat-shopping: '#b45309'
  cat-bills: '#f59e0b'
  cat-entertainment: '#ec4899'
  cat-health: '#14b8a6'
  cat-education: '#06b6d4'
  cat-income: '#10b981'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  currency-display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  currency-stat:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a focused, reassuring, and mathematically precise financial management experience for personal wealth and cashflow tracking. The emotional goal is immediate fiscal clarity: turning monetary anxiety into deliberate control through low visual noise, crisp typography, and unambiguous semantic color feedback.

The aesthetic philosophy is **Corporate Modern Minimalist with Structured Utility**. Built around clear borders, micro-elevation, and refined density, it rejects decorative fluff in favor of legibility and rapid data entry. 
- **Audience:** Detail-oriented individuals, modern professionals, and disciplined savers managing daily expenses, wallets, and monthly limits.
- **Personality:** Trustworthy, frictionless, analytical, and supportive.
- **Design Metaphor:** An engineered accounting cockpit—every badge, progress meter, and transaction row behaves like an instrument gauge with instant physical hierarchy.

## Colors

The palette leverages a structured neutral scale derived from cool zinc tones to let financial indicators speak without background vibration.

- **Primary (`#2fa084` - Indigo 600):** Anchors primary system actions, main navigation states, and primary submission buttons.
- **Semantic Ledger Status:**
  - **Income / Pemasukan (`#10b981`):** Applied exclusively to incoming cashflow, positive balance differentials, and healthy budget statuses.
  - **Expense / Pengeluaran (`#f43f5e`):** Applied to expenditure mutations, negative totals, and deficit states.
  - **Budget Warning (`#f59e0b`):** Triggers when category expenditure crosses the 80% utilization threshold.
- **Categorical Allocation:** Distinct non-overlapping hues represent individual expense verticals (`cat-food`, `cat-transport`, `cat-shopping`, `cat-bills`, etc.) on charts and category badges, keeping classification intuitive.
- **Neutrals & Surfaces:** Background is fixed to `#fafafa` (`zinc-50`), component cards to pure `#ffffff`, borders to hairline `#e4e4e7` (`zinc-200`), and primary data labels to `#18181b` (`zinc-900`).

## Typography

The type scale pairs the architectural precision of **Geist** for headlines and numeric displays with the neutral utility of **Inter** for long-form data, form labels, and list views.

- **Monetary Figures & Currency (IDR):** All currency displays (`Rp`) utilize `font-feature-settings: "tnum"` (tabular figures) across Geist to prevent column jitter when values update in real-time.
- **Hierarchy:** High-density data tables and transaction summaries prioritize compact, crisp font sizes (`body-md` at 14px, `body-sm` at 12px) paired with strong weight contrasts (600 vs 400) to separate amounts from category sub-labels.
- **Mobile Readability:** Viewport constraints scale major dashboard metrics down to readable, non-wrapping sizes (`headline-xl-mobile` and `headline-lg-mobile`).

## Layout & Spacing

The layout model is anchored to a dual-tier fluid grid system with structural maximum widths for computational readability.

- **Desktop Layout (≥1024px):**
  - **Sidebar:** Fixed width of `240px` with persistent navigation, quick wallet selector, and compact balance recap.
  - **Main Canvas:** Dynamic fluid area bounded by `max-w-[1200px]` with `2rem` (`32px`) lateral margins.
  - **Dashboard Grid:** 12-column system accommodating a 4-column Stat Card row, an 8-column Cash Flow Area Chart + 4-column Category Donut split, and a 6/6 or 7/5 split for Budget Progress and Recent Transactions.
- **Tablet Layout (768px – 1023px):**
  - Collapsible compact rail navigation with stacked 2-column KPI blocks.
- **Mobile Layout (&lt;768px):**
  - Pure single-column flow with `1rem` (`16px`) edge margin.
  - Persistent top greeting/total balance bar + sticky bottom navigation bar with 5 targets (Dashboard, Transaksi, Quick Add, Dompet, Lainnya).
  - Floating Action Button (FAB) or dedicated bottom center tab triggering a bottom drawer (`Sheet`).
  - Safe area inset padding applied at the bottom (`pb-24`) to guarantee zero occlusion between lists and sticky touch controls.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast micro-outlines** and **subtle ambient shadows** to establish depth without visual clutter.

- **Level 0 (Canvas Base):** Background (`#fafafa`) sits at depth zero.
- **Level 1 (Card & Content Blocks):** 1px border (`#e4e4e7`) paired with `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04)` (`shadow-sm`). Content cards emerge cleanly without distinct dropshadow separation.
- **Level 2 (Popovers, Select Drops, Tooltips):** 1px border (`#e4e4e7`) with `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Quick Add Sheet, Modals, Primary FAB):** Ambient depth using `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)` (`shadow-lg`). Dimmed backdrop scrims use `rgba(9, 9, 11, 0.4)` with light hardware-accelerated blur (`backdrop-blur-sm`).

## Shapes

The geometric personality features **moderate, modern roundedness** (Level 2). This balances the soft approachability demanded by personal finance apps with the crisp precision required for ledger data.

- **Cards & Data Containers:** Standardized at `12px` to `16px` (`rounded-xl` to `rounded-2xl`) border radius.
- **Form Controls & Inputs:** Form fields, select dropdowns, and button containers use `8px` (`rounded-md` / `rounded-lg`).
- **Pills & Badges:** Micro tags, category indicators, and transaction type toggles use full pill curvature (`9999px` / `rounded-full`).
- **Touch Elements (Mobile):** Primary action buttons and bottom-sheet drag affordances prioritize rounded tactile corners for effortless thumb ergonomics.

## Components

### Buttons
- **Primary:** Background Indigo-600 (`#2fa084`), text white, radius `8px`, minimum height 40px (desktop) / 44px (mobile). Hover: Indigo-700. Active: scale 0.98.
- **Secondary:** White surface, border Zinc-200 (`#e4e4e7`), text Zinc-900. Hover: Zinc-50.
- **Destructive:** Rose-50 text on Rose-600 background for confirmations, or ghost variant with Rose-600 text.
- **FAB (Mobile Quick Add):** Floating Indigo-600 circle (52px × 52px), elevated with `shadow-lg`, centered in bottom nav or anchored lower-right.

### Stat Cards (Dashboard)
- White background, 1px border Zinc-200, padding `1.25rem` (`20px`), radius 12–16px.
- Structure: Micro uppercase label (`label-sm`), main currency metric (`currency-stat`), and trend badge with directional indicator (e.g., `+12.4% vs bln lalu` in Emerald or Rose).

### Badges & Category Chips
- Small semantic tags: height 24px, radius `9999px`, padding `2px 8px`.
- Composed of 10% tint background + 100% solid text of the assigned category color (e.g., Food: `#f97316` text on `#fff7ed` background).

### Input Fields & Selects
- Height 40px (desktop), 44px (mobile). Border 1px Zinc-200, background white. Focus state: 2px ring Indigo-500 with zero outline offset.
- Numeric amount input: Dedicated large input variant (`text-2xl`, tabular figures) prefixed with static `Rp` label.

### Budget Progress Bar
- Container: Height 8px, background Zinc-100, radius `9999px`, overflow hidden.
- Progress Fill:
  - `< 80%`: Emerald-500 (Aman)
  - `80% - 100%`: Amber-500 (Hampir Habis)
  - `> 100%`: Rose-500 with subtle pulse or warning tag (Melebihi Limit)

### Transaction List Item
- Row height: 60px (mobile) / 52px (desktop).
- Left: Category icon inside a 36px rounded square with category pastel tint.
- Middle: Transaction note / merchant name (`font-medium text-zinc-900`) over category name + wallet name (`text-xs text-zinc-500`).
- Right: Formatted currency (`+Rp 1.500.000` in Emerald-600 or `-Rp 45.000` in Rose-600) with tabular layout and relative date (`Hari ini`, `Kemarin`, `12 Okt`).

### Modal & Bottom Sheet (Quick Add Transaction)
- Mobile uses sliding bottom Sheet with tab switches for transaction types: `Pengeluaran`, `Pemasukan`, `Transfer`.
- Segmented control on top: Full-width segmented tab switcher to prevent modal re-renders when changing transaction intents.