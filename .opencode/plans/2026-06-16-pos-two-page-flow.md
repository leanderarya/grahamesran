# POS Two-Page Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split POS into Transaction Workspace + Checkout page, with draft transaction persistence.

**Architecture:** Add `status` column to transactions, create draft save/load endpoints, build separate checkout page, refactor workspace to remove payment UI.

**Tech Stack:** Laravel 12, React 19, Inertia.js, TypeScript, Tailwind CSS

---

### Task 1: Add status column to transactions table

**Files:**
- Create: `database/migrations/2026_06_16_000004_add_status_to_transactions_table.php`
- Modify: `app/Models/Transaction.php`

- [ ] **Step 1: Create migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->string('status')->default('paid')->after('customer_type');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropColumn('status');
        });
    }
};
```

- [ ] **Step 2: Update Transaction model**

Add `'status'` to `$fillable` array.

Add scopes and helpers:

```php
public function scopePaid($query)
{
    return $query->where('status', 'paid');
}

public function scopeDraft($query)
{
    return $query->where('status', 'draft');
}

public function isDraft(): bool
{
    return $this->status === 'draft';
}

public function isPaid(): bool
{
    return $this->status === 'paid';
}
```

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_06_16_000004_add_status_to_transactions_table.php app/Models/Transaction.php
git commit -m "feat: add status column to transactions for draft support"
```

---

### Task 2: Add draft routes to web.php

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add new routes**

After the existing POS routes, add:

```php
Route::get('/pos/checkout', [TransactionController::class, 'checkout'])->name('transactions.checkout');
Route::post('/pos/draft', [TransactionController::class, 'saveDraft'])->name('transactions.draft.save');
Route::delete('/pos/draft/{transaction}', [TransactionController::class, 'destroyDraft'])->name('transactions.draft.destroy');
```

- [ ] **Step 2: Commit**

```bash
git add routes/web.php
git commit -m "feat: add draft and checkout routes"
```

---

### Task 3: Add saveDraft and checkout methods to TransactionController

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php`

- [ ] **Step 1: Add saveDraft() method**

```php
public function saveDraft(Request $request)
{
    $validated = $request->validate([
        'cart' => 'required|array|min:1',
        'cart.*.id' => 'required|exists:products,id',
        'cart.*.qty' => 'required|integer|min:1',
        'customer_type' => 'required|in:general,workshop',
        'draft_id' => 'nullable|exists:transactions,id',
    ]);

    $openSession = $this->getOpenSession();
    if ($openSession === null) {
        throw ValidationException::withMessages([
            'cart' => 'Buka kasir terlebih dahulu.',
        ]);
    }

    DB::transaction(function () use ($validated, $openSession) {
        // If updating existing draft, delete old items
        if (!empty($validated['draft_id'])) {
            $draft = Transaction::where('id', $validated['draft_id'])
                ->where('status', 'draft')
                ->where('user_id', auth()->id())
                ->firstOrFail();
            $draft->transactionItems()->delete();
        } else {
            $draft = Transaction::create([
                'user_id' => auth()->id(),
                'cashier_session_id' => $openSession->id,
                'invoice_number' => $this->generateInvoiceNumber(),
                'customer_type' => $validated['customer_type'],
                'total_amount' => 0,
                'total_profit' => 0,
                'status' => 'draft',
            ]);
        }

        // Calculate totals and create items
        $grandTotal = 0;
        $totalProfit = 0;

        foreach ($validated['cart'] as $item) {
            $product = Product::find($item['id']);
            $finalPrice = $this->determinePrice($product, $validated['customer_type']);
            $subtotal = $finalPrice * $item['qty'];
            $profit = ($finalPrice - $product->cost_price) * $item['qty'];

            TransactionItem::create([
                'transaction_id' => $draft->id,
                'product_id' => $product->id,
                'quantity' => $item['qty'],
                'price_at_time' => $finalPrice,
                'cost_at_time' => $product->cost_price,
            ]);

            $grandTotal += $subtotal;
            $totalProfit += $profit;
        }

        $draft->update([
            'total_amount' => $grandTotal,
            'total_profit' => $totalProfit,
            'customer_type' => $validated['customer_type'],
        ]);

        return redirect()->route('transactions.checkout', ['draft' => $draft->id]);
    });
}
```

- [ ] **Step 2: Add checkout() method**

```php
public function checkout(Request $request)
{
    $draftId = $request->query('draft');

    if (!$draftId) {
        return redirect()->route('transactions.create');
    }

    $draft = Transaction::with(['transactionItems.product', 'user'])
        ->where('id', $draftId)
        ->where('status', 'draft')
        ->where('user_id', auth()->id())
        ->firstOrFail();

    return Inertia::render('Transactions/Checkout', [
        'draft' => [
            'id' => $draft->id,
            'invoice_number' => $draft->invoice_number,
            'customer_type' => $draft->customer_type,
            'total_amount' => (float) $draft->total_amount,
            'total_profit' => (float) $draft->total_profit,
            'items' => $draft->transactionItems->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->display_name ?? $item->product->name,
                'quantity' => $item->quantity,
                'price_at_time' => (float) $item->price_at_time,
                'subtotal' => (float) ($item->quantity * $item->price_at_time),
            ]),
        ],
        'cashierSession' => $this->getOpenSession() ? $this->buildSessionPayload($this->getOpenSession()) : null,
    ]);
}
```

- [ ] **Step 3: Add destroyDraft() method**

```php
public function destroyDraft(Transaction $transaction)
{
    if ($transaction->status !== 'draft' || $transaction->user_id !== auth()->id()) {
        abort(403);
    }

    $transaction->transactionItems()->delete();
    $transaction->delete();

    return redirect()->route('transactions.create')->with('success', 'Draft transaksi dibatalkan.');
}
```

- [ ] **Step 4: Modify store() to accept draft_id**

Add `'draft_id' => 'nullable|exists:transactions,id'` to validation.

If `draft_id` is provided, load the existing draft instead of creating a new transaction. Update `status` from `draft` to `paid`.

- [ ] **Step 5: Modify create() to load active draft**

```php
$activeDraft = Transaction::draft()
    ->where('user_id', auth()->id())
    ->latest()
    ->first();
