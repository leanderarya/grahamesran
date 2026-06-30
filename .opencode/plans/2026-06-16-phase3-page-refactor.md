# Phase 3: Page Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Create.tsx (1710→<1000), Recap.tsx (508→<300), Login.tsx (355→<200) by using extracted components and design tokens.

**Architecture:** Import already-extracted components from Phase 2, extract remaining shared components (sidebar, modals, checkout), fix Login.tsx icons.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Inertia.js

---

### Task 1: Import Extracted Components in Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

The extracted components exist at `resources/js/components/pos/` but Create.tsx still defines them inline. Replace the inline definitions with imports.

- [ ] **Step 1: Read Create.tsx lines 91-201 (inline ProductCard, CategoryGrid, VehicleFilter)**

- [ ] **Step 2: Delete the inline `ProductCard` component (lines 91-155, ~65 lines)**

- [ ] **Step 3: Delete the inline `CategoryGrid` component (lines 157-177, ~21 lines)**

- [ ] **Step 4: Delete the inline `VehicleFilter` component (lines 179-201, ~23 lines)**

- [ ] **Step 5: Add imports at the top of the file:**

```tsx
import { ProductCard } from '@/components/pos/product-card';
import { CategoryGrid } from '@/components/pos/category-grid';
import { VehicleFilter } from '@/components/pos/vehicle-filter';
```

- [ ] **Step 6: Verify the component usages in the JSX still work (the JSX calls like `<ProductCard .../>`, `<CategoryGrid .../>`, `<VehicleFilter .../>` should match the exported component props)**

- [ ] **Step 7: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: import extracted ProductCard, CategoryGrid, VehicleFilter in Create.tsx"
```

---

### Task 2: Import Format Utilities in Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Read Create.tsx lines 63-84 (inline formatRupiah, formatDateTime, etc.)**

- [ ] **Step 2: Delete the inline `formatRupiah` function**

- [ ] **Step 3: Delete the inline `formatDateTime` function**

- [ ] **Step 4: Add import at the top:**

```tsx
import { formatRupiah, formatDateTime } from '@/lib/format';
```

- [ ] **Step 5: Keep `sanitizeNumericInput`, `formatSignedCurrency`, `formatVolume`, `getProductLabel` inline (they are page-specific)**

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: import formatRupiah/formatDateTime from shared utility in Create.tsx"
```

---

### Task 3: Import Format Utilities in Recap.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

- [ ] **Step 1: Read Recap.tsx lines 49-57 (inline formatRupiah, formatDateTime)**

- [ ] **Step 2: Delete the inline functions**

- [ ] **Step 3: Add import at the top:**

```tsx
import { formatRupiah, formatDateTime } from '@/lib/format';
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: import formatRupiah/formatDateTime from shared utility in Recap.tsx"
```

---

### Task 4: Extract Shared POS Sidebar Component

**Files:**
- Create: `resources/js/components/pos/pos-sidebar.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

The sidebar (~114 lines) is duplicated between Create.tsx and Recap.tsx. Extract to a shared component.

- [ ] **Step 1: Read Create.tsx lines 677-791 (sidebar JSX)**

- [ ] **Step 2: Create `resources/js/components/pos/pos-sidebar.tsx`**

The sidebar component should accept these props:
```tsx
interface PosSidebarProps {
    activeMenu: string;
    onMenuChange: (menu: string) => void;
    sidebarCollapsed: boolean;
    onToggleCollapse: () => void;
    hasOpenSession: boolean;
    sessionState: any; // CashierSession or null
    user: { name: string; email: string };
    onOpenSession: () => void;
    onSettlement: () => void;
    formatDateTime: (iso: string | null) => string;
}
```

- [ ] **Step 3: Move the sidebar JSX from Create.tsx into the component**

- [ ] **Step 4: Replace sidebar JSX in Create.tsx with:**

```tsx
<PosSidebar
    activeMenu={activeMenu}
    onMenuChange={setActiveMenu}
    sidebarCollapsed={sidebarCollapsed}
    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
    hasOpenSession={hasOpenSession}
    sessionState={sessionState}
    user={auth.user}
    onOpenSession={() => setShowOpenSessionModal(true)}
    onSettlement={() => setShowSettlementModal(true)}
    formatDateTime={formatDateTime}
