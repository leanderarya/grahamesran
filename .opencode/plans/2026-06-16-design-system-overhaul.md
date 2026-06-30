# Design System Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the frontend to shadcn/ui design language — consistent tokens, reusable components, no hardcoded values.

**Architecture:** 3 phases: (1) Update CSS tokens in app.css, (2) Extract reusable POS components, (3) Refactor pages to use tokens + components.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react, Inertia.js

---

## Phase 1: Design Tokens

### Task 1: Update CSS Variables in app.css

**Files:**
- Modify: `resources/css/app.css:103-137` (`:root` block)

- [ ] **Step 1: Update the `:root` CSS variables**

Replace the existing `:root` block (lines 103-137) with:

```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0.017 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0.017 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0.017 285.823);
    --primary: oklch(0.145 0.017 285.823);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0.004 285.823);
    --secondary-foreground: oklch(0.145 0.017 285.823);
    --muted: oklch(0.97 0.004 285.823);
    --muted-foreground: oklch(0.556 0.019 285.823);
    --accent: oklch(0.769 0.188 70.08);
    --accent-foreground: oklch(0.145 0.017 285.823);
    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.985 0 0);
    --border: oklch(0.922 0.01 285.823);
    --input: oklch(0.922 0.01 285.823);
    --ring: oklch(0.556 0.019 285.823);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --radius: 0.625rem;
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0.017 285.823);
    --sidebar-primary: oklch(0.145 0.017 285.823);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0.004 285.823);
    --sidebar-accent-foreground: oklch(0.145 0.017 285.823);
    --sidebar-border: oklch(0.922 0.01 285.823);
    --sidebar-ring: oklch(0.556 0.019 285.823);
}
```

Key changes from original:
- `--primary`: `oklch(0.205 0 0)` → `oklch(0.145 0.017 285.823)` (slate-900 → slate-950)
- `--accent`: `oklch(0.97 0 0)` → `oklch(0.769 0.188 70.08)` (slate-100 → amber-500)
- `--accent-foreground`: `oklch(0.205 0 0)` → `oklch(0.145 0.017 285.823)`
- `--destructive-foreground`: `oklch(0.577 0.245 27.325)` → `oklch(0.985 0 0)` (red → white text)
- All grays: `oklch(X 0 0)` → `oklch(X 0.017/0.019 285.823)` (add chroma + hue for slate)

- [ ] **Step 2: Update the dark mode block**

Replace the `.dark` block (lines 139-172) with:

```css
.dark {
    --background: oklch(0.145 0.017 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.145 0.017 285.823);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.145 0.017 285.823);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.985 0 0);
    --primary-foreground: oklch(0.145 0.017 285.823);
    --secondary: oklch(0.269 0.01 285.823);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0.01 285.823);
    --muted-foreground: oklch(0.708 0.01 285.823);
    --accent: oklch(0.769 0.188 70.08);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.396 0.141 25.723);
    --destructive-foreground: oklch(0.637 0.237 25.331);
    --border: oklch(0.269 0.01 285.823);
    --input: oklch(0.269 0.01 285.823);
    --ring: oklch(0.439 0.01 285.823);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.205 0.017 285.823);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.985 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0.01 285.823);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(0.269 0.01 285.823);
    --sidebar-ring: oklch(0.439 0.01 285.823);
}
```

- [ ] **Step 3: Add font-mono to @theme**

In the `@theme` block (lines 49-101), add after `--font-sans`:

```css
--font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add resources/css/app.css
git commit -m "feat: standardize CSS tokens to slate palette with proper chroma/hue"
```

---

## Phase 2: Reusable Components

### Task 2: Create POS Layout Components

**Files:**
- Create: `resources/js/layouts/pos/pos-layout.tsx`

- [ ] **Step 1: Create the POS layout component**

```tsx
import { cn } from '@/lib/utils';

export function PosLayout({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('grid h-dvh lg:grid-cols-[88px_minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_420px]', className)}>
            {children}
        </div>
    );
}

export function PosSidebar({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <aside className={cn('flex flex-col bg-slate-950 text-white', className)}>
            {children}
        </aside>
    );
}

export function PosMain({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <main className={cn('flex flex-col overflow-hidden', className)}>
            {children}
        </main>
    );
}

export function PosCheckout({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <aside className={cn('hidden flex-col border-l border-slate-200 bg-white lg:flex', className)}>
            {children}
        </aside>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/layouts/pos/pos-layout.tsx
git commit -m "feat: add POS layout components (PosLayout, PosSidebar, PosMain, PosCheckout)"
```