```

Pass `activeDraft` to Inertia props so the frontend can restore the cart.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/TransactionController.php
git commit -m "feat: add saveDraft, checkout, destroyDraft methods to TransactionController"
```

---

### Task 4: Refactor Create.tsx — Remove payment UI, add cart summary

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

- [ ] **Step 1: Remove payment-related state**

Delete: `paymentMethod`, `cashReceived`, `change`, `cashShortcutAmounts` states and related `useMemo` hooks.

- [ ] **Step 2: Remove payment-related UI**

Delete from the checkout panel:
- Payment method buttons section
- Cash received input
- Quick amount buttons
- Change display
- "Selesaikan Transaksi" button

- [ ] **Step 3: Add cart summary sticky at bottom of cart panel**

Replace the removed payment UI with:

```tsx
<div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{data.cart.length} Items | {totalQty} Qty</span>
        <span className="text-lg font-bold text-slate-900">Rp {formatRupiah(totalAmount)}</span>
    </div>
    <button
        onClick={handleSaveDraft}
        disabled={data.cart.length === 0}
        className="mt-3 w-full rounded-xl bg-slate-950 px-6 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50"
    >
        Lanjut ke Pembayaran
    </button>
</div>
```

- [ ] **Step 4: Add handleSaveDraft function**

```tsx
const handleSaveDraft = () => {
    if (data.cart.length === 0) return;

    router.post(route('transactions.draft.save'), {
        cart: data.cart.map(item => ({ id: item.id, qty: item.qty })),
        customer_type: customerType,
        draft_id: activeDraft?.id || null,
    });
};
```

- [ ] **Step 5: Load active draft on mount**

If `activeDraft` prop exists, populate the cart from draft items on component mount.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "refactor: remove payment UI from workspace, add draft save flow"
```

---

### Task 5: Create Checkout page

**Files:**
- Create: `resources/js/Pages/Transactions/Checkout.tsx`

- [ ] **Step 1: Create the checkout page**

Full-width layout with order summary (left) and payment (right).

Props from backend:
```tsx
interface CheckoutProps {
    draft: {
        id: number;
        invoice_number: string;
        customer_type: string;
        total_amount: number;
        items: Array<{
            id: number;
            product_id: number;
            product_name: string;
            quantity: number;
            price_at_time: number;
            subtotal: number;
        }>;
    };
    cashierSession: CashierSession | null;
}
```

- [ ] **Step 2: Implement order summary section**

Left column: list of items with name, qty, price, subtotal. Collapsible if > 5 items.

- [ ] **Step 3: Implement payment method selection**

3 large cards: Tunai, QRIS, Transfer. Tap to select.

- [ ] **Step 4: implement cash payment UI**

Amount due (read-only), amount received input, quick buttons (50k, 100k, 200k, 500k), change display.

- [ ] **Step 5: Implement QRIS/Transfer placeholder**

Simple UI: "Scan QR code" or "Transfer ke rekening". Manual confirmation button.

- [ ] **Step 6: Implement "Bayar Sekarang" button**

POST to `/pos` with `draft_id`, `payment_method`, `amount_paid`, `change_amount`, `customer_type`.

On success: redirect to `/pos`, print receipt.

- [ ] **Step 7: Implement "Kembali ke Transaksi" button**

Link to `/pos` (draft stays in DB).

- [ ] **Step 8: Commit**

```bash
git add resources/js/Pages/Transactions/Checkout.tsx
git commit -m "feat: create Checkout page with order summary and payment UI"
```

---

### Task 6: Run migration and build verification

- [ ] **Step 1: Run migration**

Run: `php artisan migrate`

- [ ] **Step 2: TypeScript check**

Run: `npm run types`

- [ ] **Step 3: Build frontend**

Run: `npm run build`

- [ ] **Step 4: Commit build**

```bash
git add public/build/
git commit -m "build: compile two-page POS flow"
```

---

## Verification Checklist

- [ ] `/pos` shows workspace without payment UI
- [ ] "Lanjut ke Pembayaran" saves draft and navigates to checkout
- [ ] `/pos/checkout` shows order summary and payment methods
- [ ] Cash payment with quick buttons works
- [ ] "Bayar Sekarang" finalizes transaction
- [ ] "Kembali ke Transaksi" navigates back without losing draft
- [ ] Cart restores from draft when returning to workspace
- [ ] `php artisan migrate` passes
- [ ] `npm run build` passes
