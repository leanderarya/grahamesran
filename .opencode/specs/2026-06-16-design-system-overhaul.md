# Design System Overhaul — Design Spec

## Problem

The Graha Mesran POS frontend has 12 major inconsistencies:

1. Three gray palettes used interchangeably (`slate-*`, `neutral-*`, `gray-*`)
2. Two utility functions (`cx()` in POS vs `cn()` in shadcn — `cx()` doesn't handle Tailwind conflicts)
3. Two icon systems (inline SVG in POS vs `lucide-react` in shadcn)
4. Two button/input systems (legacy Breeze vs shadcn vs custom POS)
5. Four border-radius systems (`rounded-md`, `rounded-2xl`, `rounded-[22px]`, `rounded-[1.5rem]`)
6. No design tokens — colors hardcoded throughout
7. `font-black` (weight 900) overused on all text
8. Login page completely isolated with its own design language
9. POS pages have ~200 lines of inline layout JSX, not reusable
10. Dark mode inconsistent — some components have `dark:` variants, POS and Login don't
11. Legacy Breeze components still exist alongside shadcn/ui
12. `cx()` doesn't handle Tailwind class conflicts

## Solution

Full design system overhaul decomposed into 3 sub-projects:

| # | Sub-project | Dependencies |
|---|------------|--------------|
| 1 | Design Tokens | None |
| 2 | Reusable Components | Sub-project 1 |
| 3 | Page Refactor | Sub-project 1 + 2 |

---

## Sub-project 1: Design Tokens

### Goal

All colors, typography, spacing, radius, and shadows defined as CSS variables in `resources/css/app.css`. No hardcoded values in components.

### Color System

Standardize on `slate` palette (POS primary). Map everything through shadcn CSS variables.

**Light mode:**

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(1 0 0)` (white) | Page background |
| `--foreground` | `oklch(0.145 0.017 285.823)` (slate-950) | Primary text |
| `--card` | `oklch(1 0 0)` | Card background |
| `--card-foreground` | `oklch(0.145 0.017 285.823)` | Card text |
| `--primary` | `oklch(0.145 0.017 285.823)` (slate-950) | CTA buttons, active states |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary |
| `--secondary` | `oklch(0.97 0.004 285.823)` (slate-100) | Inactive buttons, surfaces |
| `--secondary-foreground` | `oklch(0.205 0.017 285.823)` (slate-900) | Text on secondary |
| `--muted` | `oklch(0.97 0.004 285.823)` (slate-100) | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.556 0.019 285.823)` (slate-500) | Labels, descriptions |
| `--accent` | `oklch(0.769 0.188 70.08)` (amber-500) | Workshop mode, highlights |
| `--accent-foreground` | `oklch(0.145 0.017 285.823)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` (red-600) | Delete, errors |
| `--destructive-foreground` | `oklch(1 0 0)` | Text on destructive |
| `--border` | `oklch(0.922 0.01 285.823)` (slate-200) | All borders |
| `--input` | `oklch(0.922 0.01 285.823)` (slate-200) | Form input borders |
| `--ring` | `oklch(0.556 0.019 285.823)` (slate-400) | Focus rings |

**Dark mode:** Full dark theme already exists in `app.css` — no changes needed.

**What gets removed:**
- All `neutral-*` usage → replace with `slate-*` or CSS variables
- All `gray-*` usage → replace with `slate-*` or CSS variables
- Custom hex colors in Login.tsx (`#0b2ba3`, `#1f39ae`) → replace with `--primary`

### Typography System

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Instrument Sans', ...` | Already set in app.css |
| `--font-mono` | `'JetBrains Mono', ...` | Receipts, code |
| Heading weight | `font-bold` (700) | All headings — replaces `font-black` |
| Subheading weight | `font-semibold` (600) | Section labels, buttons |
| Body weight | `font-medium` (500) | Body text, labels, descriptions |
| Font size scale | `text-xs` through `text-3xl` | Existing scale, no changes |

**What gets removed:**
- `font-black` (weight 900) everywhere → replace with `font-bold` or `font-semibold`
- `font-['Manrope']` in Login.tsx → use system font

### Spacing Scale

Standardize on 4px grid. No new tokens needed — Tailwind's default scale is already 4px-based. Just enforce consistency:

| Class | px | Usage |
|-------|-----|-------|
| `gap-1` | 4px | Tight spacing (icon + text) |
| `gap-2` | 8px | Small groups |
| `gap-3` | 12px | Card content, sidebar items |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Major sections |
| `gap-8` | 32px | Page sections |

### Border Radius

Map to shadcn CSS variables. POS pages use `rounded-2xl`/`rounded-3xl` which maps to `--radius-lg`/`--radius-xl`.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-sm` | `0.375rem` (6px) | `rounded-md` | Badges, small elements |
| `--radius-md` | `0.5rem` (8px) | `rounded-lg` | Buttons, inputs |
| `--radius-lg` | `0.75rem` (12px) | `rounded-xl` | Cards, panels |
| `--radius-xl` | `1rem` (16px) | `rounded-2xl` | Large cards, modals |

**What gets removed:**
- `rounded-[22px]` in Login.tsx → `rounded-xl`
- `rounded-[30px]` in Login.tsx → `rounded-2xl`
- `rounded-[1.5rem]` in notifications → `rounded-xl`

### Shadow Scale

| Token | Tailwind | Usage |
|-------|----------|-------|
| `shadow-xs` | default | shadcn defaults (button, input) |
| `shadow-sm` | default | Interactive surfaces |
| `shadow-md` | default | Hover states |
| `shadow-lg` | default | Modals, popovers |

**What gets removed:**
- Custom `shadow-[0_16px_30px_...]` in Login.tsx → `shadow-lg`
- Custom `shadow-[0_20px_60px_...]` in Login.tsx → `shadow-xl`

### Files Changed

| File | Change |
|------|--------|
| `resources/css/app.css` | Update `@theme` block with standardized radius tokens |

---

## Sub-project 2: Reusable Components

### Goal

Extract duplicated patterns from POS pages into reusable components. Consolidate icon system to `lucide-react`. Replace `cx()` with `cn()`.

### Components to Create

**1. POS Layout** (`resources/js/layouts/pos/pos-layout.tsx`)

Extract ~200 lines of layout JSX from Create.tsx and Recap.tsx into reusable layout components:

```
PosLayout        — 3-column CSS grid (sidebar | main | checkout)
PosSidebar       — Sidebar with menu items, status card, user info
PosMain          — Main content area wrapper
PosCheckout      — Checkout panel (desktop) + bottom bar (mobile)
```

Props:
- `PosLayout`: `children`, `className?`
- `PosSidebar`: `menuItems`, `activeMenu`, `onMenuChange`, `session`, `user`
- `PosMain`: `children`, `className?`
- `PosCheckout`: `children`, `className?`, `mobileCheckoutButton?`

**2. Product Card** (`resources/js/components/pos/product-card.tsx`)

Extract from Create.tsx lines 311-363. Shows product image, SKU, name, stock badge, price.

Props: `product: Product`, `customerType: 'general' | 'workshop'`, `onAddToCart: (product) => void`

**3. Category Grid** (`resources/js/components/pos/category-grid.tsx`)

Extract from Create.tsx lines 366-386. Grid of category buttons.

Props: `groups: { name: string; count: number }[]`, `onSelect: (category: string) => void`

**4. Vehicle Filter** (`resources/js/components/pos/vehicle-filter.tsx`)

Extract from Create.tsx lines 388-410. Dropdown to filter by vehicle brand.

Props: `brands: string[]`, `selected: string`, `onChange: (brand: string) => void`

**5. Cart Item** (`resources/js/components/pos/cart-item.tsx`)

Extract from Create.tsx lines 1240-1320. Single line item in the cart.

Props: `item: CartItem`, `customerType`, `onUpdateQty`, `onRemove`

**6. Payment Panel** (`resources/js/components/pos/payment-panel.tsx`)

Extract from Create.tsx lines 1340-1440. Payment method buttons + cash shortcuts.

Props: `paymentMethod`, `cashReceived`, `totalAmount`, `onPaymentMethodChange`, `onCashReceivedChange`

**7. Stock Badge** (`resources/js/components/stock-badge.tsx`)

Inline badge showing stock status (green >5, amber 1-5, red 0).

Props: `stock: number`

**8. Price Display** (`resources/js/components/price-display.tsx`)

Formatted Rupiah price with optional highlight for workshop pricing.

Props: `amount: number`, `highlight?: boolean`, `size?: 'sm' | 'md' | 'lg'`

**9. Empty State** (`resources/js/components/empty-state.tsx`)

Centered message for empty lists.

Props: `message: string`, `icon?: LucideIcon`

**10. Section Label** (`resources/js/components/section-label.tsx`)

Uppercase tracking-widest label pattern.

Props: `children: ReactNode`

### Icon Consolidation

Replace all inline SVG `Icons.*` with lucide-react:

| Current (inline SVG) | Lucide |
|---------------------|--------|
| `Icons.Cashier` | `ShoppingCart` |
| `Icons.Search` | `Search` |
| `Icons.Trash` | `Trash2` |
| `Icons.Minus` | `Minus` |
| `Icons.Plus` | `Plus` |
| `Icons.Settlement` | `Calculator` |
| `Icons.Report` | `FileText` |
| `Icons.Logout` | `LogOut` |
| `Icons.X` | `X` |

Delete the `Icons` object from Create.tsx and Recap.tsx.

### Utility Consolidation

- Delete `cx()` function from Create.tsx and Recap.tsx
- All files use `cn()` from `@/lib/utils`
- `cn()` = `clsx` + `tailwind-merge` (handles conflicts)

### File Structure (after)

```
resources/js/
├── components/
│   ├── ui/                    # shadcn/ui (25 existing)
│   ├── pos/                   # POS-specific (NEW)
│   │   ├── pos-layout.tsx
│   │   ├── pos-sidebar.tsx
│   │   ├── pos-main.tsx
│   │   ├── pos-checkout.tsx
│   │   ├── product-card.tsx
│   │   ├── category-grid.tsx
│   │   ├── vehicle-filter.tsx
│   │   ├── cart-item.tsx
│   │   └── payment-panel.tsx
│   ├── stock-badge.tsx        # (NEW)
│   ├── price-display.tsx      # (NEW)
│   ├── empty-state.tsx        # (NEW)
│   └── section-label.tsx      # (NEW)
├── layouts/
│   ├── pos/                   # POS layout (NEW)
│   │   └── pos-layout.tsx
│   ├── auth/                  # (existing)
│   ├── app/                   # (existing)
│   └── settings/              # (existing)
```

---

## Sub-project 3: Page Refactor

### Goal

Refactor Create.tsx, Recap.tsx, and Login.tsx to use design tokens + reusable components. Delete legacy Breeze components.

### Create.tsx (1919 lines → target <1000 lines)

| Change | Lines Saved (est.) |
|--------|-------------------|
| Import PosLayout/PosSidebar/PosMain/PosCheckout | ~180 lines |
| Import ProductCard, CategoryGrid, VehicleFilter, CartItem, PaymentPanel | ~300 lines |
| Replace `cx()` with `cn()` | ~5 lines |
| Replace `Icons.*` with lucide imports | ~50 lines |
| Replace hardcoded colors with tokens | ~20 lines |
| Replace `font-black` with `font-bold`/`font-semibold` | ~15 lines |
| **Total estimated savings** | **~570 lines** |

### Recap.tsx (621 lines → target <300 lines)

| Change | Lines Saved (est.) |
|--------|-------------------|
| Import PosLayout/PosSidebar/PosMain | ~180 lines |
| Replace `cx()` with `cn()` | ~3 lines |
| Replace `Icons.*` with lucide imports | ~30 lines |
| Extract stat cards to reuse pattern | ~20 lines |
| **Total estimated savings** | **~233 lines** |

### Login.tsx (355 lines → target <200 lines)

| Change | Description |
|--------|-------------|
| Replace `#0b2ba3` hex with `bg-primary` | Use CSS variable |
| Replace `rounded-[22px]` with `rounded-xl` | Standard radius |
| Replace `rounded-[30px]` with `rounded-2xl` | Standard radius |
| Replace custom shadows with `shadow-lg`/`shadow-xl` | Standard shadows |
| Replace `font-['Manrope']` with system font | Remove custom font |
| Replace inline SVG with lucide-react | Icon consolidation |
| Replace hand-rolled inputs with shadcn `Input` + `Label` | Component reuse |

### Legacy Component Deletion

Delete these files (replaced by shadcn/ui):

- `resources/js/components/PrimaryButton.tsx`
- `resources/js/components/TextInput.tsx`
- `resources/js/components/InputLabel.tsx`
- `resources/js/components/InputError.tsx`
- `resources/js/components/Checkbox.tsx`

Verify no imports reference these files before deleting.

### Dark Mode

Not in scope for this overhaul. The CSS variables define a full dark theme, but applying `dark:` variants consistently across all pages is a separate effort.

### Success Criteria

- [ ] All pages use CSS variables (no hardcoded colors)
- [ ] No `cx()` anywhere — all use `cn()`
- [ ] No inline SVG icons — all use `lucide-react`
- [ ] No `font-black` — use `font-bold` / `font-semibold` / `font-medium`
- [ ] Border radius consistent (`rounded-lg` for cards, `rounded-md` for buttons/inputs)
- [ ] Login page uses same design language as POS
- [ ] Legacy Breeze components deleted
- [ ] Create.tsx < 1000 lines
- [ ] Recap.tsx < 300 lines
- [ ] Login.tsx < 200 lines
- [ ] `npm run types` passes
- [ ] `npm run build` passes

### Execution Order

```
Sub-project 1 (Tokens)
    → Update app.css @theme block
    → Verify build passes

Sub-project 2 (Components)
    → Create POS layout components
    → Extract ProductCard, CategoryGrid, VehicleFilter, CartItem, PaymentPanel
    → Create StockBadge, PriceDisplay, EmptyState, SectionLabel
    → Consolidate icons to lucide-react
    → Replace cx() with cn()

Sub-project 3 (Page Refactor)
    → Refactor Create.tsx to use layout + components
    → Refactor Recap.tsx to use layout + components
    → Refactor Login.tsx to use tokens + shadcn components
    → Delete legacy Breeze components
    → Verify types + build
