# Phase 2: Discount, Stock Alert, Customer, Refund — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 POS features — Discount (per-item + per-transaction), Stock Alert (minimum threshold + notification), Customer (named profiles + purchase history), and Refund (partial item-level returns with stock restoration).

**Architecture:** Build on existing dual-mode pattern (Inertia web + Capacitor API). All new backend logic extracted to service classes (TransactionService, RefundService). Additive-only migrations (no data loss). Frontend extends existing component tree with new modals, selectors, and badge indicators.

**Tech Stack:** Laravel 12, React 19, Inertia.js, Capacitor 8, Tailwind CSS 4, ESC/POS thermal printing

## Global Constraints

- All UI follows compact tablet design (padding `p-2.5` to `p-3`, font `text-xs` to `text-sm`)
- Every feature must implement both web (Inertia) and Capacitor (API) modes
- No breaking changes to existing functionality
- Commits after each task completion
- All new routes inside `kasir-only` middleware group
- Migrations are additive only (DEFAULT values for new columns, nullable FKs)
- Service classes must be stateless — no instance variables between requests

---

## File Structure

### New Files (Backend)

| File | Responsibility |
|------|----------------|
| `app/Services/TransactionService.php` | Shared transaction logic (store, void, price calculation) |
| `app/Services/RefundService.php` | Refund processing, stock restoration, status management |
| `app/Models/Customer.php` | Customer entity with transactions relationship |
| `app/Models/Refund.php` | Refund header with items relationship |
| `app/Models/RefundItem.php` | Individual refunded line items |
| `app/Http/Controllers/Api/CustomerController.php` | Customer CRUD + search API |
| `database/migrations/xxxx_add_discount_columns.php` | Discount fields on transactions + items |
| `database/migrations/xxxx_add_min_stock_to_products.php` | Minimum stock threshold |
| `database/migrations/xxxx_create_customers_table.php` | Customer entity table |
| `database/migrations/xxxx_add_customer_id_to_transactions.php` | Customer FK on transactions |
| `database/migrations/xxxx_create_refunds_table.php` | Refund header table |
| `database/migrations/xxxx_create_refund_items_table.php` | Refund line items table |
| `database/migrations/xxxx_add_returned_qty_to_items.php` | Returned quantity tracking |

### New Files (Frontend)

| File | Responsibility |
|------|----------------|
| `resources/js/types/pos.ts` | Centralized POS TypeScript interfaces |
| `resources/js/Components/pos/customer-selector.tsx` | Customer search + select + inline create |
| `resources/js/Components/pos/stock-alert-banner.tsx` | Low-stock warning banner |
| `resources/js/Components/pos/refund-modal.tsx` | Partial refund modal with item selection |

### Modified Files

| File | Changes |
|------|---------|
| `app/Http/Controllers/TransactionController.php` | Delegate to TransactionService, add refund route |
| `app/Http/Controllers/Api/TransactionController.php` | Delegate to TransactionService, add refund endpoint |
| `app/Http/Controllers/Api/SessionController.php` | Recalculate session totals from actual transactions |
| `app/Models/Transaction.php` | Add discount/customer/refund fields, new scopes |
| `app/Models/TransactionItem.php` | Add discount/returned_qty fields |
| `app/Models/Product.php` | Add min_stock field, lowStock scope |
| `routes/web.php` | Add refund route |
| `routes/api.php` | Add customer + refund routes |
| `resources/js/Pages/Transactions/Create.tsx` | Customer selector, stock alert, discount props |
| `resources/js/Components/pos/checkout-panel.tsx` | Discount input per item, customer display |
| `resources/js/Components/pos/product-card.tsx` | Discount price display, low-stock border |
| `resources/js/Components/pos/top-bar.tsx` | Stock alert bell icon |
| `resources/js/Pages/Transactions/History.tsx` | Refund status badges, refund button |
| `resources/js/lib/printer.ts` | Discount line on receipt, refund receipt, customer name |
| `resources/js/lib/format.ts` | formatDiscount, formatPercent helpers |
| `resources/js/Components/pos/settlement-modal.tsx` | Refund/discount summary in settlement |
| `resources/js/Components/pos/closing-report.tsx` | Refund/discount sections |

---

## Phase A: Tech Debt & Foundation

### Task 0: Fix Session Counter Drift on Void

**Problem:** When a transaction is voided, `cashier_sessions.cash_sales_total`, `non_cash_sales_total`, and `transactions_count` are not decremented. Settlement numbers become wrong.

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php:410-443`
- Modify: `app/Http/Controllers/Api/TransactionController.php` (void method)

**Interfaces:**
- Produces: Correctly recalculated session totals after void

- [ ] **Step 1: Update web void() to recalculate session totals**

In `app/Http/Controllers/TransactionController.php`, replace the `void()` method (lines 410-443) with:

```php
public function void(Request $request, Transaction $transaction)
{
    $request->validate([
        'pin' => ['required', 'digits:4'],
        'reason' => ['required', 'string', 'max:500'],
    ]);

    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return back()->withErrors(['pin' => 'PIN admin salah.']);
    }

    if ($transaction->status === 'voided') {
        return back()->withErrors(['transaction' => 'Transaksi sudah dibatalkan.']);
    }

    DB::transaction(function () use ($transaction, $admin) {
        // Restore stock
        foreach ($transaction->transactionItems as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        // Void transaction
        $transaction->update([
            'status' => 'voided',
            'void_reason' => $request->reason,
            'voided_by' => $admin->id,
            'voided_at' => now(),
        ]);

        // Recalculate session totals from actual paid transactions
        if ($transaction->cashier_session_id) {
            $session = CashierSession::find($transaction->cashier_session_id);
            if ($session && $session->closed_at === null) {
                $paidTransactions = Transaction::where('cashier_session_id', $session->id)
                    ->where('status', 'paid')
                    ->get();

                $session->update([
                    'transactions_count' => $paidTransactions->count(),
                    'cash_sales_total' => (float) $paidTransactions->where('payment_method', 'cash')->sum('total_amount'),
                    'non_cash_sales_total' => (float) $paidTransactions->where('payment_method', '!=', 'cash')->sum('total_amount'),
                ]);
            }
        }
    });

    return back()->with('success', 'Transaksi berhasil dibatalkan.');
}
```

- [ ] **Step 2: Update API void() with same recalculation logic**

In `app/Http/Controllers/Api/TransactionController.php`, apply the same `DB::transaction` wrapper and session recalculation after voiding.

- [ ] **Step 3: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep void`
Expected: Void routes still registered

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/TransactionController.php
git commit -m "fix(pos): recalculate session totals on void instead of decrementing"
```

---

### Task 1: Fix Invoice Number Collision

**Problem:** `generateInvoiceNumber()` uses `time()` which collides if two transactions are created in the same second.

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php:672-675`

**Interfaces:**
- Produces: Unique invoice numbers under concurrent access

- [ ] **Step 1: Update generateInvoiceNumber()**

Replace the private method in `TransactionController.php`:

```php
private function generateInvoiceNumber(): string
{
    return 'INV-'.date('Ymd').'-'.time().'-'.strtoupper(substr(uniqid(), -4));
}
```

- [ ] **Step 2: Verify no test breakage**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan test --filter=Transaction 2>&1 | tail -5`
Expected: Any existing tests still pass (or "No tests found" if none exist)

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/TransactionController.php
git commit -m "fix(pos): add random suffix to invoice number to prevent collision"
```

---

### Task 2: Centralize TypeScript Types

**Problem:** POS-related interfaces are defined locally in 5+ component files. Phase 2 adds Customer, Discount, Refund types — without centralization this becomes unmanageable.

**Files:**
- Create: `resources/js/types/pos.ts`

**Interfaces:**
- Produces: All POS types importable from `@/types/pos`
- Consumes: Existing local interfaces from product-card.tsx, Create.tsx, settlement-modal.tsx, printer.ts, usePrinter.ts

- [ ] **Step 1: Create pos.ts with all shared interfaces**