### Task 3: Create Stock Badge Component

**Files:**
- Create: `resources/js/components/stock-badge.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { cn } from '@/lib/utils';

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                stock > 5
                    ? 'bg-emerald-100 text-emerald-700'
                    : stock > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700',
                className,
            )}
        >
            {stock > 0 ? `Stok: ${stock}` : 'Habis'}
        </span>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/stock-badge.tsx
git commit -m "feat: add StockBadge component"
```

### Task 4: Create Price Display Component

**Files:**
- Create: `resources/js/components/price-display.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format'; // We'll create this helper

export function PriceDisplay({
    amount,
    highlight = false,
    size = 'md',
    className,
}: {
    amount: number;
    highlight?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    return (
        <span
            className={cn(
                'font-bold',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-xl',
                highlight ? 'text-amber-600' : 'text-slate-900',
                className,
            )}
        >
            Rp {formatRupiah(amount)}
        </span>
    );
}
```

Note: The `formatRupiah` function is already defined inline in Create.tsx. We'll extract it to a shared utility in a later task.

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/price-display.tsx
git commit -m "feat: add PriceDisplay component"
```

### Task 5: Create Empty State and Section Label Components

**Files:**
- Create: `resources/js/components/empty-state.tsx`
- Create: `resources/js/components/section-label.tsx`

- [ ] **Step 1: Create EmptyState**

```tsx
import { cn } from '@/lib/utils';
import { PackageSearch, type LucideIcon } from 'lucide-react';

export function EmptyState({
    message,
    icon: Icon = PackageSearch,
    className,
}: {
    message: string;
    icon?: LucideIcon;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
            <Icon className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
}
```

- [ ] **Step 2: Create SectionLabel**

```tsx
import { cn } from '@/lib/utils';

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn('text-xs font-semibold tracking-widest text-slate-400 uppercase', className)}>
            {children}
        </span>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/empty-state.tsx resources/js/components/section-label.tsx
