# POS UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the POS cashier UI to a tablet-first two-panel layout with monochrome slate + indigo accent color scheme, removing sidebar and vehicle filter for a cleaner operational interface.

**Architecture:** Two-panel fixed layout (60/40 split) on tablet. Left panel: horizontal category chips + product grid. Right panel: sticky checkout cart. Top bar replaces sidebar for navigation. All modals and checkout page refreshed with consistent `rounded-xl` + indigo accent style.

**Tech Stack:** React 19, Inertia.js, Tailwind CSS 4, Lucide React icons, Ziggy routes

## Global Constraints

- Target device: Samsung Tab A8 10.5" (1920×1200 landscape)
- Primary accent: `bg-indigo-600` / `#4F46E5` replacing `bg-slate-950`
- Border radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons
- No shadows on cards — border-only approach (`border border-slate-200`)
- Background: `bg-white` (not `bg-slate-100`)
- All text follows `text-slate-950` primary, `text-slate-500` secondary, `text-slate-400` muted
- Mobile layout (bottom bar) preserved as-is for `< 1024px`

---

### Task 1: Create Top Bar Component

**Files:**
- Create: `resources/js/Components/pos/top-bar.tsx`

**Interfaces:**
- Produces: `TopBar` component used by `Create.tsx` (Task 4) and `Recap.tsx` (Task 8)

- [ ] **Step 1: Create `top-bar.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { Search, ChevronDown, BarChart3, Calculator, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { notifyWarning } from '@/Components/app-notifications';

interface TopBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    hasOpenSession: boolean;
    userName: string;
    onSettlementClick: () => void;
}

export function TopBar({
    search,
    onSearchChange,
    hasOpenSession,
    userName,
    onSettlementClick,
}: TopBarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            {/* Left: Logo + Brand */}
            <div className="flex items-center gap-2.5">
                <img
                    src="/Grahamotor-light.png"
                    alt="Graha Motor"
                    className="h-7 w-7 object-contain"
                />
                <span className="text-base font-bold text-slate-900">
                    Graha Motor
                </span>
            </div>

            {/* Center: Search */}
            <div className="mx-6 max-w-md flex-1">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari barang, SKU, model..."
                        className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                    />
                </div>
            </div>

            {/* Right: Status + Avatar */}
            <div className="flex items-center gap-3">
                {/* Status Dot */}
                <button
                    onClick={onSettlementClick}
                    className={cn(
                        'h-3 w-3 rounded-full transition-colors',
                        hasOpenSession
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-red-500 hover:bg-red-600',
                    )}
                    title={hasOpenSession ? 'Sesi aktif — tap untuk settlement' : 'Belum buka kasir'}
                />

                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-600">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            <div className="px-4 py-2.5">
                                <div className="text-sm font-semibold text-slate-900">
                                    {userName}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Kasir aktif
                                </div>
                            </div>
                            <div className="border-t border-slate-100" />
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    router.visit(route('transactions.recap'));
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <BarChart3 className="h-4 w-4 text-slate-400" />
                                Rekap Penjualan
                            </button>
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    onSettlementClick();
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Calculator className="h-4 w-4 text-slate-400" />
                                Settlement
                            </button>
                            <div className="border-t border-slate-100" />
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    if (hasOpenSession) {
                                        notifyWarning(
                                            'Kasir masih terbuka. Selesaikan settlement terlebih dahulu.',
                                            'Logout diblokir',
                                        );
                                        return;
                                    }
                                    router.post(route('logout'));
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npm run build` (or check IDE for type errors)
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/top-bar.tsx
git commit -m "feat(pos): add top-bar component replacing sidebar navigation"
```

---

### Task 2: Create Category Chips Component

**Files:**
- Create: `resources/js/Components/pos/category-chips.tsx`

**Interfaces:**
- Produces: `CategoryChips` component used by `Create.tsx` (Task 4)

- [ ] **Step 1: Create `category-chips.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface CategoryChipsProps {
    groups: { name: string; count: number }[];
    selected: string | null;
    onSelect: (category: string | null) => void;
    className?: string;
}