```typescript
// resources/js/types/pos.ts

export interface Product {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    image_url: string | null;
    image_path?: string | null;
    volume_liter: number | null;
    stock: number;
    sell_price: number;
    workshop_price: number | null;
    display_name: string;
    cost_price?: number;
    min_stock?: number;
    vehicles?: { brand?: string; model?: string }[];
}

export interface CartItem {
    id: number;
    name: string;
    sku?: string;
    stock: number | string;
    sell_price: number | string;
    workshop_price?: number | string;
    volume_liter?: number | string;
    image_url?: string;
    qty: number;
    discount_amount?: number;
    discount_type?: 'none' | 'percentage' | 'flat';
}

export interface CashierSession {
    id?: number;
    opening_cash?: number | string;
    cash_sales_total?: number | string;
    non_cash_sales_total?: number | string;
    transactions_count?: number;
    opened_at?: string;
    closing_cash_physical?: number | string | null;
    expected_cash?: number | string | null;
    cash_difference?: number | string | null;
    status?: string;
    closed_at?: string | null;
    opening_notes?: string | null;
    closing_notes?: string | null;
}

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    type: 'general' | 'workshop';
    notes: string | null;
}

export interface Transaction {
    id: number;
    invoice_number: string;
    created_at: string;
    items_count: number;
    customer_type: string;
    total_amount: number;
    payment_method: string;
    status: string;
    void_reason?: string;
    voided_at?: string;
    discount_amount?: number;
    customer_id?: number | null;
    customer?: Customer | null;
    user?: { name: string };
    refunds?: Refund[];
}

export interface Refund {
    id: number;
    transaction_id: number;
    refund_amount: number;
    refund_method: 'cash' | 'store_credit';
    reason: string | null;
    created_at: string;
    items: RefundItem[];
    user?: { name: string };
}

export interface RefundItem {
    id: number;
    refund_id: number;
    transaction_item_id: number;
    returned_quantity: number;
    refund_subtotal: number;
}

export interface StoreInfo {
    name: string;
    address: string;
    phone: string;
}

export interface ReceiptItem {
    name: string;
    volume: string | null;
    quantity: number;
    price: number;
    discount?: number;
}

export interface ReceiptData {
    invoice: string;
    date: string;
    items: ReceiptItem[];
    subtotal: number;
    discountTotal?: number;
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
    customerName?: string;
}

export interface ClosingReportData {
    date: string;
    cashierName: string;
    openedAt: string;
    closedAt: string;
    duration: string;
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    cashTotal: number;
    nonCashTotal: number;
    openingCash: number;
    cashSales: number;
    expectedCash: number;
    physicalCash: number;
    difference: number;
    settlementStatus: 'balance' | 'minus' | 'over';
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
    paymentBreakdown?: Record<string, { count: number; total: number }>;
    totalDiscount?: number;
    totalRefunded?: number;
    refundCount?: number;
}

export interface BluetoothDevice {
    name: string;
    address: string;
    type?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface StockAlert {
    product_id: number;
    product_name: string;
    sku: string;
    current_stock: number;
    min_stock: number;
}
```

- [ ] **Step 2: Verify build compiles with new types file**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors (types file is additive, nothing imports it yet)

- [ ] **Step 3: Commit**

```bash
git add resources/js/types/pos.ts
git commit -m "feat(types): centralize POS TypeScript interfaces"
```

---

## Phase B: Discount System

### Task 3: Discount Database Migration

**Files:**
- Create: `database/migrations/2026_07_02_100000_add_discount_to_transactions_and_items.php`
- Modify: `app/Models/Transaction.php`
- Modify: `app/Models/TransactionItem.php`

**Interfaces:**
- Produces: `transactions.discount_amount`, `transactions.discount_type`, `transaction_items.discount_amount`, `transaction_items.discount_type`