/>
```

- [ ] **Step 5: Replace sidebar JSX in Recap.tsx with the same component import**

- [ ] **Step 6: Commit**

```bash
git add resources/js/components/pos/pos-sidebar.tsx resources/js/Pages/Transactions/Create.tsx resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: extract shared POS sidebar component"
```

---

### Task 5: Extract Shared Logout Modal

**Files:**
- Create: `resources/js/components/pos/logout-modal.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

The logout modal (~28 lines) is duplicated between Create.tsx and Recap.tsx.

- [ ] **Step 1: Read Create.tsx logout modal (lines 1607-1635)**

- [ ] **Step 2: Create `resources/js/components/pos/logout-modal.tsx`**

Props:
```tsx
interface LogoutModalProps {
    show: boolean;
    onClose: () => void;
}
```

- [ ] **Step 3: Replace in both Create.tsx and Recap.tsx with import**

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/pos/logout-modal.tsx resources/js/Pages/Transactions/Create.tsx resources/js/Pages/Transactions/Recap.tsx
git commit -m "refactor: extract shared LogoutModal component"
```

---

### Task 6: Extract Open Session Modal

**Files:**
- Create: `resources/js/components/pos/open-session-modal.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Read Create.tsx lines 1332-1413 (Open Session Modal)**

- [ ] **Step 2: Create the component**

Props:
```tsx
interface OpenSessionModalProps {
    show: boolean;
    onClose: () => void;
    openingCash: string;
    openingNotes: string;
    onOpeningCashChange: (value: string) => void;
    onOpeningNotesChange: (value: string) => void;
    onSubmit: () => void;
    errors: Record<string, string>;
}
```

- [ ] **Step 3: Replace in Create.tsx with import**

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/pos/open-session-modal.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: extract OpenSessionModal component"
```

---

### Task 7: Extract Settlement Modal

**Files:**
- Create: `resources/js/components/pos/settlement-modal.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Read Create.tsx lines 1415-1605 (Settlement Modal, ~190 lines)**

- [ ] **Step 2: Create the component**

This is the largest modal. Props:
```tsx
interface SettlementModalProps {
    show: boolean;
    onClose: () => void;
    sessionState: CashierSession | null;
    closingCash: string;
    closingNotes: string;
    onClosingCashChange: (value: string) => void;
    onClosingNotesChange: (value: string) => void;
    onSubmit: () => void;
    errors: Record<string, string>;
    formatRupiah: (amount: number) => string;
}
```

- [ ] **Step 3: Replace in Create.tsx with import**

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/pos/settlement-modal.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: extract SettlementModal component"
```

---

### Task 8: Extract Checkout Panel

**Files:**
- Create: `resources/js/components/pos/checkout-panel.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Read Create.tsx lines 988-1295 (checkout/cart panel, ~307 lines)**

- [ ] **Step 2: Create the component**

This includes: cart items list, quantity controls, payment method buttons, cash shortcuts, checkout button.

- [ ] **Step 3: Replace in Create.tsx with import**

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/pos/checkout-panel.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: extract CheckoutPanel component"
```

---

### Task 9: Extract Mobile Bottom Bar and Print Receipt

**Files:**
- Create: `resources/js/components/pos/mobile-bottom-bar.tsx`
- Create: `resources/js/components/pos/print-receipt.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Extract mobile bottom bar (lines 1299-1330, ~31 lines)**

- [ ] **Step 2: Extract print receipt area (lines 1637-1707, ~70 lines)**

