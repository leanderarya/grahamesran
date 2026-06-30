# POS UI Redesign — Tablet-First

**Date:** 2026-06-30
**Target Device:** Samsung Tab A8 10.5" (1920×1200, landscape, 16:10)
**Goal:** Operational-first cashier UI, premium clean feel, reduce visual clutter

---

## 1. Layout

**Two-panel fixed layout. No sidebar.**

```
┌──────────────────────────────────────────────────────────────┐
│  Top Bar (56px)                                              │
├────────────────────────────────────┬─────────────────────────┤
│  Left Panel (60%)                  │  Right Panel (40%)      │
│  - Category chips (horizontal)     │  - Cart items           │
│  - Product grid (4 cols)           │  - Customer type toggle │
│                                    │  - Total + CTA          │
└────────────────────────────────────┴─────────────────────────┘
```

- **Sidebar removed entirely.** All navigation moves to top bar.
- **Vehicle filter removed.** Search handles vehicle model lookup.
- **"Pilih Kategori" screen removed.** Products show immediately with "Semua" chip selected.
- **Mobile:** Bottom bar stays (same pattern as current).

### Files Affected

| Current File | Action |
|-------------|--------|
| `pos-sidebar.tsx` | Delete (replaced by top bar) |
| `mobile-bottom-bar.tsx` | Keep (mobile only) |
| `vehicle-filter.tsx` | Delete (removed) |
| `category-grid.tsx` | Replace with horizontal chip component |
| `Create.tsx` | Major refactor (new layout) |

---

## 2. Color Palette

**Monochrome Slate + White. Indigo accent.**

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | `#FFFFFF` | `bg-white` | Page background |
| Surface | `#F8FAFC` | `bg-slate-50` | Card backgrounds |
| Border | `#E2E8F0` | `border-slate-200` | All borders |
| Text Primary | `#0F172A` | `text-slate-950` | Headings, prices |
| Text Secondary | `#64748B` | `text-slate-500` | Labels, descriptions |
| Text Muted | `#94A3B8` | `text-slate-400` | Timestamps, hints |
| Accent | `#4F46E5` | `bg-indigo-600` | Primary buttons, CTA |
| Accent Hover | `#4338CA` | `hover:bg-indigo-700` | Button hover |
| Success | `#059669` | `text-emerald-600` | Stock available, balance |
| Warning | `#D97706` | `text-amber-600` | Low stock, workshop badge |
| Danger | `#DC2626` | `text-red-600` | Out of stock, error |

### What Changes

| Element | Before | After |
|---------|--------|-------|
| Primary button | `bg-slate-950` | `bg-indigo-600` |
| Background | `bg-slate-100` | `bg-white` |
| Card shadow | `shadow-sm` | None (border only) |
| Workshop badge | `bg-amber-500` | `bg-amber-100 text-amber-700` |

---

## 3. Border Radius

| Element | Before | After |
|---------|--------|-------|
| Card | `rounded-[2rem]` / `rounded-3xl` | `rounded-xl` (12px) |
| Button | `rounded-2xl` / `rounded-3xl` | `rounded-lg` (8px) |
| Badge | `rounded-full` | `rounded-md` (6px) |
| Modal | `rounded-[2rem]` | `rounded-xl` (12px) |
| Input | `rounded-3xl` | `rounded-lg` (8px) |

---

## 4. Top Bar

**56px height, white, bottom border.**

```
┌──────────────────────────────────────────────────────────────┐
│  [GM]  Graha Motor        [🔍 Cari barang...]      [●] [👤▼] │
└──────────────────────────────────────────────────────────────┘
```

| Position | Element | Details |
|----------|---------|---------|
| Left | Logo (24px) + brand name | Static |
| Center | Search input (max 480px) | Auto-focus, searches name+SKU+model |
| Right-1 | Status dot | Green = session active, Red = no session. Tap → open/close session |
| Right-2 | Avatar + dropdown | Name + Rekap, Settlement, Logout |

**New component:** `Components/pos/top-bar.tsx`

### Avatar Dropdown

```
┌────────────────────┐
│  Arya Ajisadda     │
│  Kasir aktif       │
│  ───────────────── │
│  📊 Rekap Penjualan│
│  💰 Settlement     │
│  🚪 Keluar         │
└────────────────────┘
```