- [ ] **Step 1: Create migration file**

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
            $table->decimal('discount_amount', 15, 2)->default(0)->after('total_amount');
            $table->string('discount_type', 20)->default('none')->after('discount_amount');
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->decimal('discount_amount', 15, 2)->default(0)->after('price_at_time');
            $table->string('discount_type', 20)->default('none')->after('discount_amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropColumn(['discount_amount', 'discount_type']);
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->dropColumn(['discount_amount', 'discount_type']);
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate`
Expected: `Migrated: 2026_07_02_100000_add_discount_to_transactions_and_items`

- [ ] **Step 3: Update Transaction model**

In `app/Models/Transaction.php`, add to `$fillable`:
```php
'discount_amount',
'discount_type',
```

Add to `casts()`:
```php
'discount_amount' => 'decimal:2',
```

- [ ] **Step 4: Update TransactionItem model**

In `app/Models/TransactionItem.php`, add to `$fillable`:
```php
'discount_amount',
'discount_type',
```

Add a `casts()` method if one doesn't exist, or add to existing:
```php
'discount_amount' => 'decimal:2',
```

Add accessor for line total after discount:
```php
public function getSubtotalAttribute(): float
{
    return (float) $this->quantity * (float) $this->price_at_time;
}

public function getDiscountedSubtotalAttribute(): float
{
    $base = $this->subtotal;
    if ($this->discount_type === 'percentage' && $this->discount_amount > 0) {
        return $base - ($base * $this->discount_amount / 100);
    }
    if ($this->discount_type === 'flat' && $this->discount_amount > 0) {
        return max(0, $base - $this->discount_amount);
    }
    return $base;
}
```

- [ ] **Step 5: Verify migration ran**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate:status | grep discount`
Expected: Shows `Ran` status

- [ ] **Step 6: Commit**

```bash
git add database/migrations/2026_07_02_100000_add_discount_to_transactions_and_items.php app/Models/Transaction.php app/Models/TransactionItem.php
git commit -m "feat(db): add discount columns to transactions and transaction_items"
```

---

### Task 4: Extract TransactionService with Discount Support

**Files:**
- Create: `app/Services/TransactionService.php`

**Interfaces:**
- Produces: `TransactionService::processPayment(array $validated, CashierSession $session): Transaction`
- Produces: `TransactionService::voidTransaction(Transaction $transaction, User $admin, string $reason): void`
- Produces: `TransactionService::calculateItemPrice(Product $product, string $customerType): float`
- Consumes: Transaction, TransactionItem, Product, CashierSession models

- [ ] **Step 1: Create TransactionService.php**

```php
<?php

namespace App\Services;

use App\Models\CashierSession;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function processPayment(array $validated, CashierSession $session): Transaction
    {
        return DB::transaction(function () use ($validated, $session) {
            // Reuse existing draft or create new transaction
            if (! empty($validated['draft_id'])) {
                $transaction = Transaction::where('id', $validated['draft_id'])
                    ->where('status', 'draft')
                    ->where('user_id', auth()->id())
                    ->firstOrFail();

                $transaction->transactionItems()->delete();

                $transaction->update([
                    'payment_method' => $validated['payment_method'],
                    'customer_type' => $validated['customer_type'],
                    'amount_paid' => $validated['amount_paid'],
                    'change_amount' => $validated['change_amount'],
                    'status' => 'paid',
                    'discount_amount' => $validated['discount_amount'] ?? 0,
                    'discount_type' => $validated['discount_type'] ?? 'none',
                    'customer_id' => $validated['customer_id'] ?? null,
                ]);
            } else {
                $transaction = Transaction::create([
                    'user_id' => auth()->id(),
                    'cashier_session_id' => $session->id,
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'payment_method' => $validated['payment_method'],
                    'customer_type' => $validated['customer_type'],
                    'amount_paid' => $validated['amount_paid'],
                    'change_amount' => $validated['change_amount'],
                    'total_amount' => 0,
                    'total_profit' => 0,
                    'status' => 'paid',
                    'discount_amount' => $validated['discount_amount'] ?? 0,
                    'discount_type' => $validated['discount_type'] ?? 'none',
                    'customer_id' => $validated['customer_id'] ?? null,
                ]);
            }

            $grandTotal = 0;
            $totalProfit = 0;
            $totalItemDiscount = 0;

            foreach ($validated['cart'] as $item) {
                $product = Product::lockForUpdate()->find($item['id']);

                if ($product->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        'cart' => "Stok barang '{$product->name}' tidak mencukupi. Sisa: {$product->stock}",
                    ]);
                }

                $finalPrice = $this->calculateItemPrice($product, $validated['customer_type']);
                $itemDiscount = $item['discount_amount'] ?? 0;
                $itemDiscountType = $item['discount_type'] ?? 'none';

                $subtotal = $finalPrice * $item['qty'];

                // Calculate discount on this line
                $lineDiscount = 0;
                if ($itemDiscountType === 'percentage' && $itemDiscount > 0) {
                    $lineDiscount = $subtotal * $itemDiscount / 100;
                } elseif ($itemDiscountType === 'flat' && $itemDiscount > 0) {
                    $lineDiscount = min($subtotal, $itemDiscount);
                }

                $effectiveSubtotal = $subtotal - $lineDiscount;
                $profit = $effectiveSubtotal - ($product->cost_price * $item['qty']);

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['qty'],
                    'price_at_time' => $finalPrice,
                    'cost_at_time' => $product->cost_price,
                    'discount_amount' => $itemDiscount,
                    'discount_type' => $itemDiscountType,
                ]);

                $product->decrement('stock', $item['qty']);

                $grandTotal += $effectiveSubtotal;
                $totalProfit += $profit;
                $totalItemDiscount += $lineDiscount;
            }

            // Apply transaction-level discount
            $txnDiscount = 0;
            $txnDiscountType = $validated['discount_type'] ?? 'none';
            $txnDiscountValue = $validated['discount_amount'] ?? 0;

            if ($txnDiscountType === 'percentage' && $txnDiscountValue > 0) {
                $txnDiscount = $grandTotal * $txnDiscountValue / 100;
            } elseif ($txnDiscountType === 'flat' && $txnDiscountValue > 0) {
                $txnDiscount = min($grandTotal, $txnDiscountValue);
            }

            $grandTotal = max(0, $grandTotal - $txnDiscount);
            $totalProfit = max(0, $totalProfit - $txnDiscount);

            $transaction->update([
                'total_amount' => $grandTotal,
                'total_profit' => $totalProfit,
            ]);

            // Update session counters
            $cashSales = $validated['payment_method'] === 'cash' ? $grandTotal : 0;
            $nonCashSales = $validated['payment_method'] === 'cash' ? 0 : $grandTotal;

            $session->increment('transactions_count');
            $session->increment('cash_sales_total', $cashSales);
            $session->increment('non_cash_sales_total', $nonCashSales);

            return $transaction;
        });
    }

    public function voidTransaction(Transaction $transaction, User $admin, string $reason): void
    {
        DB::transaction(function () use ($transaction, $admin, $reason) {
            // Restore stock
            foreach ($transaction->transactionItems as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $transaction->update([
                'status' => 'voided',
                'void_reason' => $reason,
                'voided_by' => $admin->id,
                'voided_at' => now(),
            ]);

            // Recalculate session totals
            if ($transaction->cashier_session_id) {
                $this->recalculateSessionTotals($transaction->cashier_session_id);
            }
        });
    }

    public function calculateItemPrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return (float) $product->workshop_price;
        }

        return (float) $product->sell_price;
    }

    public function generateInvoiceNumber(): string
    {
        return 'INV-'.date('Ymd').'-'.time().'-'.strtoupper(substr(uniqid(), -4));
    }

    public function recalculateSessionTotals(int $sessionId): void
    {
        $session = CashierSession::find($sessionId);
        if (! $session || $session->closed_at !== null) {
            return;
        }

        $paidTransactions = Transaction::where('cashier_session_id', $sessionId)
            ->where('status', 'paid')
            ->get();

        $session->update([
            'transactions_count' => $paidTransactions->count(),
            'cash_sales_total' => (float) $paidTransactions->where('payment_method', 'cash')->sum('total_amount'),
            'non_cash_sales_total' => (float) $paidTransactions->where('payment_method', '!=', 'cash')->sum('total_amount'),
        ]);
    }
}
```

- [ ] **Step 2: Verify service class loads**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan tinker --execute="new App\Services\TransactionService(); echo 'OK';"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add app/Services/TransactionService.php
git commit -m "feat(service): extract TransactionService with discount support"
```

---

### Task 5: Wire TransactionService into Controllers

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php`
- Modify: `app/Http/Controllers/Api/TransactionController.php`
- Modify: `app/Http/Controllers/Api/DraftController.php`

**Interfaces:**
- Consumes: `TransactionService::processPayment()`, `TransactionService::voidTransaction()`
- Produces: Same API contracts as before (no breaking changes)

- [ ] **Step 1: Refactor web TransactionController::store()**

Replace the `store()` method (lines 546-654) in `app/Http/Controllers/TransactionController.php`:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'cart' => 'required|array|min:1',
        'cart.*.id' => 'required|exists:products,id',
        'cart.*.qty' => 'required|integer|min:1',
        'cart.*.discount_amount' => 'nullable|numeric|min:0',
        'cart.*.discount_type' => 'nullable|in:none,percentage,flat',
        'payment_method' => 'required|string',
        'amount_paid' => 'required|numeric',
        'change_amount' => 'required|numeric',
        'customer_type' => 'required|in:general,workshop',
        'draft_id' => 'nullable|exists:transactions,id',
        'discount_amount' => 'nullable|numeric|min:0',
        'discount_type' => 'nullable|in:none,percentage,flat',
        'customer_id' => 'nullable|exists:customers,id',
    ]);

    $openSession = $this->getOpenSession();
    if ($openSession === null) {
        throw ValidationException::withMessages([
            'cart' => 'Buka kasir terlebih dahulu sebelum memproses transaksi.',
        ]);
    }

    try {
        app(TransactionService::class)->processPayment($validated, $openSession);
        return redirect()->back()->with('success', 'Transaksi Berhasil Disimpan!');
    } catch (ValidationException $e) {
        throw $e;
    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem: '.$e->getMessage()]);
    }
}
```

Add the import at the top of the file:
```php
use App\Services\TransactionService;
```

- [ ] **Step 2: Refactor web TransactionController::void()**

Replace the `void()` method (now updated in Task 0) with delegation:

```php
public function void(Request $request, Transaction $transaction)
{
    $request->validate([
        'pin' => ['required', 'digits:4'],
        'reason' => ['required', 'string', 'max:500'],
    ]);

    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return back()->withErrors(['pin' => 'PIN admin salah.']);
    }

    if ($transaction->status === 'voided') {
        return back()->withErrors(['transaction' => 'Transaksi sudah dibatalkan.']);
    }

    app(TransactionService::class)->voidTransaction($transaction, $admin, $request->reason);

    return back()->with('success', 'Transaksi berhasil dibatalkan.');
}
```

- [ ] **Step 3: Refactor web TransactionController::saveDraft() and autoSaveDraft()**

Update both methods to accept and pass `discount_amount` / `discount_type` in the validation and in the transaction item creation. The core change is adding to the validation array:
```php
'cart.*.discount_amount' => 'nullable|numeric|min:0',
'cart.*.discount_type' => 'nullable|in:none,percentage,flat',
```

And passing `discount_amount` and `discount_type` in the `TransactionItem::create()` calls within both methods.

- [ ] **Step 4: Apply same changes to API TransactionController**

Mirror the store/void refactoring in `app/Http/Controllers/Api/TransactionController.php`, delegating to `TransactionService`.

- [ ] **Step 5: Verify routes still work**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep -E "store|void|draft"`
Expected: All routes still registered

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/TransactionController.php
git commit -m "refactor(controllers): delegate to TransactionService, add discount validation"
```

---

### Task 6: Discount Frontend — Checkout Panel & Product Card

**Files:**
- Modify: `resources/js/Components/pos/checkout-panel.tsx`
- Modify: `resources/js/Components/pos/product-card.tsx`
- Modify: `resources/js/lib/format.ts`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

**Interfaces:**
- Consumes: `CartItem.discount_amount`, `CartItem.discount_type` from `@/types/pos`
- Produces: Discount input UI in cart, discount price display on product card

- [ ] **Step 1: Add format helpers to format.ts**

Add at the end of `resources/js/lib/format.ts`:

```typescript
export function formatDiscount(type: string, amount: number): string {
    if (type === 'percentage') return `${amount}%`;
    if (type === 'flat') return `-Rp ${formatRupiah(amount)}`;
    return '';
}