git commit -m "feat: add EmptyState and SectionLabel components"
```

### Task 6: Create Extracted Format Utilities

**Files:**
- Create: `resources/js/lib/format.ts`

- [ ] **Step 1: Extract formatRupiah and formatDateTime from Create.tsx**

```tsx
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateTime(isoString: string | null | undefined): string {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatCurrency(amount: number): string {
    return `Rp ${formatRupiah(amount)}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/lib/format.ts
git commit -m "feat: extract formatRupiah and formatDateTime to shared utility"
```

### Task 7: Create Product Card Component

**Files:**
- Create: `resources/js/components/pos/product-card.tsx`

- [ ] **Step 1: Extract ProductCard from Create.tsx**

Read the current ProductCard in Create.tsx (around lines 311-363) and extract to a standalone component:

```tsx
import { cn } from '@/lib/utils';
import { StockBadge } from '@/components/stock-badge';
import { formatRupiah } from '@/lib/format';
import { Plus } from 'lucide-react';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    image_url: string | null;
    volume_liter: number | null;
    stock: number;
    sell_price: number;
    workshop_price: number | null;
    display_name: string;
}

export function ProductCard({
    product,
    customerType,
    onAddToCart,
    className,
}: {
    product: Product;
    customerType: 'general' | 'workshop';
    onAddToCart: (product: Product) => void;
    className?: string;
}) {
    const isWorkshop = customerType === 'workshop' && (product.workshop_price ?? 0) > 0;
    const price = isWorkshop ? product.workshop_price! : product.sell_price;

    return (
        <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={cn(
                'flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
        >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No Img
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    {product.sku || 'NOSKU'}
                </div>
                <div className="mt-1 truncate text-sm font-bold text-slate-900">
                    {product.display_name}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <StockBadge stock={product.stock} />
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={cn('text-sm font-bold', isWorkshop ? 'text-amber-600' : 'text-slate-900')}>
                    Rp {formatRupiah(price)}
                </span>
                <Plus className="h-4 w-4 text-slate-400" />
            </div>
        </button>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/pos/product-card.tsx
git commit -m "feat: extract ProductCard component"
```

### Task 8: Create Category Grid Component

**Files:**
- Create: `resources/js/components/pos/category-grid.tsx`

- [ ] **Step 1: Extract CategoryGrid from Create.tsx**

```tsx
import { cn } from '@/lib/utils';

export function CategoryGrid({
    groups,
    onSelect,
    className,
}: {
    groups: { name: string; count: number }[];
    onSelect: (category: string) => void;
    className?: string;
}) {
    return (
        <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6', className)}>
            {groups.map((group) => (
                <button
                    key={group.name}
                    onClick={() => onSelect(group.name)}
                    className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-sm font-semibold text-slate-800 transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500"
                >
                    {group.name}
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/pos/category-grid.tsx
git commit -m "feat: extract CategoryGrid component"
```

### Task 9: Create Vehicle Filter Component

**Files:**
- Create: `resources/js/components/pos/vehicle-filter.tsx`

- [ ] **Step 1: Extract VehicleFilter from Create.tsx**

```tsx
import { cn } from '@/lib/utils';

export function VehicleFilter({
    brands,
    selected,
    onChange,
    className,
}: {
    brands: string[];
    selected: string;
    onChange: (brand: string) => void;
    className?: string;
}) {
    return (
        <select
            value={selected}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                'rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-800',
                className,
            )}
        >
            {brands.map((brand) => (
                <option key={brand} value={brand}>
                    {brand === 'all' ? 'Semua Merk' : brand}
                </option>
            ))}
        </select>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/pos/vehicle-filter.tsx
git commit -m "feat: extract VehicleFilter component"
```

### Task 10: Replace cx() with cn() in Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Read Create.tsx and find the cx() definition**

Find the `cx()` function definition (around lines 18-22):
```tsx
function cx(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
```

- [ ] **Step 2: Delete the cx() function and add cn import**

Delete the `cx` function and add at the top:
```tsx
import { cn } from '@/lib/utils';
```

- [ ] **Step 3: Replace all `cx(` with `cn(` in the file**

Use find-and-replace: `cx(` → `cn(`

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: replace cx() with cn() in Create.tsx"
```

### Task 11: Replace cx() with cn() in Recap.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

- [ ] **Step 1: Same as Task 10 but for Recap.tsx**

Delete the `cx` function, add `import { cn } from '@/lib/utils'`, replace all `cx(` with `cn(`.

- [ ] **Step 2: Commit**

```bash
git add resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: replace cx() with cn() in Recap.tsx"
```

### Task 12: Replace Icons with lucide-react in Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Find the Icons object in Create.tsx**

Find the `Icons` object (around lines 38-100) with inline SVG components.

- [ ] **Step 2: Delete the Icons object and add lucide imports**

Delete the entire `Icons` object and add:
```tsx
import {
    ShoppingCart,
    Search,
    Trash2,
    Minus,
    Plus,
    Calculator,
    FileText,
    LogOut,
    X,
    Menu,
    ChevronDown,
    Receipt,
} from 'lucide-react';
```

- [ ] **Step 3: Replace all Icons.* usages**

| Find | Replace |
|------|---------|
| `<Icons.Cashier />` | `<ShoppingCart />` |
| `<Icons.Search />` | `<Search />` |
| `<Icons.Trash />` | `<Trash2 />` |
| `<Icons.Minus />` | `<Minus />` |
| `<Icons.Plus />` | `<Plus />` |
| `<Icons.Settlement />` | `<Calculator />` |
| `<Icons.Report />` | `<FileText />` |
| `<Icons.Logout />` | `<LogOut />` |
| `<Icons.X />` | `<X />` |
| `<Icons.Menu />` | `<Menu />` |

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: replace inline SVG Icons with lucide-react in Create.tsx"
```

### Task 13: Replace Icons with lucide-react in Recap.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

Same process as Task 12 but for Recap.tsx.

- [ ] **Step 1: Delete Icons object, add lucide imports, replace usages**

- [ ] **Step 2: Commit**

```bash
git add resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: replace inline SVG Icons with lucide-react in Recap.tsx"
```

### Task 14: Replace font-black with font-bold/font-semibold

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

- [ ] **Step 1: In Create.tsx, replace `font-black` with appropriate weight**

Use find-and-replace:
- Headings, prices, labels: `font-black` → `font-bold`
- Buttons, section labels: `font-black` → `font-semibold`

Run: `grep -c "font-black" resources/js/Pages/Transactions/Create.tsx`
Expected: 0 after replacement

- [ ] **Step 2: Same for Recap.tsx**

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: replace font-black with font-bold/font-semibold"
```

### Task 15: Refactor Login.tsx to use standard tokens

**Files:**
- Modify: `resources/js/Pages/Auth/Login.tsx`

- [ ] **Step 1: Read Login.tsx to understand current patterns**

- [ ] **Step 2: Replace custom hex colors**

| Find | Replace |
|------|---------|
| `bg-[#0b2ba3]` | `bg-slate-950` |
| `hover:bg-[#1f39ae]` | `hover:bg-slate-800` |
| `text-[#0b2ba3]` | `text-slate-950` |
| `hover:text-[#1f39ae]` | `hover:text-slate-800` |
| `accent-[#0b2ba3]` | `accent-slate-950` |

- [ ] **Step 3: Replace custom border-radius**

| Find | Replace |
|------|---------|
| `rounded-[22px]` | `rounded-xl` |
| `rounded-[30px]` | `rounded-2xl` |

- [ ] **Step 4: Replace custom shadows**

| Find | Replace |
|------|---------|
| `shadow-[0_1px_0_rgba(15,23,42,0.02)]` | `shadow-sm` |
| `shadow-[0_16px_30px_rgba(11,43,163,0.20)]` | `shadow-lg` |
| `shadow-[0_16px_40px_rgba(15,23,42,0.08)]` | `shadow-lg` |
| `shadow-[0_20px_60px_rgba(15,23,42,0.10)]` | `shadow-xl` |

- [ ] **Step 5: Replace font-['Manrope'] with system font**

| Find | Replace |
|------|---------|
| `font-['Manrope']` | `font-sans` |

- [ ] **Step 6: Replace font-black with font-bold**

- [ ] **Step 7: Replace glass-morphism with standard bg**

| Find | Replace |
|------|---------|
| `bg-white/92` | `bg-white/95` |
| `bg-white/95` | (keep) |

- [ ] **Step 8: Commit**

```bash
git add resources/js/Pages/Auth/Login.tsx
git commit -m "refactor: standardize Login.tsx to use design tokens"
```

### Task 16: Delete Legacy Breeze Components

**Files:**
- Delete: `resources/js/components/PrimaryButton.tsx`
- Delete: `resources/js/components/TextInput.tsx`
- Delete: `resources/js/components/InputLabel.tsx`
- Delete: `resources/js/components/InputError.tsx`
- Delete: `resources/js/components/Checkbox.tsx`

- [ ] **Step 1: Verify no imports reference these files**

```bash
grep -r "PrimaryButton\|TextInput\|InputLabel\|InputError\|Checkbox" resources/js/ --include="*.tsx" --include="*.ts" -l
```

Expected: Only the files themselves (or no results if they're already unused).

- [ ] **Step 2: Delete the files**

```bash
rm resources/js/components/PrimaryButton.tsx
rm resources/js/components/TextInput.tsx
rm resources/js/components/InputLabel.tsx
rm resources/js/components/InputError.tsx
rm resources/js/components/Checkbox.tsx
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds (files are already unused)

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/
git commit -m "cleanup: delete legacy Breeze components (replaced by shadcn/ui)"
```

### Task 17: Final Build Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npm run types`
Expected: No new errors (pre-existing Livewire errors are OK)

- [ ] **Step 2: Build frontend**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit build artifacts**

```bash
git add public/build/
git commit -m "build: compile with design system tokens and components"
```

---

## Verification Checklist

- [ ] All CSS variables use slate palette (no neutral/gray)
- [ ] No `cx()` anywhere — all `cn()`
- [ ] No inline SVG `Icons.*` — all lucide-react
- [ ] No `font-black` — use `font-bold`/`font-semibold`
- [ ] Login page uses standard tokens (no custom hex/shadows/radius)
- [ ] Legacy Breeze components deleted
- [ ] `npm run types` passes
- [ ] `npm run build` passes
