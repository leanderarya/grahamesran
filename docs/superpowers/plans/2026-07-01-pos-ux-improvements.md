# POS UX Improvements — Design of Everyday Things

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 UX gaps identified in the Don Norman audit — feedback on add-to-cart, cart item highlight, per-item delete, and prominent rack location.

**Architecture:** All changes are in existing React components. No new files. No backend changes. CSS-only animations for feedback, React state for cart highlighting, icon button for delete, styled badge for location.

**Tech Stack:** React 19, Inertia.js, Tailwind CSS 4, Lucide React icons

## Global Constraints

- Primary accent: `bg-indigo-600` / `#4F46E5`
- Border radius: `rounded-xl` for cards, `rounded-lg` for buttons
- No shadows on cards — border-only approach
- Background: `bg-white`
- Primary text: `text-slate-950`, secondary: `text-slate-500`, muted: `text-slate-400`
- Target device: Samsung Tab A8 10.5" (1920×1200 landscape)

---

### Task 1: Add-to-Cart Feedback Animation

**Problem:** When a cashier taps a product card, there is no visual feedback confirming the item was added to the cart. The Gulf of Evaluation is too wide.

**Files:**
- Modify: `resources/js/Components/pos/product-card.tsx`
- Modify: `resources/css/app.css`

**Interfaces:**
- Consumes: `onAddToCart(product)` callback from parent (existing)
- Produces: Visual feedback (green flash animation on card)

- [ ] **Step 1: Add CSS animation for add-to-cart flash**

In `resources/css/app.css`, add after the existing `@theme` block:

```css
@keyframes cart-flash {
    0% { background-color: #f0fdf4; border-color: #86efac; }
    100% { background-color: transparent; border-color: #e2e8f0; }
}

.cart-flash {
    animation: cart-flash 0.4s ease-out;
}
```

- [ ] **Step 2: Update ProductCard to trigger animation on add**

In `resources/js/Components/pos/product-card.tsx`, add state and animation logic. The current file is at lines 1-88. Replace the entire file:

```tsx
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { Plus } from 'lucide-react';
import { useCallback, useRef } from 'react';

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

    const cardRef = useRef<HTMLButtonElement>(null);

    const handleClick = useCallback(() => {
        if (isOut) return;
        onAddToCart(product);
        // Trigger flash animation
        const card = cardRef.current;
        if (card) {
            card.classList.remove('cart-flash');
            // Force reflow to restart animation
            void card.offsetWidth;
            card.classList.add('cart-flash');
        }
    }, [isOut, onAddToCart, product]);

    return (
        <button
            ref={cardRef}
            type="button"
            onClick={handleClick}
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

            <div className="mt-1 flex-1 text-sm font-semibold leading-snug text-slate-950 line-clamp-2">
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
                                : 'text-slate-950',
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

- [ ] **Step 3: Verify build**

Run: `npm run build` from `/Users/aryaajisadda/Documents/KERJA/grahamesran`
Expected: No errors

- [ ] **Step 4: Visual test**

- Tap a product card → card background flashes green briefly (0.4s)
- Tap rapidly → each tap triggers flash (animation restarts)
- Out-of-stock card → no flash, no action

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/pos/product-card.tsx resources/css/app.css
git commit -m "feat(pos): add green flash feedback on add-to-cart"
```

---

### Task 2: Highlight Products Already in Cart

**Problem:** Cashiers cannot tell which products are already in the cart without looking at the sidebar.

**Files:**
- Modify: `resources/js/Components/pos/product-card.tsx`

**Interfaces:**
- Consumes: New `inCartQty` prop (number, 0 = not in cart)
- Produces: Green border + small badge showing qty in cart

- [ ] **Step 1: Add `inCartQty` prop to ProductCard**

In `resources/js/Components/pos/product-card.tsx`, update the interface and component:

Add to `ProductCardProps`:
```tsx
interface ProductCardProps {
    product: Product;
    customerType: string;
    onAddToCart: (product: Product) => void;
    inCartQty?: number;
    className?: string;
}
```

Update the function signature:
```tsx
export function ProductCard({ product, customerType, onAddToCart, inCartQty = 0, className }: ProductCardProps) {
```

- [ ] **Step 2: Add visual highlight for in-cart products**

Update the button's `className` to show green border when in cart:

```tsx
            className={cn(
                'flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.97]',
                isOut
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40'
                    : inCartQty > 0
                      ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                className,
            )}
```

- [ ] **Step 3: Add qty badge on the card**