export function formatPercent(value: number): string {
    return `${value}%`;
}
```

- [ ] **Step 2: Add discount display to product-card.tsx**

In `resources/js/Components/pos/product-card.tsx`, update the `ProductCardProps` interface to accept optional discount info:

Add to the interface:
```typescript
discountAmount?: number;
discountType?: 'none' | 'percentage' | 'flat';
```

Update the price display section to show original price with strikethrough when discounted:

```tsx
{discountAmount && discountType !== 'none' ? (
    <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 line-through">
            Rp {formatRupiah(activePrice)}
        </span>
        <span className="text-sm font-bold text-red-600">
            Rp {formatRupiah(
                discountType === 'percentage'
                    ? activePrice * (1 - discountAmount / 100)
                    : Math.max(0, activePrice - discountAmount)
            )}
        </span>
    </div>
) : (
    <span className={cn('text-sm font-bold', /* existing conditional classes */)}>
        Rp {formatRupiah(activePrice)}
    </span>
)}
```

- [ ] **Step 3: Add low-stock warning border to product-card.tsx**

Add `min_stock` to the Product interface in the card, then update the card's border class:

```tsx
// After isOut check, add low-stock check:
const isLowStock = product.min_stock != null && product.min_stock > 0 && stock <= product.min_stock && stock > 0;

// Update the className conditionals:
isOut
    ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-40'
    : inCartQty > 0
      ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
      : isLowStock
        ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
        : 'border-slate-200 bg-white hover:border-slate-300',
```

- [ ] **Step 4: Add discount input to checkout-panel.tsx**

In `resources/js/Components/pos/checkout-panel.tsx`, add a per-item discount toggle. After the quantity controls for each cart item, add:

```tsx
{/* Per-item discount */}
{item.discount_amount && item.discount_amount > 0 ? (
    <div className="flex items-center gap-1 text-[10px] text-red-500">
        <span>-{item.discount_type === 'percentage' ? `${item.discount_amount}%` : `Rp ${formatRupiah(item.discount_amount)}`}</span>
        <button
            onClick={() => onRemoveDiscount?.(item.id)}
            className="rounded p-0.5 text-slate-400 hover:text-red-500"
        >
            <X className="h-3 w-3" />
        </button>
    </div>
) : (
    <button
        onClick={() => onToggleDiscount?.(item.id)}
        className="rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
        title="Tambah diskon"
    >
        <Percent className="h-3 w-3" />
    </button>
)}
```

Add the new props to `CheckoutPanelProps`:
```typescript
onToggleDiscount?: (itemId: number) => void;
onRemoveDiscount?: (itemId: number) => void;
transactionDiscount?: { amount: number; type: string };
onTransactionDiscountChange?: (discount: { amount: number; type: string }) => void;
```

- [ ] **Step 5: Wire discount props in Create.tsx**

In `resources/js/Pages/Transactions/Create.tsx`, add state for transaction-level discount and pass to CheckoutPanel:

```typescript
const [transactionDiscount, setTransactionDiscount] = useState({ amount: 0, type: 'none' as string });
```

Pass to CheckoutPanel:
```tsx
<CheckoutPanel
    // ... existing props
    transactionDiscount={transactionDiscount}
    onTransactionDiscountChange={setTransactionDiscount}
/>
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 7: Commit**

```bash
git add resources/js/Components/pos/checkout-panel.tsx resources/js/Components/pos/product-card.tsx resources/js/lib/format.ts resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(ui): add discount input in cart and low-stock warning on product card"
```

---

### Task 7: Discount — Receipt & Closing Report

**Files:**
- Modify: `resources/js/lib/printer.ts`
- Modify: `resources/js/Components/pos/closing-report.tsx`
- Modify: `resources/js/Components/pos/settlement-modal.tsx`

**Interfaces:**
- Consumes: `ReceiptData` (updated with `discountTotal`, `customerName`)
- Consumes: `ClosingReportData` (updated with `totalDiscount`)

- [ ] **Step 1: Update ReceiptData usage in generateEscPos()**

In `resources/js/lib/printer.ts`, update the `generateEscPos()` function to include discount lines. After the item list, before the total:

```typescript
// After items loop, before total:
if (data.discountTotal && data.discountTotal > 0) {
    commands.push(...leftAlign());
    commands.push(...encodeText(`Diskon     : -Rp ${data.discountTotal.toLocaleString('id-ID')}\n`));
}
```

Also add customer name after the invoice/date header if present:
```typescript
if (data.customerName) {
    commands.push(...encodeText(`Pelanggan  : ${data.customerName}\n`));
}
```

- [ ] **Step 2: Update closing report generator**

In `generateClosingEscPos()`, add after the settlement section:

```typescript
if (data.totalDiscount && data.totalDiscount > 0) {
    commands.push(...boldOn());
    commands.push(...encodeText('DISKON\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Total Diskon : Rp ${data.totalDiscount.toLocaleString('id-ID')}\n`));
    commands.push(...hr());
}
```

- [ ] **Step 3: Update closing-report.tsx preview**

Add a "DISKON" section in the report preview after the settlement section:

```tsx
{data.totalDiscount && data.totalDiscount > 0 && (
    <>
        <div className="font-bold">DISKON</div>
        <div>Total Diskon: -Rp {formatRupiah(data.totalDiscount)}</div>
        <div className="my-2 border-t border-dashed border-slate-300" />
    </>
)}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 5: Commit**

```bash
git add resources/js/lib/printer.ts resources/js/Components/pos/closing-report.tsx
git commit -m "feat(receipt): add discount lines to receipt and closing report"
```

---

## Phase C: Stock Alert System

### Task 8: Stock Alert Migration & Model

**Files:**
- Create: `database/migrations/2026_07_02_200000_add_min_stock_to_products.php`
- Modify: `app/Models/Product.php`