export function CategoryChips({
    groups,
    selected,
    onSelect,
    className,
}: CategoryChipsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex gap-2 overflow-x-auto scrollbar-none',
                className,
            )}
        >
            {/* "Semua" chip */}
            <button
                onClick={() => onSelect(null)}
                className={cn(
                    'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                    selected === null
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
            >
                Semua
            </button>

            {groups.map((group) => (
                <button
                    key={group.name}
                    onClick={() => onSelect(group.name)}
                    className={cn(
                        'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                        selected === group.name
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                >
                    {group.name}
                    <span className="ml-1.5 text-xs opacity-60">
                        {group.count}
                    </span>
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/category-chips.tsx
git commit -m "feat(pos): add horizontal category-chips component"
```

---

### Task 3: Update Product Card

**Files:**
- Modify: `resources/js/Components/pos/product-card.tsx`

**Interfaces:**
- Produces: Updated `ProductCard` with smaller size, indigo accent, no shadow (used by Task 4)

- [ ] **Step 1: Rewrite `product-card.tsx`**

```tsx
import { cn } from '@/lib/utils';
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

interface ProductCardProps {
    product: Product;
    customerType: string;
    onAddToCart: (product: Product) => void;
    className?: string;
}

export function ProductCard({ product, customerType, onAddToCart, className }: ProductCardProps) {
    const stock = Number(product.stock) || 0;
    const isOut = stock <= 0;
    const workshopPrice = Number(product.workshop_price) || 0;
    const sellPrice = Number(product.sell_price) || 0;
    const activePrice =
        customerType === 'workshop' && workshopPrice > 0 ? workshopPrice : sellPrice;

    return (
        <button
            type="button"
            onClick={() => !isOut && onAddToCart(product)}
            className={cn(
                'flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.97]',
                isOut
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                className,
            )}
            disabled={isOut}
        >
            <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {product.sku || 'NOSKU'}
            </div>

            <div className="mt-1 flex-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                {product.display_name}
            </div>

            <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                            stock > 5
                                ? 'bg-emerald-100 text-emerald-700'
                                : stock > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700',
                        )}
                    >
                        {stock > 0 ? `Stok: ${stock}` : 'Habis'}
                    </span>
                    <span
                        className={cn(
                            'text-sm font-bold',
                            customerType === 'workshop' && workshopPrice > 0
                                ? 'text-amber-600'
                                : 'text-slate-900',
                        )}
                    >
                        Rp {formatRupiah(activePrice)}
                    </span>
                </div>

                {!isOut && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white transition-colors hover:bg-indigo-700">
                        <Plus className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </button>
    );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/product-card.tsx
git commit -m "feat(pos): update product-card with indigo accent and compact size"
```

---

### Task 4: Refactor Checkout Panel

**Files:**
- Modify: `resources/js/Components/pos/checkout-panel.tsx`

**Interfaces:**
- Consumes: `CartItem` type (same interface as current)
- Produces: Updated `CheckoutPanel` with flat rows, compact controls, customer type toggle

- [ ] **Step 1: Rewrite `checkout-panel.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { formatRupiah, getProductLabel } from '@/lib/format';
import { Trash2, Minus, Plus } from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
    qty: number;
}

interface CheckoutPanelProps {
    cart: CartItem[];
    productById: Map<number, CartItem>;
    getProductPrice: (product: CartItem | null | undefined) => number;
    clearCart: () => void;
    removeItem: (id: number) => void;
    updateQty: (id: number, delta: number) => void;
    totalAmount: number;
    totalQty: number;
    isWorkshop: boolean;
    hasOpenSession: boolean;
    customerType: string;
    onCustomerTypeChange: (type: string) => void;
    onSaveDraft: () => void;
    showMobileCheckout: boolean;
    onCloseMobileCheckout: () => void;
}

export function CheckoutPanel({
    cart,
    productById,
    getProductPrice,
    clearCart,
    removeItem,
    updateQty,
    totalAmount,
    totalQty,
    isWorkshop,
    hasOpenSession,
    customerType,
    onCustomerTypeChange,
    onSaveDraft,
    showMobileCheckout,
    onCloseMobileCheckout,
}: CheckoutPanelProps) {
    return (
        <section
            className={cn(
                'flex flex-col border-l border-slate-200 bg-white',
                !showMobileCheckout && 'hidden lg:flex',
                showMobileCheckout && 'fixed inset-0 z-40 lg:static lg:z-auto',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="text-sm font-bold text-slate-900">
                    Keranjang
                    {cart.length > 0 && (
                        <span className="ml-1.5 text-slate-400">
                            ({cart.length})
                        </span>
                    )}
                </div>
                {cart.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
                {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <div className="text-3xl">🛒</div>
                        <div className="mt-3 text-sm font-semibold text-slate-500">
                            Keranjang kosong
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            Tap produk untuk mulai
                        </div>
                    </div>
                )}

                {cart.map((item, index) => {
                    const product = productById.get(item.id) || item;
                    const price = getProductPrice(product);

                    return (
                        <div key={item.id}>
                            <div className="flex items-start gap-3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                                        {getProductLabel(item)}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-500">
                                        Rp {formatRupiah(price)} × {item.qty}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => updateQty(item.id, -1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-slate-900">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                    Rp {formatRupiah(price * Number(item.qty || 0))}
                                </div>
                            </div>
                            {index < cart.length - 1 && (
                                <div className="border-b border-slate-100" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-3 space-y-3">
                {/* Customer Type Toggle */}
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                    <button
                        onClick={() => onCustomerTypeChange('general')}
                        className={cn(
                            'flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors',
                            !isWorkshop
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500',
                        )}
                    >
                        Umum
                    </button>
                    <button
                        onClick={() => onCustomerTypeChange('workshop')}
                        className={cn(
                            'flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors',
                            isWorkshop
                                ? 'bg-white text-amber-700 shadow-sm'
                                : 'text-slate-500',
                        )}
                    >
                        Bengkel
                    </button>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{cart.length} item · {totalQty} pcs</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Total</span>
                    <span className="text-2xl font-bold text-slate-950">
                        Rp {formatRupiah(totalAmount)}
                    </span>
                </div>

                {/* CTA */}
                <button
                    onClick={onSaveDraft}
                    disabled={cart.length === 0}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Bayar Sekarang
                </button>
            </div>

            {/* Mobile: Back to catalog */}
            <button
                onClick={onCloseMobileCheckout}
                className="border-t border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 lg:hidden"
            >
                ← Kembali ke Katalog
            </button>
        </section>
    );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npm run build`
Expected: No errors (may have warnings about new props in Create.tsx — fixed in Task 5)

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/checkout-panel.tsx
git commit -m "feat(pos): refactor checkout-panel with flat rows and customer toggle"
```

---

### Task 5: Refactor Create.tsx — Two-Panel Layout

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

**Interfaces:**
- Consumes: `TopBar` (Task 1), `CategoryChips` (Task 2), `ProductCard` (Task 3), `CheckoutPanel` (Task 4)
- Consumes: `OpenSessionModal`, `SettlementModal`, `PrintReceipt`, `MobileBottomBar` (unchanged)

- [ ] **Step 1: Rewrite `Create.tsx`**

Replace the entire file content with the following. Key changes:
- Remove sidebar imports and logic
- Add `TopBar` at top
- Replace `CategoryGrid` with `CategoryChips`
- Remove vehicle filter
- Two-panel layout: 60% left (chips + grid), 40% right (checkout)
- Pass new `customerType` / `onCustomerTypeChange` props to `CheckoutPanel`

```tsx
import {
    AppNotifications,
    notifyError,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/Components/pos/product-card';
import { CategoryChips } from '@/Components/pos/category-chips';
import { TopBar } from '@/Components/pos/top-bar';
import { OpenSessionModal } from '@/Components/pos/open-session-modal';
import { SettlementModal } from '@/Components/pos/settlement-modal';
import { getProductLabel } from '@/lib/format';
import { CheckoutPanel } from '@/Components/pos/checkout-panel';
import { MobileBottomBar } from '@/Components/pos/mobile-bottom-bar';
import { PrintReceipt } from '@/Components/pos/print-receipt';

interface Product {
    id: number;
    name: string;
    category: string | null;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
    vehicles?: { brand?: string; model?: string }[];
}

interface CartItem extends Product {
    qty: number;
}

interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
}

interface ActiveDraft {
    id: number;
    transaction_items?: {
        product: Product;
        quantity: number;
    }[];
}

const STORE_CONFIG = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

export default function TabletPOS({ products, cashierSession, activeDraft }: { products: Product[]; cashierSession: CashierSession | null; activeDraft?: ActiveDraft | null }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState('');
    const [showMobileCheckout, setShowMobileCheckout] = useState(false);
    const [customerType, setCustomerType] = useState('general');
    const [showOpenSessionModal, setShowOpenSessionModal] =
        useState(!cashierSession);
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [openingCash, setOpeningCash] = useState('');
    const [openingNotes, setOpeningNotes] = useState('');
    const [closingCashPhysical, setClosingCashPhysical] = useState('');
    const [closingNotes, setClosingNotes] = useState('');
    const [isOpeningSession, setIsOpeningSession] = useState(false);
    const [isClosingSession, setIsClosingSession] = useState(false);
    const [sessionState, setSessionState] = useState<CashierSession | null>(cashierSession);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, setData, reset } = useForm<{ cart: CartItem[] }>({ cart: [] });

    useEffect(() => {
        setSessionState(cashierSession ?? null);
        setShowOpenSessionModal(!cashierSession);
    }, [cashierSession]);

    useEffect(() => {
        if (activeDraft && activeDraft.transaction_items) {
            const restoredCart = activeDraft.transaction_items.map(item => ({
                ...item.product,
                qty: item.quantity,
            }));
            setData('cart', restoredCart);
        }
    }, [activeDraft, setData]);

    const hasOpenSession = Boolean(sessionState?.id);
    const isWorkshop = customerType === 'workshop';
    const deferredSearch = useDeferredValue(search);

    const productById = useMemo(() => {
        const map = new Map();
        for (const product of products) map.set(product.id, product);
        return map;
    }, [products]);

    const categoryGroups = useMemo(() => {
        const groups: Record<string, number> = {};
        products.forEach((p) => {
            const cat = p.category || 'Lainnya';
            groups[cat] = (groups[cat] || 0) + 1;
        });
        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, count]) => ({ name, count }));
    }, [products]);

    const displayProducts = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        let base = products;

        // Filter by category if selected
        if (selectedCategory && !query) {
            base = base.filter(
                (p) => (p.category || 'Lainnya') === selectedCategory,
            );
        }

        // Filter by search
        if (query) {
            base = base.filter(
                (product: Product) =>
                    product.name.toLowerCase().includes(query) ||
                    (product.sku || '').toLowerCase().includes(query) ||
                    (product.vehicles?.some((vehicle: { model?: string }) =>
                        (vehicle.model || '').toLowerCase().includes(query),
                    ) ?? false),
            );
            base = base.slice(0, 40);
        }

        return base;
    }, [products, deferredSearch, selectedCategory]);

    useEffect(() => {
        if (deferredSearch.trim()) {
            setSelectedCategory(null);
        }
    }, [deferredSearch]);

    const getProductPrice = useCallback(
        (product: Product | CartItem | null | undefined) => {
            const workshopPrice = Number(product?.workshop_price) || 0;
            const sellPrice = Number(product?.sell_price) || 0;
            return customerType === 'workshop' && workshopPrice > 0
                ? workshopPrice
                : sellPrice;
        },
        [customerType],
    );

    const totalAmount = useMemo(
        () =>
            data.cart.reduce((sum, item) => {
                const product = productById.get(item.id);
                return (
                    sum +
                    getProductPrice(product || item) * (Number(item.qty) || 0)
                );
            }, 0),
        [data.cart, getProductPrice, productById],
    );

    const totalQty = useMemo(
        () => data.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
        [data.cart],
    );

    const expectedCash =
        Number(sessionState?.opening_cash || 0) +
        Number(sessionState?.cash_sales_total || 0);
    const settlementDifference =
        Number(closingCashPhysical || 0) - expectedCash;
    const settlementStatus =
        settlementDifference === 0
            ? 'balance'
            : settlementDifference < 0
              ? 'minus'
              : 'over';

    const addToCart = useCallback(
        (product: Product) => {
            if (!hasOpenSession) {
                setShowOpenSessionModal(true);
                return;
            }

            const existing = data.cart.find((item) => item.id === product.id);
            const stock = Number(product.stock) || 0;

            if (existing && Number(existing.qty || 0) + 1 > stock) {
                notifyWarning(
                    `Stok ${getProductLabel(product)} tinggal ${stock}.`,
                    'Stok terbatas',
                );
                return;
            }

            if (existing) {
                setData(
                    'cart',
                    data.cart.map((item) =>
                        item.id === product.id
                            ? { ...item, qty: Number(item.qty || 0) + 1 }
                            : item,
                    ),
                );
                return;
            }

            setData('cart', [...data.cart, { ...product, qty: 1 }]);
        },
        [data.cart, hasOpenSession, setData],
    );

    const updateQty = useCallback(
        (id: number, delta: number) => {
            setData(
                'cart',
                data.cart.map((item) => {
                    if (item.id !== id) return item;

                    const stock = Number(productById.get(id)?.stock || 0);
                    const nextQty = Math.max(1, Number(item.qty || 1) + delta);

                    if (nextQty > stock) {
                        notifyWarning(
                            `Jumlah maksimal untuk item ini adalah ${stock}.`,
                            'Melebihi stok',
                        );
                        return item;
                    }

                    return { ...item, qty: nextQty };
                }),
            );
        },
        [data.cart, productById, setData],
    );

    const removeItem = useCallback(
        (id: number) => {
            setData(
                'cart',
                data.cart.filter((item) => item.id !== id),
            );
        },
        [data.cart, setData],
    );

    const clearCart = useCallback(() => {
        setData('cart', []);
    }, [setData]);

    const handleOpenSession = useCallback(() => {
        setIsOpeningSession(true);

        router.post(
            route('transactions.session.open'),
            {
                opening_cash: Number(openingCash || 0),
                opening_notes: openingNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSessionState({
                        id: Date.now(),
                        opening_cash: Number(openingCash || 0),
                        cash_sales_total: 0,
                        non_cash_sales_total: 0,
                        transactions_count: 0,
                        opened_at: new Date().toISOString(),
                    });
                    setOpeningCash('');
                    setOpeningNotes('');
                    setShowOpenSessionModal(false);
                },
                onError: (errors: Record<string, string>) => {
                    notifyError(errors?.opening_cash || 'Gagal membuka kasir.');
                },
                onFinish: () => setIsOpeningSession(false),
            },
        );
    }, [openingCash, openingNotes]);

    const handleCloseSession = useCallback(() => {
        if (data.cart.length > 0) {
            notifyWarning(
                'Kosongkan keranjang sebelum tutup kasir.',
                'Keranjang masih terisi',
            );
            return;
        }

        setIsClosingSession(true);

        router.post(
            route('transactions.session.close'),
            {
                closing_cash_physical: Number(closingCashPhysical || 0),
                closing_notes: closingNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSessionState(null);
                    setClosingCashPhysical('');
                    setClosingNotes('');
                    setShowSettlementModal(false);
                    setShowOpenSessionModal(true);
                    reset();
                    setSearch('');
                },
                onError: (errors: Record<string, string>) => {
                    notifyError(
                        errors?.closing_cash_physical || 'Gagal menutup kasir.',
                    );
                },
                onFinish: () => setIsClosingSession(false),
            },
        );
    }, [closingCashPhysical, closingNotes, data.cart.length, reset]);

    const handleSaveDraft = useCallback(() => {
        if (data.cart.length === 0) return;

        router.post(route('transactions.draft.save'), {
            cart: data.cart.map(item => ({ id: item.id, qty: item.qty })),
            customer_type: customerType,
            draft_id: activeDraft?.id || null,
        });
    }, [data.cart, customerType, activeDraft]);

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Kasir - Graha Motor" />
            <AppNotifications flash={flash} />

            {/* Top Bar */}
            <TopBar
                search={search}
                onSearchChange={setSearch}
                hasOpenSession={hasOpenSession}
                userName={auth?.user?.name || ''}
                onSettlementClick={() =>
                    hasOpenSession
                        ? setShowSettlementModal(true)
                        : setShowOpenSessionModal(true)
                }
            />

            {/* Two-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Category + Products */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Category Chips */}
                    <div className="shrink-0 border-b border-slate-200 px-4 py-2.5">
                        <CategoryChips
                            groups={categoryGroups}
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {displayProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    customerType={customerType}
                                    onAddToCart={addToCart}
                                />
                            ))}

                            {displayProducts.length === 0 && (
                                <p className="col-span-full py-12 text-center text-sm text-slate-400">
                                    Barang tidak ditemukan.
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Panel: Checkout */}
                <CheckoutPanel
                    cart={data.cart}
                    productById={productById}
                    getProductPrice={getProductPrice}
                    clearCart={clearCart}
                    removeItem={removeItem}
                    updateQty={updateQty}
                    totalAmount={totalAmount}
                    totalQty={totalQty}
                    isWorkshop={isWorkshop}
                    hasOpenSession={hasOpenSession}
                    customerType={customerType}
                    onCustomerTypeChange={setCustomerType}
                    onSaveDraft={handleSaveDraft}
                    showMobileCheckout={showMobileCheckout}
                    onCloseMobileCheckout={() => setShowMobileCheckout(false)}
                />
            </div>

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
                cartCount={data.cart.length}
                totalAmount={totalAmount}
                hasOpenSession={hasOpenSession}
                onToggleCheckout={() => setShowMobileCheckout((current) => !current)}
                onSessionButtonClick={() =>
                    hasOpenSession
                        ? setShowSettlementModal(true)
                        : setShowOpenSessionModal(true)
                }
            />

            {/* Modals */}
            <OpenSessionModal
                show={!hasOpenSession && showOpenSessionModal}
                onClose={() => setShowOpenSessionModal(false)}
                openingCash={openingCash}
                openingNotes={openingNotes}
                onOpeningCashChange={setOpeningCash}
                onOpeningNotesChange={setOpeningNotes}
                onSubmit={handleOpenSession}
                isOpeningSession={isOpeningSession}
            />

            <SettlementModal
                show={showSettlementModal && hasOpenSession}
                onClose={() => setShowSettlementModal(false)}
                sessionState={sessionState}
                closingCash={closingCashPhysical}
                closingNotes={closingNotes}
                onClosingCashChange={setClosingCashPhysical}
                onClosingNotesChange={setClosingNotes}
                onSubmit={handleCloseSession}
                isClosingSession={isClosingSession}
                expectedCash={expectedCash}
                settlementDifference={settlementDifference}
                settlementStatus={settlementStatus}
            />

            <PrintReceipt
                receiptData={null}
                storeName={STORE_CONFIG.name}
                storeAddress={STORE_CONFIG.address}
                storePhone={STORE_CONFIG.phone}
            />
        </div>
    );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Visual test on tablet viewport**

Open browser at 1920×1200. Verify:
- Top bar shows logo, search, status dot, avatar
- Category chips horizontal below top bar
- Product grid 4 columns
- Checkout panel visible on right 40%
- Tap product → appears in cart
- Category chip filters products

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(pos): refactor to two-panel tablet layout with top bar"
```

---

### Task 6: Style Refresh — Modals

**Files:**
- Modify: `resources/js/Components/pos/open-session-modal.tsx`
- Modify: `resources/js/Components/pos/settlement-modal.tsx`
- Modify: `resources/js/Components/pos/logout-modal.tsx`

**Interfaces:**
- No interface changes — same props, visual-only updates

- [ ] **Step 1: Update `open-session-modal.tsx`**

Replace the file with this updated version (style changes only: `rounded-xl`, `rounded-lg`, `bg-indigo-600`, `bg-black/40`):

```tsx
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');

interface OpenSessionModalProps {
    show: boolean;
    onClose: () => void;
    openingCash: string;
    openingNotes: string;
    onOpeningCashChange: (value: string) => void;
    onOpeningNotesChange: (value: string) => void;
    onSubmit: () => void;
    isOpeningSession: boolean;
}

export function OpenSessionModal(props: OpenSessionModalProps) {
    const {
        show,
        openingCash,
        openingNotes,
        onOpeningCashChange,
        onOpeningNotesChange,
        onSubmit,
        isOpeningSession,
    } = props;
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Buka Kasir
                </div>
                <div className="mt-2 text-xl font-bold text-slate-950">
                    Masukkan uang awal di laci
                </div>
                <div className="mt-1 text-sm text-slate-500">
                    Nilai ini akan menjadi dasar expected cash saat settlement.
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Cash Awal
                        </label>
                        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                            <span className="text-sm font-bold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={openingCash}
                                onChange={(event) =>
                                    onOpeningCashChange(
                                        sanitizeNumericInput(event.target.value),
                                    )
                                }
                                placeholder="0"
                                className="w-full border-0 bg-transparent p-0 text-xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Catatan (opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={openingNotes}
                            onChange={(event) =>
                                onOpeningNotesChange(event.target.value)
                            }
                            placeholder="Opsional"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-5 flex gap-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Keluar
                    </Link>
                    <button
                        onClick={onSubmit}
                        disabled={isOpeningSession}
                        className="flex-[1.2] rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        {isOpeningSession ? 'Membuka...' : 'Buka Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Update `settlement-modal.tsx`**

Replace with this updated version (2×2 stat grid, `rounded-xl`, `bg-indigo-600`):

```tsx
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { X } from 'lucide-react';

const sanitizeNumericInput = (value: string) => value.replace(/[^\d]/g, '');

const formatSignedCurrency = (value: number) =>
    `${value < 0 ? '-' : ''}Rp ${formatRupiah(Math.abs(value || 0))}`;

interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
}

interface SettlementModalProps {
    show: boolean;
    onClose: () => void;
    sessionState: CashierSession | null;
    closingCash: string;
    closingNotes: string;
    onClosingCashChange: (value: string) => void;
    onClosingNotesChange: (value: string) => void;
    onSubmit: () => void;
    isClosingSession: boolean;
    expectedCash: number;
    settlementDifference: number;
    settlementStatus: 'balance' | 'minus' | 'over';
}

export function SettlementModal({
    show,
    onClose,
    sessionState,
    closingCash,
    closingNotes,
    onClosingCashChange,
    onClosingNotesChange,
    onSubmit,
    isClosingSession,
    expectedCash,
    settlementDifference,
    settlementStatus,
}: SettlementModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Settlement
                        </div>
                        <div className="mt-1 text-xl font-bold text-slate-950">
                            Tutup kasir dan cocokkan uang fisik
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 2×2 Stat Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Saldo Awal
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.opening_cash || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Cash Sales
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.cash_sales_total || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Non Cash
                        </div>
                        <div className="mt-1.5 text-lg font-bold text-slate-950">
                            Rp {formatRupiah(sessionState?.non_cash_sales_total || 0)}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3.5 text-white">
                        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Expected Cash
                        </div>
                        <div className="mt-1.5 text-lg font-bold">
                            Rp {formatRupiah(expectedCash)}
                        </div>
                    </div>
                </div>

                {/* Input Section */}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Uang Fisik Di Laci
                        </label>
                        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                            <span className="text-sm font-bold text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={closingCash}
                                onChange={(event) =>
                                    onClosingCashChange(
                                        sanitizeNumericInput(event.target.value),
                                    )
                                }
                                placeholder="0"
                                className="w-full border-0 bg-transparent p-0 text-xl font-bold text-slate-950 focus:ring-0 focus:outline-none"
                            />
                        </div>

                        <label className="mt-3 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Catatan
                        </label>
                        <textarea
                            rows={2}
                            value={closingNotes}
                            onChange={(event) =>
                                onClosingNotesChange(event.target.value)
                            }
                            placeholder="Opsional"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-0 focus:outline-none"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Hasil
                        </div>
                        <div
                            className={cn(
                                'mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold uppercase',
                                settlementStatus === 'balance'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : settlementStatus === 'minus'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700',
                            )}
                        >
                            {settlementStatus === 'balance'
                                ? 'Balance'
                                : settlementStatus === 'minus'
                                  ? 'Minus'
                                  : 'Lebih'}
                        </div>
                        <div
                            className={cn(
                                'mt-3 text-2xl font-bold',
                                settlementStatus === 'balance'
                                    ? 'text-emerald-700'
                                    : settlementStatus === 'minus'
                                      ? 'text-red-700'
                                      : 'text-amber-700',
                            )}
                        >
                            {formatSignedCurrency(settlementDifference)}
                        </div>
                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                            <div className="flex justify-between">
                                <span>Expected</span>
                                <span className="font-bold text-slate-900">
                                    Rp {formatRupiah(expectedCash)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fisik</span>
                                <span className="font-bold text-slate-900">
                                    Rp {formatRupiah(Number(closingCash || 0))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Transaksi</span>
                                <span className="font-bold text-slate-900">
                                    {sessionState?.transactions_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isClosingSession}
                        className="flex-[1.2] rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        {isClosingSession ? 'Menyimpan...' : 'Simpan & Tutup Kasir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Update `logout-modal.tsx`**

Replace with this updated version:

```tsx
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface LogoutModalProps {
    show: boolean;
    onClose: () => void;
}

export function LogoutModal({ show, onClose }: LogoutModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                <div className="text-lg font-bold text-slate-950">
                    Keluar dari kasir?
                </div>
                <div className="mt-1 text-sm text-slate-500">
                    Gunakan logout hanya jika tidak ada sesi kasir yang aktif.
                </div>
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                        Ya, Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/pos/open-session-modal.tsx resources/js/Components/pos/settlement-modal.tsx resources/js/Components/pos/logout-modal.tsx
git commit -m "feat(pos): refresh modal styles with rounded-xl and indigo accent"
```

---

### Task 7: Update Checkout Page

**Files:**
- Modify: `resources/js/Pages/Transactions/Checkout.tsx`

**Interfaces:**
- Same props interface — visual-only changes

- [ ] **Step 1: Update `Checkout.tsx` style classes**

Key changes in the file:
1. Replace all `rounded-[2rem]` → `rounded-xl`
2. Replace all `rounded-3xl` → `rounded-lg`
3. Replace all `rounded-2xl` → `rounded-lg`
4. Replace `bg-slate-950` → `bg-indigo-600` for primary buttons
5. Replace `hover:bg-slate-800` → `hover:bg-indigo-700`
6. Replace `bg-slate-100` → `bg-white` for page background
7. Change grid layout from `lg:grid-cols-[1fr_440px]` → `lg:grid-cols-[55%_45%]`
8. Compact payment method buttons
9. `shadow-sm` → remove shadows from cards

Apply these replacements:

- Line 156: `bg-slate-100` → `bg-white`
- Line 160: `lg:grid-cols-[1fr_440px]` → `lg:grid-cols-[55%_45%]`
- Line 160: `xl:grid-cols-[1fr_480px]` → remove (use same 55/45)
- Line 167: `rounded-2xl` → `rounded-lg`
- Line 178: `rounded-[2rem]` → `rounded-xl`
- Line 228: `rounded-3xl` → `rounded-xl`
- Line 241: `rounded-[2rem]` → `rounded-xl`
- Line 257: `rounded-2xl` → `rounded-lg`
- Line 259: `border-slate-950 bg-slate-950` → `border-indigo-600 bg-indigo-600`
- Line 278: `rounded-2xl` → `rounded-lg`
- Line 302: `rounded-2xl` → `rounded-lg`
- Line 336: `rounded-2xl` → `rounded-lg`
- Line 373: `rounded-3xl` → `rounded-lg`, `bg-slate-950` → `bg-indigo-600`, `hover:bg-slate-800` → `hover:bg-indigo-700`
- Line 382: `rounded-3xl` → `rounded-lg`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Checkout.tsx
git commit -m "feat(pos): refresh checkout page with indigo accent and compact layout"
```

---

### Task 8: Update Recap Page

**Files:**
- Modify: `resources/js/Pages/Transactions/Recap.tsx`

**Interfaces:**
- Same props — uses `TopBar` instead of `PosSidebar`

- [ ] **Step 1: Refactor `Recap.tsx`**

Key changes:
- Remove `PosSidebar` import and usage
- Add `TopBar` import and usage
- Remove sidebar toggle button
- Update all `rounded-[2rem]` → `rounded-xl`, `rounded-3xl` → `rounded-lg`
- Update `bg-slate-950` → `bg-slate-900` for stat card
- Remove `bg-slate-100` → `bg-white` page background
- Remove unused `sidebarCollapsed` state
- Remove unused `ChevronLeft`, `ChevronRight` imports

Replace the imports section with:

```tsx
import {
    AppNotifications,
    notifyWarning,
} from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { LogoutModal } from '@/Components/pos/logout-modal';
```

Remove `sidebarCollapsed` state. Remove `menuItems` array (navigation now in TopBar). Replace the layout with:

```tsx
<div className="flex h-screen flex-col bg-white">
    <Head title="Rekap Penjualan - Graha Motor" />
    <AppNotifications flash={flash} />

    <TopBar
        search=""
        onSearchChange={() => {}}
        hasOpenSession={hasOpenSession}
        userName={auth?.user?.name || ''}
        onSettlementClick={() => router.visit(route('transactions.create'))}
    />

    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* ... rest of recap content with rounded-xl / rounded-lg ... */}
    </main>
</div>
```

Update all card classes: `rounded-[2rem]` → `rounded-xl`, `rounded-3xl` → `rounded-lg`, `shadow-sm` → remove, `bg-slate-950` → `bg-slate-900`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Recap.tsx
git commit -m "feat(pos): refactor recap page to use top-bar and updated styles"
```

---

### Task 9: Cleanup — Delete Old Files

**Files:**
- Delete: `resources/js/Components/pos/pos-sidebar.tsx`
- Delete: `resources/js/Components/pos/vehicle-filter.tsx`
- Delete: `resources/js/Components/pos/category-grid.tsx`
- Modify: `resources/js/Components/stock-badge.tsx`

**Interfaces:**
- `stock-badge.tsx` is still imported by `Recap.tsx` (top products section) — update only styling

- [ ] **Step 1: Delete old files**

```bash
rm resources/js/Components/pos/pos-sidebar.tsx
rm resources/js/Components/pos/vehicle-filter.tsx
rm resources/js/Components/pos/category-grid.tsx
```

- [ ] **Step 2: Update `stock-badge.tsx`**

```tsx
import { cn } from '@/lib/utils';

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
    return (
        <span
            className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
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

- [ ] **Step 3: Verify no broken imports**

Run: `npm run build`
Expected: No errors (if any import references deleted files, fix them)

- [ ] **Step 4: Verify no references to deleted files remain**

Run: `grep -r "pos-sidebar\|vehicle-filter\|category-grid" resources/js/ --include="*.tsx" --include="*.ts"`
Expected: No output (no remaining references)

- [ ] **Step 5: Commit**

```bash
git add -A resources/js/Components/pos/
git commit -m "feat(pos): delete old sidebar, vehicle-filter, category-grid files"
```

---

### Task 10: Final Visual QA

**Files:** None (testing only)

- [ ] **Step 1: Test tablet viewport (1920×1200)**

Open Chrome DevTools → set to 1920×1200. Verify:
- [ ] Top bar: logo, search, green/red dot, avatar dropdown
- [ ] Category chips: horizontal scroll, "Semua" default selected
- [ ] Product grid: 4 columns, compact cards, indigo [+] button
- [ ] Checkout panel: right 40%, flat item rows, customer toggle, indigo CTA
- [ ] Tap product → appears in cart
- [ ] Tap category chip → filters products
- [ ] Search → filters products, resets category
- [ ] Avatar dropdown → Rekap, Settlement, Logout
- [ ] Status dot → opens session/settlement modal

- [ ] **Step 2: Test checkout flow**

- [ ] Add products to cart → tap "Bayar Sekarang"
- [ ] Checkout page: 55/45 split, payment methods, cash input
- [ ] Cash shortcuts work
- [ ] "Bayar Sekarang" processes payment
- [ ] Returns to POS after payment

- [ ] **Step 3: Test modals**

- [ ] Open session modal: `rounded-xl`, indigo CTA
- [ ] Settlement modal: 2×2 stat grid, `rounded-xl`
- [ ] Logout modal: `rounded-xl`, indigo CTA

- [ ] **Step 4: Test mobile (375×812)**

- [ ] Single column layout
- [ ] Bottom bar visible
- [ ] Tap checkout → overlay panel
- [ ] All modals work

- [ ] **Step 5: Final commit if fixes needed**

```bash
git add -A
git commit -m "fix(pos): visual QA fixes for tablet-first redesign"
```