- Logout blocked if session is open (same logic as current)
- Settlement opens modal (same as current)
- Rekap navigates to recap page

---

## 5. Category Chips

**Horizontal scrollable strip below top bar.**

```
[Semua] [Stabilizer] [Rack End] [Kabel] [Brake Pad] [Filter] [▸]
```

- Default: "Semua" selected → shows all products
- Selected: `bg-slate-900 text-white rounded-lg px-4 py-2`
- Unselected: `bg-white border border-slate-200 text-slate-600 rounded-lg px-4 py-2`
- Horizontal scroll with `overflow-x-auto`, hide scrollbar
- Tap chip → filter products, scroll to top

**New component:** `Components/pos/category-chips.tsx` (replaces `category-grid.tsx`)

---

## 6. Product Grid

**4 columns on tablet (1920px), 3 on smaller landscape, 2 on portrait.**

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ SKU  │ │ SKU  │ │ SKU  │ │ SKU  │
│ Nama │ │ Nama │ │ Nama │ │ Nama │
│Produk│ │Produk│ │Produk│ │Produk│
│      │ │      │ │      │ │      │
│Stk:5 │ │Stk:2 │ │Habis │ │Stk:10│
│Rp85rb│ │Rp60rb│ │  —   │ │Rp30rb│
│  [+] │ │  [+] │ │      │ │  [+] │
└──────┘ └──────┘ └──────┘ └──────┘
```

**Card specs:**
- `border border-slate-200 rounded-xl p-3` (no shadow)
- Tap entire card → add to cart
- Out of stock: `opacity-40 cursor-not-allowed`, badge "Habis"
- Stock badge: `rounded-md` (not `rounded-full`)
- Plus button: `w-7 h-7 rounded-md bg-indigo-600` (smaller, indigo)
- Grid: `grid-cols-4 gap-2` on tablet

**Changes to `product-card.tsx`:**
- Remove shadow on hover
- Smaller plus button (indigo)
- Tighter padding
- `rounded-xl` instead of `rounded-xl` (already close)

---

## 7. Checkout Panel

**Right 40%, sticky, always visible on tablet.**

```
┌─────────────────────────────┐
│  Keranjang            [🗑️]  │
├─────────────────────────────┤
│  Stabilizer Innova    [−][+]│
│  Rp 85.000 × 2 = 170.000  │
│  ─────────────────────────  │
│  Kabel Busi S89       [−][+]│
│  Rp 105.000 × 1 = 105.000  │
├─────────────────────────────┤
│  [Umum] [Bengkel]          │ ← compact toggle
├─────────────────────────────┤
│  3 item · 6 pcs             │
│  Total         Rp 635.000   │
│  [    Bayar Sekarang    ]   │
└─────────────────────────────┘
```

**Key changes:**
- Item rows: flat with `border-b` divider (no card per item)
- Product name: `line-clamp-1` (not 2)
- Qty buttons: `w-8 h-8 rounded-lg` (compact)
- Customer type toggle: pill switch, moved here from main panel
- Clear all: small trash icon in header (not big button)
- "Bayar Sekarang" → `bg-indigo-600 rounded-lg`
- Total: `text-2xl font-bold text-slate-950`

**Empty state:**
```
🛒
Keranjang kosong
Tap produk untuk mulai
```

---

## 8. Modals

### Style Changes (all modals)

| Property | Before | After |
|----------|--------|-------|
| Overlay | `bg-slate-950/70` | `bg-black/40` |
| Body | `rounded-[2rem]` | `rounded-xl` |
| CTA button | `bg-slate-950` | `bg-indigo-600` |
| Secondary button | `rounded-3xl` | `rounded-lg` |
| Input | `rounded-2xl` | `rounded-lg` |

### Open Session Modal
Same flow. Style refresh only.

### Settlement Modal
- 4 stat cards: `2×2 grid` with `rounded-xl`
- Expected Cash card: `bg-slate-900 text-white` (not `bg-slate-950`)
- Result display: badge + large number (same pattern)
- CTA: "Simpan & Tutup Kasir" → `bg-indigo-600`

### Logout Modal
Same flow. Style refresh only.

---

## 9. Checkout Page (`/checkout/{draft}`)

```
┌──────────────────────────────────────────────────────────────┐
│  [← Kembali]                       INV-20260630-001          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │  Ringkasan Pesanan       │  │  Pembayaran              │ │
│  │  3 item · Umum           │  │  [Tunai][QRIS][Bank]     │ │
│  │                          │  │                          │ │
│  │  • Stabilizer Innova     │  │  Uang Diterima           │ │
│  │    2×Rp85.000   170.000  │  │  Rp [________]           │ │
│  │  • Kabel Busi S89        │  │                          │ │
│  │    1×Rp105.000  105.000  │  │  [50rb][100rb][Uang Pas] │ │
│  │                          │  │                          │ │
│  │  Total    Rp 635.000     │  │  Kembali   Rp 35.000     │ │
│  │                          │  │                          │ │
│  │                          │  │  [Bayar Sekarang]        │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│       55% width                       45% width             │
└──────────────────────────────────────────────────────────────┘
```

- Layout: `55/45` split (not `1fr/440px`)
- Payment methods: `rounded-lg` compact buttons
- Cash shortcuts: `rounded-lg`, `grid-cols-3`
- Total card: `bg-slate-900 text-white rounded-xl`
- Back button: `rounded-lg border` (not `rounded-2xl`)

---

## 10. Component Inventory

### New Files
| File | Purpose |
|------|---------|
| `Components/pos/top-bar.tsx` | Top navigation bar |
| `Components/pos/category-chips.tsx` | Horizontal category filter |
| `Components/pos/cart-item-row.tsx` | Single cart item row (extracted) |

### Modified Files
| File | Changes |
|------|---------|
| `Pages/Transactions/Create.tsx` | New two-panel layout, remove sidebar logic |
| `Pages/Transactions/Checkout.tsx` | Style refresh, 55/45 split |
| `Pages/Transactions/Recap.tsx` | Style refresh |
| `Components/pos/checkout-panel.tsx` | Flat rows, compact controls, customer toggle |
| `Components/pos/product-card.tsx` | Smaller card, indigo plus, no shadow |
| `Components/pos/open-session-modal.tsx` | Style refresh |
| `Components/pos/settlement-modal.tsx` | 2×2 grid, style refresh |
| `Components/pos/logout-modal.tsx` | Style refresh |
| `Components/pos/print-receipt.tsx` | No change (hidden print-only) |
| `Components/stock-badge.tsx` | `rounded-md` instead of `rounded-full` |
| `lib/format.ts` | No change |

### Deleted Files
| File | Reason |
|------|--------|
| `Components/pos/pos-sidebar.tsx` | Replaced by top bar |
| `Components/pos/vehicle-filter.tsx` | Removed |
| `Components/pos/category-grid.tsx` | Replaced by category-chips |

---

## 11. Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `< 768px` (mobile) | Single column, bottom bar, checkout as overlay |
| `768px–1023px` (portrait tablet) | Single column, bottom bar |
| `1024px+` (landscape tablet) | Two-panel 60/40 |
| `1280px+` (desktop) | Two-panel 60/40, slightly more padding |

---

## 12. Interaction Patterns

- **Add to cart:** Tap product card → instant add, brief `scale(0.97)` press animation
- **Qty change:** Tap [−] or [+] → immediate update (no animation needed)
- **Category switch:** Tap chip → instant filter, scroll to top
- **Search:** Debounced 150ms, resets category to "Semua"
- **Status dot:** Tap → open session modal (if red) or settlement modal (if green)
- **Avatar:** Tap → dropdown menu

---

## 13. Implementation Order

1. Create `top-bar.tsx` component
2. Create `category-chips.tsx` component
3. Refactor `Create.tsx` — new two-panel layout
4. Refactor `checkout-panel.tsx` — flat rows, compact controls
5. Update `product-card.tsx` — smaller, indigo accent
6. Update all modals — style refresh
7. Update `Checkout.tsx` — 55/45 layout, compact payment
8. Update `Recap.tsx` — style refresh
9. Delete old files (`pos-sidebar.tsx`, `vehicle-filter.tsx`, `category-grid.tsx`)
10. Update `stock-badge.tsx` — `rounded-md`
11. Test on tablet viewport (1920×1200)