**Interfaces:**
- Produces: `products.min_stock` column (int, default 0)
- Produces: `Product::scopeLowStock()` — products at or below minimum

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
        Schema::table('products', function (Blueprint $table): void {
            $table->integer('min_stock')->default(0)->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('min_stock');
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate`
Expected: `Migrated: 2026_07_02_200000_add_min_stock_to_products`

- [ ] **Step 3: Update Product model**

In `app/Models/Product.php`, add to `$fillable`:
```php
'min_stock',
```

Add to `casts()`:
```php
'min_stock' => 'integer',
```

Add scope:
```php
public function scopeLowStock($query)
{
    return $query->where('min_stock', '>', 0)
        ->whereColumn('stock', '<=', 'min_stock');
}
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_07_02_200000_add_min_stock_to_products.php app/Models/Product.php
git commit -m "feat(db): add min_stock threshold to products"
```

---

### Task 9: Stock Alert API Endpoint

**Files:**
- Modify: `app/Http/Controllers/Api/ProductController.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces: `GET /api/stock-alerts` → `{ alerts: [{ product_id, product_name, sku, current_stock, min_stock }] }`

- [ ] **Step 1: Add stockAlerts method to Api/ProductController**

```php
public function stockAlerts(): \Illuminate\Http\JsonResponse
{
    $alerts = Product::lowStock()
        ->select('id', 'sku', 'name', 'stock', 'min_stock')
        ->orderBy('stock')
        ->get()
        ->map(fn ($p) => [
            'product_id' => $p->id,
            'product_name' => $p->display_name,
            'sku' => $p->sku,
            'current_stock' => $p->stock,
            'min_stock' => $p->min_stock,
        ]);

    return response()->json(['alerts' => $alerts, 'count' => $alerts->count()]);
}
```

- [ ] **Step 2: Add route to api.php**

Inside the `auth:sanctum` group in `routes/api.php`:
```php
Route::get('/stock-alerts', [ProductController::class, 'stockAlerts']);
```

- [ ] **Step 3: Verify route registers**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep stock-alerts`
Expected: Shows the new route

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/ProductController.php routes/api.php
git commit -m "feat(api): add stock alerts endpoint"
```

---

### Task 10: Stock Alert Frontend — TopBar Bell & Banner

**Files:**
- Create: `resources/js/Components/pos/stock-alert-banner.tsx`
- Modify: `resources/js/Components/pos/top-bar.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

**Interfaces:**
- Consumes: `StockAlert[]` from API or Inertia props
- Produces: Bell icon with badge count in TopBar, dismissible banner on POS page

- [ ] **Step 1: Create stock-alert-banner.tsx**

```tsx
import { AlertTriangle, X } from 'lucide-react';
import type { StockAlert } from '@/types/pos';

interface StockAlertBannerProps {
    alerts: StockAlert[];
    onDismiss: () => void;
}

export function StockAlertBanner({ alerts, onDismiss }: StockAlertBannerProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
                {alerts.length} produk stok menipis:
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-amber-700">
                {alerts.slice(0, 3).map((a) => `${a.product_name} (${a.current_stock})`).join(', ')}
                {alerts.length > 3 && ` +${alerts.length - 3} lainnya`}
            </span>
            <button
                onClick={onDismiss}
                className="shrink-0 rounded p-1 text-amber-500 transition-colors hover:bg-amber-100"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
```

- [ ] **Step 2: Add bell icon to TopBar**

In `resources/js/Components/pos/top-bar.tsx`, add a bell icon with badge next to the printer status icon:

Add props:
```typescript
stockAlertCount?: number;
```

Add import:
```tsx
import { Bell } from 'lucide-react';
```

Add the bell icon in the right section (next to the printer icon):
```tsx
{stockAlertCount != null && stockAlertCount > 0 && (
    <div className="relative" title={`${stockAlertCount} stok menipis`}>
        <Bell className="h-4 w-4 text-amber-500" />
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {stockAlertCount > 9 ? '9+' : stockAlertCount}
        </span>
    </div>
)}
```

- [ ] **Step 3: Wire stock alerts in Create.tsx**

Add state and fetch logic in Create.tsx:

```typescript
const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
const [showStockAlert, setShowStockAlert] = useState(true);

// Fetch stock alerts
useEffect(() => {
    if (isNative()) {
        apiClient.get('/stock-alerts').then((data) => {
            setStockAlerts(data.alerts || []);
        }).catch(() => {});
    }
}, []);
```

Pass to TopBar:
```tsx
<TopBar
    // ... existing props
    stockAlertCount={showStockAlert ? stockAlerts.length : 0}
/>
```

Render banner below TopBar:
```tsx
{showStockAlert && stockAlerts.length > 0 && (
    <StockAlertBanner
        alerts={stockAlerts}
        onDismiss={() => setShowStockAlert(false)}
    />
)}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/pos/stock-alert-banner.tsx resources/js/Components/pos/top-bar.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(ui): add stock alert bell icon and low-stock banner"
```

---

## Phase D: Customer Management

### Task 11: Customer Database Migration & Model

**Files:**
- Create: `database/migrations/2026_07_02_300000_create_customers_table.php`
- Create: `database/migrations/2026_07_02_300001_add_customer_id_to_transactions.php`
- Create: `app/Models/Customer.php`
- Modify: `app/Models/Transaction.php`

**Interfaces:**
- Produces: `customers` table (id, name, phone, email, address, type, notes)
- Produces: `transactions.customer_id` FK (nullable)
- Produces: `Customer::transactions()` HasMany
- Produces: `Transaction::customer()` BelongsTo

- [ ] **Step 1: Create customers table migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('phone', 20)->nullable()->unique();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('type', 20)->default('general');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
```

- [ ] **Step 2: Create customer_id FK migration**

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
            $table->foreignId('customer_id')->nullable()->after('customer_type')->constrained('customers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
};
```

- [ ] **Step 3: Run migrations**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate`
Expected: Both migrations run successfully

- [ ] **Step 4: Create Customer model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'type',
        'notes',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%");
        });
    }
}
```

- [ ] **Step 5: Add customer relationship to Transaction model**

In `app/Models/Transaction.php`, add to `$fillable`:
```php
'customer_id',
```

Add relationship:
```php
public function customer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(Customer::class);
}
```

- [ ] **Step 6: Commit**

```bash
git add database/migrations/2026_07_02_300000_create_customers_table.php database/migrations/2026_07_02_300001_add_customer_id_to_transactions.php app/Models/Customer.php app/Models/Transaction.php
git commit -m "feat(db): create customers table and add customer_id to transactions"
```

---

### Task 12: Customer API Endpoints

**Files:**
- Create: `app/Http/Controllers/Api/CustomerController.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces: `GET /api/customers?q=` → search customers by name/phone
- Produces: `POST /api/customers` → create new customer
- Produces: `GET /api/customers/{id}` → customer detail with recent transactions

- [ ] **Step 1: Create CustomerController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->filled('q')) {
            $query->search($request->q);
        }

        $customers = $query->orderBy('name')->limit(20)->get();

        return response()->json(['customers' => $customers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
            'type' => 'required|in:general,workshop',
            'notes' => 'nullable|string|max:1000',
        ]);

        $customer = Customer::create($validated);

        return response()->json(['customer' => $customer], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load([
            'transactions' => fn ($q) => $q->where('status', 'paid')
                ->latest()
                ->limit(10)
                ->select('id', 'invoice_number', 'total_amount', 'created_at', 'status'),
        ]);

        return response()->json(['customer' => $customer]);
    }
}
```

- [ ] **Step 2: Add routes to api.php**

Inside the `auth:sanctum` group in `routes/api.php`:
```php
Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::get('/customers/{customer}', [CustomerController::class, 'show']);
```

Add the import:
```php
use App\Http\Controllers\Api\CustomerController;
```

- [ ] **Step 3: Verify routes**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep customer`
Expected: Shows the 3 new routes

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Api/CustomerController.php routes/api.php
git commit -m "feat(api): add customer CRUD and search endpoints"
```

---

### Task 13: Customer Frontend — Selector Component

**Files:**
- Create: `resources/js/Components/pos/customer-selector.tsx`
- Modify: `resources/js/Components/pos/checkout-panel.tsx`
- Modify: `resources/js/Pages/Transactions/Create.tsx`

**Interfaces:**
- Consumes: `Customer` type from `@/types/pos`
- Consumes: `apiClient.get('/customers?q=')`, `apiClient.post('/customers')`
- Produces: Selected customer passed to checkout flow

- [ ] **Step 1: Create customer-selector.tsx**

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, User } from 'lucide-react';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import type { Customer } from '@/types/pos';

interface CustomerSelectorProps {
    selectedCustomer: Customer | null;
    onSelect: (customer: Customer | null) => void;
    customerType: string;
}

export function CustomerSelector({ selectedCustomer, onSelect, customerType }: CustomerSelectorProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            return;
        }
        setIsSearching(true);
        try {
            if (isNative()) {
                const data = await apiClient.get(`/customers?q=${encodeURIComponent(q)}`);
                setResults(data.customers || []);
            }
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            const data = await apiClient.post('/customers', {
                name: newName.trim(),
                phone: newPhone.trim() || null,
                type: customerType,
            });
            onSelect(data.customer);
            setShowCreate(false);
            setNewName('');
            setNewPhone('');
            setShowDropdown(false);
        } catch {
            // handle error
        }
    };

    if (selectedCustomer) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                <User className="h-4 w-4 text-indigo-500" />
                <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-indigo-900">{selectedCustomer.name}</div>
                    {selectedCustomer.phone && (
                        <div className="text-[10px] text-indigo-500">{selectedCustomer.phone}</div>
                    )}
                </div>
                <button
                    onClick={() => onSelect(null)}
                    className="rounded p-1 text-indigo-400 hover:text-indigo-600"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Cari pelanggan..."
                    className="w-full border-0 bg-transparent p-0 text-xs text-slate-950 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                />
            </div>

            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {isSearching && (
                        <div className="px-3 py-2 text-xs text-slate-400">Mencari...</div>
                    )}

                    {!isSearching && results.length === 0 && query.length >= 2 && (
                        <div className="px-3 py-2 text-xs text-slate-400">
                            Tidak ditemukan.
                            <button
                                onClick={() => { setShowCreate(true); setNewName(query); }}
                                className="ml-1 font-semibold text-indigo-600"
                            >
                                + Buat baru
                            </button>
                        </div>
                    )}

                    {results.map((customer) => (
                        <button
                            key={customer.id}
                            onClick={() => {
                                onSelect(customer);
                                setQuery('');
                                setShowDropdown(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"
                        >
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <div>
                                <div className="font-semibold text-slate-950">{customer.name}</div>
                                {customer.phone && <div className="text-slate-400">{customer.phone}</div>}
                            </div>
                        </button>
                    ))}

                    {showCreate && (
                        <div className="border-t border-slate-100 p-3">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Pelanggan Baru</div>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nama"
                                className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                            />
                            <input
                                type="text"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="No. HP (opsional)"
                                className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 rounded border border-slate-200 py-1.5 text-xs text-slate-600"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim()}
                                    className="flex-1 rounded bg-indigo-600 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Add customer selector to checkout-panel.tsx**

Add new props:
```typescript
selectedCustomer?: Customer | null;
onCustomerSelect?: (customer: Customer | null) => void;
```

Render the selector above the customer type toggle:
```tsx
{onCustomerSelect && (
    <div className="px-4 py-2">
        <CustomerSelector
            selectedCustomer={selectedCustomer ?? null}
            onSelect={onCustomerSelect}
            customerType={customerType}
        />
    </div>
)}
```

- [ ] **Step 3: Wire in Create.tsx**

Add state:
```typescript
const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
```

Pass to CheckoutPanel:
```tsx
<CheckoutPanel
    // ... existing props
    selectedCustomer={selectedCustomer}
    onCustomerSelect={setSelectedCustomer}