Add a badge in the top-right corner of the card when `inCartQty > 0`. Add this right after the `<button ...>` opening tag:

```tsx
            {/* Cart qty badge */}
            {inCartQty > 0 && (
                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {inCartQty}
                </div>
            )}
```

Also add `relative` to the button's className for the badge positioning:
```tsx
                'relative flex flex-col rounded-xl border p-3 text-left transition-all active:scale-[0.97]',
```

- [ ] **Step 4: Pass `inCartQty` from Create.tsx**

In `resources/js/Pages/Transactions/Create.tsx`, where `ProductCard` is rendered, compute the cart qty:

Find the product card rendering (around line 400):
```tsx
{displayProducts.map((product) => (
    <ProductCard
        key={product.id}
        product={product}
        customerType={customerType}
        onAddToCart={addToCart}
    />
))}
```

Change to:
```tsx
{displayProducts.map((product) => {
    const cartItem = data.cart.find((item) => item.id === product.id);
    return (
        <ProductCard
            key={product.id}
            product={product}
            customerType={customerType}
            onAddToCart={addToCart}
            inCartQty={cartItem?.qty || 0}
        />
    );
})}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 6: Visual test**

- Add a product to cart → card border turns green, small indigo badge with "1" appears
- Add same product again → badge updates to "2"
- Remove product from cart → card returns to normal

- [ ] **Step 7: Commit**

```bash
git add resources/js/Components/pos/product-card.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(pos): highlight products already in cart with green border and qty badge"
```

---

### Task 3: Per-Item Delete Button in Cart

**Problem:** Users cannot delete individual items from the cart. They must tap minus repeatedly or use "Hapus Semua".

**Files:**
- Modify: `resources/js/Components/pos/checkout-panel.tsx`

**Interfaces:**
- Consumes: `removeItem(id)` callback from parent (existing, currently unused in UI)
- Produces: Small trash icon button per cart item row

- [ ] **Step 1: Add delete button to each cart item row**

In `resources/js/Components/pos/checkout-panel.tsx`, find the cart item rendering (around line 98-130). The current structure for each item is:

```tsx
<div key={item.id}>
    <div className="flex items-start gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">...</div>
        <div className="flex items-center gap-1.5">...</div>
        <div className="text-sm font-bold ...">...</div>
    </div>
</div>
```

Update to add a delete button. Replace the item row with:

```tsx
                    <div key={item.id}>
                        <div className="flex items-start gap-3 px-4 py-3">
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-slate-950 line-clamp-1">
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
                                <span className="w-8 text-center text-sm font-bold text-slate-950">
                                    {item.qty}
                                </span>
                                <button
                                    onClick={() => updateQty(item.id, 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="text-sm font-bold text-slate-950 whitespace-nowrap">
                                    Rp {formatRupiah(price * Number(item.qty || 0))}
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                    title="Hapus item"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {index < cart.length - 1 && (
                            <div className="border-b border-slate-100" />
                        )}
                    </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Visual test**

- Add items to cart → each item row has a small trash icon on the right
- Tap trash icon → item removed from cart immediately
- Trash icon has red hover state

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/pos/checkout-panel.tsx
git commit -m "feat(pos): add per-item delete button in cart sidebar"
```

---

### Task 4: Prominent Rack Location Badge on Product Card

**Problem:** The SKU already contains the rack location (e.g., A1-0001), but it's displayed as small muted text. New employees need this to be more visible.

**Files:**
- Modify: `resources/js/Components/pos/product-card.tsx`

**Interfaces:**
- Consumes: `product.sku` (format: "A1-0001")
- Produces: Prominent rack location badge extracted from SKU prefix

- [ ] **Step 1: Extract rack code from SKU and add badge**

In `resources/js/Components/pos/product-card.tsx`, the SKU is already displayed. Add a more prominent rack badge. The SKU format is `A1-0001` where `A1` is the rack code.

Update the card content. Find the SKU display line:

```tsx
            <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {product.sku || 'NOSKU'}
            </div>
```

Replace with:

```tsx
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                    {product.sku || 'NOSKU'}
                </div>
                {product.sku && product.sku.includes('-') && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        📍 {product.sku.split('-')[0]}
                    </span>
                )}
            </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Visual test**

- Each product card shows a rack badge (e.g., "📍 A1") in the top-right corner
- Badge is more prominent than the SKU text
- Products without SKU format (no dash) don't show badge

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/pos/product-card.tsx
git commit -m "feat(pos): add prominent rack location badge on product card"
```