- [ ] **Step 3: Replace in Create.tsx with imports**

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/pos/mobile-bottom-bar.tsx resources/js/components/pos/print-receipt.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: extract MobileBottomBar and PrintReceipt components"
```

---

### Task 10: Fix Login.tsx — Replace Inline Icons with lucide-react

**Files:**
- Modify: `resources/js/Pages/Auth/Login.tsx`

- [ ] **Step 1: Read Login.tsx lines 6-126 (inline icon components)**

- [ ] **Step 2: Delete all inline icon components: `cx`, `IconBank` (unused), `IconUser`, `IconLock`, `IconEye`, `IconEyeOff`, `IconHelp` (~120 lines)**

- [ ] **Step 3: Add imports:**

```tsx
import { cn } from '@/lib/utils';
import { User, Lock, Eye, EyeOff, HelpCircle, ArrowRight } from 'lucide-react';
```

- [ ] **Step 4: Replace icon usages in JSX:**

| Find | Replace |
|------|---------|
| `<IconUser />` | `<User />` |
| `<IconLock />` | `<Lock />` |
| `<IconEye />` | `<Eye />` |
| `<IconEyeOff />` | `<EyeOff />` |
| `<IconHelp />` | `<HelpCircle />` |

- [ ] **Step 5: Replace `cx(` with `cn(` (2 usages)**

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Auth/Login.tsx
git commit -m "refactor: replace inline SVG icons with lucide-react in Login.tsx"
```

---

### Task 11: Replace neutral-* with slate-* in Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Find all `neutral-*` occurrences (7 lines)**

- [ ] **Step 2: Replace:**

| Find | Replace |
|------|---------|
| `border-neutral-200` | `border-slate-200` |
| `border-neutral-300` | `border-slate-300` |
| `text-neutral-400` | `text-slate-400` |
| `text-neutral-600` | `text-slate-600` |
| `text-neutral-800` | `text-slate-800` |
| `hover:bg-neutral-100` | `hover:bg-slate-100` |
| `dark:border-neutral-700` | `dark:border-slate-700` |
| `dark:bg-neutral-800` | `dark:bg-slate-800` |
| `dark:text-neutral-100` | `dark:text-slate-100` |
| `dark:text-neutral-300` | `dark:text-slate-300` |
| `dark:hover:bg-neutral-700` | `dark:hover:bg-slate-700` |
| `hover:border-blue-300` | `hover:border-slate-300` |
| `dark:hover:border-blue-500` | `dark:hover:border-slate-500` |

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: replace neutral-* and blue-* with slate-* in Create.tsx"
```

---

### Task 12: Final Build Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npm run types`
Expected: No new errors

- [ ] **Step 2: Build frontend**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Verify line counts**

```bash
wc -l resources/js/Pages/Transactions/Create.tsx resources/js/Pages/Transactions/Recap.tsx resources/js/Pages/Auth/Login.tsx
```

Expected: Create < 1000, Recap < 300, Login < 200

- [ ] **Step 4: Commit build artifacts**

```bash
git add public/build/
git commit -m "build: compile Phase 3 page refactor"
```

---

## Verification Checklist

- [ ] Create.tsx < 1000 lines
- [ ] Recap.tsx < 300 lines
- [ ] Login.tsx < 200 lines
- [ ] No inline `formatRupiah`/`formatDateTime` (imported from `@/lib/format`)
- [ ] No inline `ProductCard`/`CategoryGrid`/`VehicleFilter` (imported from `@/components/pos/`)
- [ ] No inline SVG icons in Login.tsx (lucide-react)
- [ ] No `cx()` anywhere (all `cn()`)
- [ ] No `neutral-*` or `blue-*` hardcoded colors (all `slate-*`)
- [ ] Shared sidebar component used by both Create.tsx and Recap.tsx
- [ ] Shared logout modal used by both Create.tsx and Recap.tsx
- [ ] `npm run build` passes