/>
```

Pass `customer_id` when saving draft and processing payment.

- [ ] **Step 4: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/pos/customer-selector.tsx resources/js/Components/pos/checkout-panel.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(ui): add customer search/selector with inline create"
```

---

### Task 14: Customer Name on Receipt

**Files:**
- Modify: `resources/js/lib/printer.ts`

**Interfaces:**
- Consumes: `ReceiptData.customerName` (optional string)
- Produces: Customer name line on printed receipt

- [ ] **Step 1: Add customer name to receipt**

In `resources/js/lib/printer.ts`, in the `generateEscPos()` function, after the invoice number and date line, add:

```typescript
if (data.customerName) {
    commands.push(...encodeText(`Pelanggan : ${data.customerName}\n`));
}
```

- [ ] **Step 2: Update printReceipt to accept customerName**

In the `ReceiptData` interface (now imported from `@/types/pos`), `customerName` is already an optional field. No change needed if Task 2 was completed.

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/printer.ts
git commit -m "feat(receipt): add customer name to printed receipt"
```

---

## Phase E: Refund System

### Task 15: Refund Database Migration & Models

**Files:**
- Create: `database/migrations/2026_07_02_400000_create_refunds_table.php`
- Create: `database/migrations/2026_07_02_400001_create_refund_items_table.php`
- Create: `database/migrations/2026_07_02_400002_add_returned_qty_to_transaction_items.php`
- Create: `app/Models/Refund.php`
- Create: `app/Models/RefundItem.php`
- Modify: `app/Models/Transaction.php`
- Modify: `app/Models/TransactionItem.php`

**Interfaces:**
- Produces: `refunds` table, `refund_items` table, `transaction_items.returned_quantity`
- Produces: `Refund::items()`, `Refund::transaction()`, `Transaction::refunds()`

- [ ] **Step 1: Create refunds table migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions');
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('refund_amount', 15, 2);
            $table->string('refund_method', 20)->default('cash');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
```

- [ ] **Step 2: Create refund_items table migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refund_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('refund_id')->constrained('refunds')->cascadeOnDelete();
            $table->foreignId('transaction_item_id')->constrained('transaction_items');
            $table->integer('returned_quantity');
            $table->decimal('refund_subtotal', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refund_items');
    }
};
```

- [ ] **Step 3: Create returned_quantity migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->integer('returned_quantity')->default(0)->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->dropColumn('returned_quantity');
        });
    }
};
```

- [ ] **Step 4: Run all migrations**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate`
Expected: All 3 refund migrations run

- [ ] **Step 5: Create Refund model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Refund extends Model
{
    protected $fillable = [
        'transaction_id',
        'user_id',
        'refund_amount',
        'refund_method',
        'reason',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RefundItem::class);
    }
}
```

- [ ] **Step 6: Create RefundItem model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundItem extends Model
{
    protected $fillable = [
        'refund_id',
        'transaction_item_id',
        'returned_quantity',
        'refund_subtotal',
    ];

    protected $casts = [
        'returned_quantity' => 'integer',
        'refund_subtotal' => 'decimal:2',
    ];

    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    public function transactionItem(): BelongsTo
    {
        return $this->belongsTo(TransactionItem::class);
    }
}
```

- [ ] **Step 7: Update Transaction model**

Add to `$fillable`:
```php
'customer_id',
```

Add relationship:
```php
public function refunds(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(Refund::class);
}

public function getTotalRefundedAttribute(): float
{
    return (float) $this->refunds()->sum('refund_amount');
}

public function getIsPartiallyRefundedAttribute(): bool
{
    return $this->refunds()->exists() && $this->total_refunded < $this->total_amount;
}

public function getIsFullyRefundedAttribute(): bool
{
    return $this->total_refunded >= $this->total_amount;
}
```

Add scope:
```php
public function scopeRefunded($query)
{
    return $query->where('status', 'refunded');
}

public function scopePartiallyRefunded($query)
{
    return $query->where('status', 'partially_refunded');
}
```

- [ ] **Step 8: Update TransactionItem model**

Add to `$fillable`:
```php
'returned_quantity',
```

Add to `casts()`:
```php
'returned_quantity' => 'integer',
```

Add accessor:
```php
public function getReturnableQuantityAttribute(): int
{
    return $this->quantity - $this->returned_quantity;
}
```

- [ ] **Step 9: Commit**

```bash
git add database/migrations/2026_07_02_400000_create_refunds_table.php database/migrations/2026_07_02_400001_create_refund_items_table.php database/migrations/2026_07_02_400002_add_returned_qty_to_transaction_items.php app/Models/Refund.php app/Models/RefundItem.php app/Models/Transaction.php app/Models/TransactionItem.php
git commit -m "feat(db): create refunds and refund_items tables with models"
```

---

### Task 16: RefundService

**Files:**
- Create: `app/Services/RefundService.php`

**Interfaces:**
- Produces: `RefundService::processRefund(Transaction $transaction, array $items, string $method, string $reason, User $admin): Refund`
- Produces: `RefundService::getRefundableItems(Transaction $transaction): Collection`
- Consumes: Transaction, TransactionItem, Refund, RefundItem, Product models

- [ ] **Step 1: Create RefundService.php**

```php
<?php

namespace App\Services;

use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RefundService
{
    /**
     * Process a partial or full refund on a transaction.
     *
     * @param Transaction $transaction The paid transaction to refund
     * @param array $items [{ transaction_item_id, returned_quantity }]
     * @param string $method 'cash' | 'store_credit'
     * @param string $reason Reason for refund
     * @param User $admin Admin who approved the refund
     * @return Refund The created refund record
     */
    public function processRefund(
        Transaction $transaction,
        array $items,
        string $method,
        string $reason,
        User $admin
    ): Refund {
        if (! in_array($transaction->status, ['paid', 'partially_refunded'])) {
            throw ValidationException::withMessages([
                'transaction' => 'Hanya transaksi yang sudah dibayar yang bisa direfund.',
            ]);
        }

        if (empty($items)) {
            throw ValidationException::withMessages([
                'items' => 'Pilih minimal 1 item untuk direfund.',
            ]);
        }

        return DB::transaction(function () use ($transaction, $items, $method, $reason, $admin) {
            $totalRefund = 0;

            $refund = Refund::create([
                'transaction_id' => $transaction->id,
                'user_id' => $admin->id,
                'refund_amount' => 0, // Updated below
                'refund_method' => $method,
                'reason' => $reason,
            ]);

            foreach ($items as $itemData) {
                $transactionItem = $transaction->transactionItems()
                    ->where('id', $itemData['transaction_item_id'])
                    ->firstOrFail();

                $returnableQty = $transactionItem->quantity - $transactionItem->returned_quantity;
                $returnQty = min((int) $itemData['returned_quantity'], $returnableQty);

                if ($returnQty <= 0) {
                    continue;
                }

                // Calculate refund subtotal for this line
                $unitPrice = (float) $transactionItem->price_at_time;
                $lineSubtotal = $unitPrice * $returnQty;

                // Apply line-level discount if any
                if ($transactionItem->discount_type === 'percentage' && $transactionItem->discount_amount > 0) {
                    $lineSubtotal -= $lineSubtotal * $transactionItem->discount_amount / 100;
                } elseif ($transactionItem->discount_type === 'flat' && $transactionItem->discount_amount > 0) {
                    $lineSubtotal = max(0, $lineSubtotal - $transactionItem->discount_amount);
                }

                RefundItem::create([
                    'refund_id' => $refund->id,
                    'transaction_item_id' => $transactionItem->id,
                    'returned_quantity' => $returnQty,
                    'refund_subtotal' => $lineSubtotal,
                ]);

                // Update returned quantity on the transaction item
                $transactionItem->increment('returned_quantity', $returnQty);

                // Restore stock
                $transactionItem->product->increment('stock', $returnQty);

                $totalRefund += $lineSubtotal;
            }

            // Update refund total
            $refund->update(['refund_amount' => $totalRefund]);

            // Update transaction status
            $allItems = $transaction->transactionItems;
            $allReturned = $allItems->every(fn ($item) => $item->returned_quantity >= $item->quantity);
            $anyReturned = $allItems->contains(fn ($item) => $item->returned_quantity > 0);

            $newStatus = $allReturned ? 'refunded' : ($anyReturned ? 'partially_refunded' : $transaction->status);
            $transaction->update(['status' => $newStatus]);

            return $refund->load('items.transactionItem');
        });
    }

    /**
     * Get items that can still be refunded for a transaction.
     */
    public function getRefundableItems(Transaction $transaction): \Illuminate\Support\Collection
    {
        return $transaction->transactionItems()
            ->with('product')
            ->get()
            ->filter(fn ($item) => $item->returnable_quantity > 0)
            ->values();
    }
}
```

- [ ] **Step 2: Verify service loads**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan tinker --execute="new App\Services\RefundService(); echo 'OK';"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add app/Services/RefundService.php
git commit -m "feat(service): add RefundService with partial refund and stock restoration"
```

---

### Task 17: Refund API & Routes

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php`
- Modify: `app/Http/Controllers/Api/TransactionController.php`
- Modify: `routes/web.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces: `POST /pos/transaction/{id}/refund` → web route
- Produces: `POST /api/transactions/{id}/refund` → API route
- Produces: `GET /api/transactions/{id}/refundable-items` → API route
- Consumes: `RefundService::processRefund()`, `RefundService::getRefundableItems()`

- [ ] **Step 1: Add refund method to web TransactionController**

```php
public function refund(Request $request, Transaction $transaction)
{
    $request->validate([
        'pin' => 'required|digits:4',
        'reason' => 'required|string|max:500',
        'refund_method' => 'required|in:cash,store_credit',
        'items' => 'required|array|min:1',
        'items.*.transaction_item_id' => 'required|exists:transaction_items,id',
        'items.*.returned_quantity' => 'required|integer|min:1',
    ]);

    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return back()->withErrors(['pin' => 'PIN admin salah.']);
    }

    app(RefundService::class)->processRefund(
        $transaction,
        $request->items,
        $request->refund_method,
        $request->reason,
        $admin
    );

    return back()->with('success', 'Refund berhasil diproses.');
}
```

Add the import:
```php
use App\Services\RefundService;
```

- [ ] **Step 2: Add refund method to API TransactionController**

```php
public function refund(Request $request, Transaction $transaction): JsonResponse
{
    $request->validate([
        'pin' => 'required|digits:4',
        'reason' => 'required|string|max:500',
        'refund_method' => 'required|in:cash,store_credit',
        'items' => 'required|array|min:1',
        'items.*.transaction_item_id' => 'required|exists:transaction_items,id',
        'items.*.returned_quantity' => 'required|integer|min:1',
    ]);

    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return response()->json(['message' => 'PIN admin salah.'], 422);
    }

    $refund = app(RefundService::class)->processRefund(
        $transaction,
        $request->items,
        $request->refund_method,
        $request->reason,
        $admin
    );

    return response()->json([
        'message' => 'Refund berhasil diproses.',
        'refund' => $refund,
    ]);
}

public function refundableItems(Transaction $transaction): JsonResponse
{
    $items = app(RefundService::class)->getRefundableItems($transaction);

    return response()->json(['items' => $items]);
}
```

- [ ] **Step 3: Add routes**

In `routes/web.php`, inside the `kasir-only` group:
```php
Route::post('/pos/transaction/{transaction}/refund', [TransactionController::class, 'refund'])->name('transactions.refund');
```

In `routes/api.php`, inside the `auth:sanctum` group:
```php
Route::post('/transactions/{transaction}/refund', [TransactionController::class, 'refund']);
Route::get('/transactions/{transaction}/refundable-items', [TransactionController::class, 'refundableItems']);
```

- [ ] **Step 4: Verify routes**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep refund`
Expected: Shows the new routes

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/TransactionController.php routes/web.php routes/api.php
git commit -m "feat(backend): add refund and refundable-items endpoints"
```

---

### Task 18: Refund Frontend — Modal Component

**Files:**
- Create: `resources/js/Components/pos/refund-modal.tsx`
- Modify: `resources/js/Pages/Transactions/History.tsx`

**Interfaces:**
- Consumes: `Transaction` with refundable items from API
- Consumes: `RefundService` via API endpoints
- Produces: Refund modal with item selection, qty picker, PIN, reason

- [ ] **Step 1: Create refund-modal.tsx**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';

interface RefundableItem {
    id: number;
    product_name: string;
    quantity: number;
    returned_quantity: number;
    returnable_quantity: number;
    price_at_time: number;
}

interface RefundModalProps {
    show: boolean;
    transactionId: number;
    invoiceNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function RefundModal({ show, transactionId, invoiceNumber, onClose, onSuccess }: RefundModalProps) {
    const [items, setItems] = useState<RefundableItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('');
    const [refundMethod, setRefundMethod] = useState<'cash' | 'store_credit'>('cash');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!show || !transactionId) return;

        setIsLoading(true);
        setError(null);

        const load = async () => {
            try {
                if (isNative()) {
                    const data = await apiClient.get(`/transactions/${transactionId}/refundable-items`);
                    setItems(data.items || []);
                }
            } catch {
                setError('Gagal memuat item.');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [show, transactionId]);

    const handleClose = () => {
        setSelectedItems({});
        setPin('');
        setReason('');
        setError(null);
        onClose();
    };

    const toggleItem = (itemId: number, maxQty: number) => {
        setSelectedItems((prev) => {
            if (prev[itemId]) {
                const next = { ...prev };
                delete next[itemId];
                return next;
            }
            return { ...prev, [itemId]: 1 };
        });
    };

    const updateQty = (itemId: number, qty: number, maxQty: number) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: Math.max(1, Math.min(qty, maxQty)),
        }));
    };

    const totalRefund = items.reduce((sum, item) => {
        if (!selectedItems[item.id]) return sum;
        return sum + item.price_at_time * selectedItems[item.id];
    }, 0);

    const canSubmit = pin.length === 4 && reason.trim().length > 0 && Object.keys(selectedItems).length > 0 && !isSubmitting;

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const refundItems = Object.entries(selectedItems).map(([itemId, qty]) => ({
                transaction_item_id: Number(itemId),
                returned_quantity: qty,
            }));

            if (isNative()) {
                await apiClient.post(`/transactions/${transactionId}/refund`, {
                    pin,
                    reason: reason.trim(),
                    refund_method: refundMethod,
                    items: refundItems,
                });
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err?.message || 'Gagal memproses refund.');
        } finally {
            setIsSubmitting(false);
        }
    }, [canSubmit, selectedItems, pin, reason, refundMethod, transactionId, onSuccess]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-slate-950">Refund</span>
                        <span className="text-xs text-slate-400">{invoiceNumber}</span>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {isLoading && (
                        <div className="py-8 text-center text-xs text-slate-400">Memuat item...</div>
                    )}

                    {!isLoading && items.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-400">Tidak ada item yang bisa direfund.</div>
                    )}

                    {/* Item list */}
                    <div className="space-y-1">
                        {items.map((item) => {
                            const isSelected = !!selectedItems[item.id];
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border p-2.5 transition-colors',
                                        isSelected ? 'border-amber-300 bg-amber-50' : 'border-slate-100'
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleItem(item.id, item.returnable_quantity)}
                                        className="h-4 w-4 rounded accent-amber-500"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold text-slate-950">{item.product_name}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {item.returnable_quantity} dari {item.quantity} bisa direfund · Rp {formatRupiah(item.price_at_time)}/pcs
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateQty(item.id, selectedItems[item.id] - 1, item.returnable_quantity)}
                                                className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-xs"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold">{selectedItems[item.id]}</span>
                                            <button
                                                onClick={() => updateQty(item.id, selectedItems[item.id] + 1, item.returnable_quantity)}
                                                className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-xs"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Refund method */}
                    {Object.keys(selectedItems).length > 0 && (
                        <div className="mt-3">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Metode Refund</label>
                            <div className="mt-1 flex gap-2">
                                <button
                                    onClick={() => setRefundMethod('cash')}
                                    className={cn(
                                        'flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors',
                                        refundMethod === 'cash' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                                    )}
                                >
                                    Tunai
                                </button>
                                <button
                                    onClick={() => setRefundMethod('store_credit')}
                                    className={cn(
                                        'flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors',
                                        refundMethod === 'store_credit' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                                    )}
                                >
                                    Store Credit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PIN + Reason */}
                    <div className="mt-3 space-y-2">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">PIN Admin</label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="4 digit"
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-bold tracking-[0.3em] focus:border-amber-300 focus:ring-0 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Alasan Refund</label>
                            <textarea
                                rows={2}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Wajib diisi..."
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-amber-300 focus:ring-0 focus:outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[10px] text-slate-400">Total Refund</div>
                            <div className="text-sm font-bold text-slate-950">Rp {formatRupiah(totalRefund)}</div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="rounded-lg bg-amber-500 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSubmitting ? 'Memproses...' : 'Proses Refund'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/refund-modal.tsx
git commit -m "feat(ui): add refund modal with item selection and partial qty"
```

---

### Task 19: Refund in History Page & Receipt

**Files:**
- Modify: `resources/js/Pages/Transactions/History.tsx`
- Modify: `resources/js/Pages/Transactions/Show.tsx` (if exists, otherwise create)
- Modify: `resources/js/lib/printer.ts`

**Interfaces:**
- Consumes: `RefundModal` component
- Consumes: Transaction with `status: 'refunded' | 'partially_refunded'`
- Produces: Refund receipt generator `generateRefundEscPos()`

- [ ] **Step 1: Add refund button and status badges to History.tsx**

In `resources/js/Pages/Transactions/History.tsx`, add import:
```tsx
import { RefundModal } from '@/Components/pos/refund-modal';
import { RotateCcw } from 'lucide-react';
```

Add state:
```tsx
const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
```

Add refund status badges alongside the existing void badge:
```tsx
{(tx.status === 'refunded' || tx.status === 'partially_refunded') && (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
        {tx.status === 'refunded' ? 'Refund' : 'Sebagian'}
    </span>
)}
```

Add refund button (next to void button) for paid/partially_refunded transactions:
```tsx
{(tx.status === 'paid' || tx.status === 'partially_refunded') && (
    <button
        onClick={(e) => { e.preventDefault(); setRefundTarget(tx); }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-500"
        title="Refund transaksi"
    >
        <RotateCcw className="h-3.5 w-3.5" />
    </button>
)}
```

Add the modal at the bottom of the component:
```tsx
{refundTarget && (
    <RefundModal
        show={true}
        transactionId={refundTarget.id}
        invoiceNumber={refundTarget.invoice_number}
        onClose={() => setRefundTarget(null)}
        onSuccess={() => {
            setRefundTarget(null);
            // Reload data
            if (isNative()) {
                apiClient.get('/history').then((data) => setApiData({
                    data: data.transactions,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                })).catch(console.error);
            } else {
                router.reload();
            }
        }}
    />
)}
```

Also update the history query to include refunded statuses:
```php
// In TransactionController::history()
->whereIn('status', ['paid', 'voided', 'refunded', 'partially_refunded'])
```

- [ ] **Step 2: Add refund receipt generator to printer.ts**

```typescript
export function generateRefundEscPos(
    data: { invoice: string; date: string; items: Array<{ name: string; quantity: number; subtotal: number }>; total: number; method: string; reason: string },
    store: StoreInfo
): number[] {
    const commands: number[] = [];

    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText(store.name + '\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(store.address + '\n'));
    commands.push(...leftAlign());
    commands.push(...hr());

    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText('BUKTI REFUND\n'));
    commands.push(...boldOff());
    commands.push(...leftAlign());
    commands.push(...hr());

    commands.push(...encodeText(`No.     : ${data.invoice}\n`));
    commands.push(...encodeText(`Tanggal : ${data.date}\n`));
    commands.push(...encodeText(`Alasan  : ${data.reason}\n`));
    commands.push(...encodeText(`Metode  : ${data.method === 'cash' ? 'Tunai' : 'Store Credit'}\n`));
    commands.push(...hr());

    data.items.forEach((item) => {
        commands.push(...encodeText(`${item.name}\n`));
        commands.push(...encodeText(`  ${item.quantity}x  -Rp ${item.subtotal.toLocaleString('id-ID')}\n`));
    });
    commands.push(...hr());

    commands.push(...boldOn());
    commands.push(...encodeText(`Total Refund : -Rp ${data.total.toLocaleString('id-ID')}\n`));
    commands.push(...boldOff());
    commands.push(...hr());

    commands.push(...feedLines(2));
    commands.push(...encodeText('TTD Kasir: ____________\n'));
    commands.push(...feedLines(3));
    commands.push(...cutPaper());

    return commands;
}
```

- [ ] **Step 3: Update history route to include refunded statuses**

In `app/Http/Controllers/TransactionController.php`, update the `history()` method:
```php
->whereIn('status', ['paid', 'voided', 'refunded', 'partially_refunded'])
```

Same change in `app/Http/Controllers/Api/TransactionController.php`.

- [ ] **Step 4: Update closing report to include refund summary**

In `app/Http/Controllers/TransactionController.php` (`closeSession()` method), add refund data to `$closingData`:

```php
$refundTotal = \App\Models\Refund::whereHas('transaction', fn ($q) => $q->where('cashier_session_id', $session->id))->sum('refund_amount');
$refundCount = \App\Models\Refund::whereHas('transaction', fn ($q) => $q->where('cashier_session_id', $session->id))->count();
```

Add to the `$closingData` array:
```php
'totalRefunded' => (float) $refundTotal,
'refundCount' => (int) $refundCount,
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Transactions/History.tsx resources/js/lib/printer.ts app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/TransactionController.php
git commit -m "feat(pos): add refund button in history, refund receipt, and closing report refund summary"
```

---

## Phase F: Final Verification

### Task 20: Integration Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 2: Verify all migrations ran**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan migrate:status | grep -E "Ran|No"`
Expected: All migrations show `Ran`

- [ ] **Step 3: Verify all routes register**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan route:list | grep -E "refund|customer|stock-alert|discount"`
Expected: All new routes appear

- [ ] **Step 4: Verify model loading**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && php artisan tinker --execute="echo App\Models\Customer::count() . ' customers, ' . App\Models\Product::count() . ' products';"`
Expected: Prints counts without error

- [ ] **Step 5: Capacitor sync**

Run: `cd /Users/aryaajisadda/Documents/KERJA/grahamesran && npx cap sync android`
Expected: Sync completes successfully

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: phase 2 complete - discount, stock alert, customer, refund"
```

---

## Summary

| Task | Feature | Est. Time |
|------|---------|-----------|
| 0 | Fix session counter drift | 10 min |
| 1 | Fix invoice collision | 5 min |
| 2 | Centralize TS types | 15 min |
| 3 | Discount migration | 10 min |
| 4 | TransactionService extraction | 30 min |
| 5 | Wire TransactionService into controllers | 20 min |
| 6 | Discount frontend (cart + product card) | 30 min |
| 7 | Discount receipt & closing report | 15 min |
| 8 | Stock alert migration & model | 10 min |
| 9 | Stock alert API endpoint | 10 min |
| 10 | Stock alert frontend (bell + banner) | 20 min |
| 11 | Customer migration & model | 15 min |
| 12 | Customer API endpoints | 15 min |
| 13 | Customer frontend selector | 25 min |
| 14 | Customer name on receipt | 5 min |
| 15 | Refund migration & models | 20 min |
| 16 | RefundService | 25 min |
| 17 | Refund API & routes | 15 min |
| 18 | Refund frontend modal | 25 min |
| 19 | Refund in history & receipt | 20 min |
| 20 | Integration verification | 15 min |
| **Total** | | **~5-6 jam** |
