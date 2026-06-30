# Graha Mesran POS — Smoothness Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Graha Mesran POS run smoothly for a sparepart shop UMKM by fixing performance bottlenecks, security gaps, data integrity issues, and code quality problems.

**Architecture:** Laravel 12 + Filament v3 admin panel + React/Inertia POS cashier. Changes are backend-only (PHP/Laravel) except Task 15 (TypeScript cleanup). All database changes use new migrations — no edits to existing migration files.

**Tech Stack:** Laravel 12, Filament v3, Eloquent ORM, MySQL, React 19, TypeScript

---

## Priority Order

| Phase | Tasks | Impact |
|-------|-------|--------|
| **Phase 1: Database Performance** | Tasks 1–2 | Immediate query speedup |
| **Phase 2: Query Optimization** | Tasks 3–6 | Reduce DB load on dashboard/widgets |
| **Phase 3: Security Hardening** | Tasks 7–9 | Protect against abuse |
| **Phase 4: Data Integrity** | Tasks 10–12 | Prevent data corruption |
| **Phase 5: Code Quality** | Tasks 13–15 | Maintainability |

---

### Task 1: Add Missing Database Indexes

**Files:**
- Create: `database/migrations/2026_06_16_000000_add_performance_indexes.php`

The following columns are heavily queried but lack indexes:
- `transactions.created_at` — used in WHERE/BETWEEN in virtually every query
- `transactions.user_id` — filtered in recap
- `transactions.cashier_session_id` — filtered in recap
- `transactions.payment_method` — used in filters
- `transaction_items.product_id` — used in joins for top products
- `purchases.date` — sorted/filtered
- `expenses.date_expense` — filtered by date range
- `products.stock` — filtered for low stock alerts

- [ ] **Step 1: Create the migration**

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
            $table->index('created_at');
            $table->index('user_id');
            $table->index('cashier_session_id');
            $table->index('payment_method');
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->index('product_id');
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->index('date');
        });

        Schema::table('expenses', function (Blueprint $table): void {
            $table->index('date_expense');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->index('stock');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['cashier_session_id']);
            $table->dropIndex(['payment_method']);
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->dropIndex(['product_id']);
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->dropIndex(['date']);
        });

        Schema::table('expenses', function (Blueprint $table): void {
            $table->dropIndex(['date_expense']);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex(['stock']);
        });
    }
};
```

- [ ] **Step 2: Run the migration**

Run: `php artisan migrate`
Expected: `Migration ran successfully`

- [ ] **Step 3: Verify indexes exist**

Run: `php artisan db:show --table=transactions` (check indexes section)
Expected: indexes on created_at, user_id, cashier_session_id, payment_method

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_06_16_000000_add_performance_indexes.php
git commit -m "perf: add missing database indexes for frequently queried columns"
```

---

### Task 2: Fix StatsOverview N+1 Query (7-day chart)

**Files:**
- Modify: `app/Filament/Widgets/StatsOverview.php:47-51`

The 7-day chart currently runs 7 separate queries in a loop. Replace with a single grouped query.

- [ ] **Step 1: Read the current file**

Read `app/Filament/Widgets/StatsOverview.php` to understand the exact current code.

- [ ] **Step 2: Replace the 7-day chart query**

Current code (lines 47-51):
```php
$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $date = now()->subDays($i)->toDateString();
    $chartData[] = (float) Transaction::whereDate('created_at', $date)->sum('total_amount');
}
```

Replace with:
```php
$dailyTotals = Transaction::query()
    ->selectRaw('DATE(created_at) as sale_date')
    ->selectRaw('SUM(total_amount) as total')
    ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
    ->groupBy('sale_date')
    ->get()
    ->keyBy('sale_date');

$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $date = now()->subDays($i)->toDateString();
    $chartData[] = (float) ($dailyTotals[$date]->total ?? 0);
}
```

- [ ] **Step 3: Verify the widget still renders**

Run: `php artisan test --filter=StatsOverview` (if tests exist)
Or manually: visit `/admin` dashboard and confirm the 7-day sparkline still shows data.

- [ ] **Step 4: Commit**

```bash
git add app/Filament/Widgets/StatsOverview.php
git commit -m "perf: consolidate 7-day chart from 7 queries to 1 grouped query"
```

---

### Task 3: Consolidate MonthlyAnalyticsStatsOverview Queries

**Files:**
- Modify: `app/Filament/Widgets/MonthlyAnalyticsStatsOverview.php:18-41`

This widget runs 5-6 separate queries. Consolidate into 3 queries.

- [ ] **Step 1: Read the current file**

Read `app/Filament/Widgets/MonthlyAnalyticsStatsOverview.php` lines 18-41.

- [ ] **Step 2: Replace the query block**

Replace the `getStats()` method body with:

```php
protected function getStats(): array
{
    $month = $this->getSelectedAnalyticsMonth($this->filters);
    $monthStart = $month->copy()->startOfMonth();
    $monthEnd = $month->copy()->endOfMonth();
    $previousMonthStart = $month->copy()->subMonth()->startOfMonth();
    $previousMonthEnd = $month->copy()->subMonth()->endOfMonth();

    // Query 1: Current month aggregate
    $monthAgg = Transaction::query()
        ->whereBetween('created_at', [$monthStart, $monthEnd])
        ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue')
        ->selectRaw('COALESCE(SUM(total_profit), 0) as profit')
        ->selectRaw('COUNT(*) as record_count')
        ->selectRaw('COUNT(DISTINCT DATE(created_at)) as active_days')
        ->first();

    // Query 2: Best daily revenue for current month
    $bestDaily = Transaction::query()
        ->selectRaw('COALESCE(MAX(daily_rev), 0) as best')
        ->fromSub(
            Transaction::query()
                ->selectRaw('SUM(total_amount) as daily_rev')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->groupByRaw('DATE(created_at)'),
            'daily'
        )
        ->value('best');

    // Query 3: Previous month revenue for comparison
    $previousRevenue = (float) Transaction::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
        ->sum('total_amount');

    $monthlyRevenue = (float) $monthAgg->revenue;
    $monthlyProfit = (float) $monthAgg->profit;
    $recordCount = (int) $monthAgg->record_count;
    $activeDays = (int) $monthAgg->active_days;
    $averageRevenue = $activeDays > 0 ? $monthlyRevenue / $activeDays : 0;
    $bestDailyRevenue = (float) $bestDaily;

    return [
        Stat::make('Omset '.$month->translatedFormat('F Y'), $this->formatCurrency($monthlyRevenue))
            ->description($this->makeComparisonText($monthlyRevenue, $previousRevenue))
            ->descriptionIcon($monthlyRevenue >= $previousRevenue ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
            ->color($monthlyRevenue >= $previousRevenue ? 'success' : 'danger'),

        Stat::make('Profit Bulanan', $this->formatCurrency($monthlyProfit))
            ->description('Akumulasi margin bulan terpilih')
            ->descriptionIcon('heroicon-m-banknotes')
            ->color('primary'),

        Stat::make('Hari Aktif', number_format($activeDays, 0, ',', '.'))
            ->description('Jumlah hari dengan transaksi')
            ->descriptionIcon('heroicon-m-calendar-days')
            ->color('warning'),

        Stat::make('Rata-rata Omset / Hari', $this->formatCurrency($averageRevenue))
            ->description('Dihitung dari hari yang memiliki penjualan')
            ->descriptionIcon('heroicon-m-chart-bar')
            ->color('gray'),

        Stat::make('Record Transaksi', number_format($recordCount, 0, ',', '.'))
            ->description('Termasuk hasil impor rekap')
            ->descriptionIcon('heroicon-m-receipt-percent')
            ->color('info'),

        Stat::make('Puncak Penjualan Harian', $this->formatCurrency($bestDailyRevenue))
            ->description('Omset harian tertinggi pada bulan ini')
            ->descriptionIcon('heroicon-m-fire')
            ->color('success'),
    ];
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Widgets/MonthlyAnalyticsStatsOverview.php
git commit -m "perf: consolidate MonthlyAnalyticsStatsOverview from 6 queries to 3"
```

---

### Task 4: Fix ResolvesMonthlyAnalyticsFilter Memory Issue

**Files:**
- Modify: `app/Filament/Concerns/ResolvesMonthlyAnalyticsFilter.php:10-33`

Current code plucks ALL `created_at` values into memory. Use a grouped query instead.

- [ ] **Step 1: Read the current file**

Read `app/Filament/Concerns/ResolvesMonthlyAnalyticsFilter.php` lines 10-33.

- [ ] **Step 2: Replace the query**

Current code:
```php
public function getMonthlyAnalyticsMonthOptions(): array
{
    return Transaction::query()
        ->pluck('created_at')
        ->map(fn ($date) => Carbon::parse($date)->startOfMonth())
        ->unique(fn ($date) => $date->format('Y-m'))
        ->sortByDesc(fn ($date) => $date->format('Y-m'))
        ->mapWithKeys(fn ($date) => [
            $date->format('Y-m') => ucfirst($date->locale('id')->translatedFormat('F Y')),
        ])
        ->toArray();
}
```

Replace with:
```php
public function getMonthlyAnalyticsMonthOptions(): array
{
    return Transaction::query()
        ->selectRaw('DISTINCT DATE_FORMAT(created_at, "%Y-%m") as month_key')
        ->orderByDesc('month_key')
        ->pluck('month_key')
        ->mapWithKeys(fn (string $key) => [
            $key => ucfirst(Carbon::createFromFormat('Y-m', $key)->locale('id')->translatedFormat('F Y')),
        ])
        ->toArray();
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Concerns/ResolvesMonthlyAnalyticsFilter.php
git commit -m "perf: use grouped query for month options instead of plucking all timestamps"
```

---

### Task 5: Reduce StatsOverview Polling Frequency

**Files:**
- Modify: `app/Filament/Widgets/StatsOverview.php`

The widget polls every 15 seconds, executing 5+ queries each time. Increase to 60 seconds.

- [ ] **Step 1: Read the current file**

Read `app/Filament/Widgets/StatsOverview.php` to find the polling interval.

- [ ] **Step 2: Change polling interval**

Find:
```php
protected static ?string $pollingInterval = '15s';
```

Replace with:
```php
protected static ?string $pollingInterval = '60s';
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Widgets/StatsOverview.php
git commit -m "perf: reduce StatsOverview polling from 15s to 60s"
```

---

### Task 6: Add Caching to Dashboard Asset Valuation

**Files:**
- Modify: `app/Filament/Widgets/StatsOverview.php:54-57`
- Modify: `app/Models/Purchase.php`
- Modify: `app/Models/StockAdjustment.php`

The asset valuation query `Product::query()->sum(DB::raw('stock * cost_price'))` scans the entire products table on every poll. Cache it for 5 minutes.

- [ ] **Step 1: Add cache import to StatsOverview**

Add at the top of the file:
```php
use Illuminate\Support\Facades\Cache;
```

- [ ] **Step 2: Wrap the query in cache**

Find:
```php
$assetValue = Product::query()->sum(DB::raw('stock * cost_price'));
```

Replace with:
```php
$assetValue = Cache::remember('dashboard_asset_value', 300, fn () => Product::query()->sum(DB::raw('stock * cost_price')));
```

- [ ] **Step 3: Invalidate cache on purchase**

In `app/Models/Purchase.php` booted method, add after the stock/cost_price update:
```php
\Cache::forget('dashboard_asset_value');
```

- [ ] **Step 4: Invalidate cache on stock adjustment**

In `app/Models/StockAdjustment.php` booted method, add after the stock update:
```php
\Cache::forget('dashboard_asset_value');
```

- [ ] **Step 5: Commit**

```bash
git add app/Filament/Widgets/StatsOverview.php app/Models/Purchase.php app/Models/StockAdjustment.php
git commit -m "perf: cache dashboard asset valuation for 5 minutes with invalidation"
```

---

### Task 7: Fix Mass-Assignment Protection ($guarded)

**Files:**
- Modify: All models in `app/Models/`

Replace `$guarded = []` with explicit `$fillable` arrays on all models.

- [ ] **Step 1: For each model, read the file and identify which fields are mass-assigned**

**Product:** `sku`, `name`, `image_path`, `volume_liter`, `stock`, `cost_price`, `sell_price`, `workshop_price`
**Transaction:** `invoice_number`, `user_id`, `cashier_session_id`, `total_amount`, `customer_type`, `total_profit`, `payment_method`, `amount_paid`, `change_amount`
**TransactionItem:** `transaction_id`, `product_id`, `quantity`, `cost_at_time`, `price_at_time`
**Purchase:** `date`, `supplier_name`, `product_id`, `quantity`, `buy_price_per_unit`, `total_spend`, `notes`
**Expense:** `date_expense`, `name`, `category`, `amount`, `notes`, `asset_id`
**StockAdjustment:** `product_id`, `user_id`, `adjustment_date`, `system_stock`, `physical_stock`, `difference`, `type`, `note`
**CashierSession:** `user_id`, `opening_cash`, `opened_at`, `cash_sales_total`, `non_cash_sales_total`, `transactions_count`, `closing_cash_physical`, `expected_cash`, `cash_difference`, `closed_at`, `opening_notes`, `closing_notes`
**MonthlyReport:** `month_date`, `notes`, `finalized_at`, `finalized_by`, `transaction_count`, `total_amount`, `total_profit`
**ImportHistory:** `monthly_report_id`, `user_id`, `import_month`, `original_file_name`, `stored_file_path`, `status`, `imported_days`, `skipped_days`, `created_transactions`, `updated_transactions`, `created_products`, `imported_items`, `matched_days`, `out_of_month_days`, `first_transaction_date`, `last_transaction_date`, `detected_months`, `validation_status`, `validation_notes`, `error_message`
**Vehicle:** `brand`, `model`, `year_generation`
**Asset:** `name`, `purchase_date`, `price`, `condition`, `location`, `note`

- [ ] **Step 2: Edit each model**

For each model, replace `protected $guarded = [];` with the appropriate `protected $fillable = [...]` array.

- [ ] **Step 3: Run tests to verify nothing breaks**

Run: `php artisan test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/Models/
git commit -m "security: replace \$guarded=[] with explicit \$fillable on all models"
```

---

### Task 8: Add Rate Limiting to Transaction Store Endpoint

**Files:**
- Modify: `routes/web.php:47`

The `POST /pos` transaction creation route has no throttle middleware.

- [ ] **Step 1: Add throttle middleware to the route**

Find:
```php
Route::post('/pos', [TransactionController::class, 'store'])->name('transactions.store');
```

Replace with:
```php
Route::post('/pos', [TransactionController::class, 'store'])->name('transactions.store')->middleware('throttle:30,1');
```

This allows 30 transactions per minute per user — more than enough for a real cashier, but prevents rapid-fire abuse.

- [ ] **Step 2: Commit**

```bash
git add routes/web.php
git commit -m "security: add rate limiting to transaction creation endpoint (30/min)"
```

---

### Task 9: Add Role Enum Constraint to Database

**Files:**
- Create: `database/migrations/2026_06_16_000001_add_role_enum_constraint_to_users.php`

The `role` column is a plain string with no constraint.

- [ ] **Step 1: Create the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNotIn('role', ['admin', 'staff'])
            ->update(['role' => 'staff']);

        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff'");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users MODIFY role VARCHAR(255) NOT NULL DEFAULT "staff"');
    }
};
```

- [ ] **Step 2: Run the migration**

Run: `php artisan migrate`

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_06_16_000001_add_role_enum_constraint_to_users.php
git commit -m "security: add enum constraint to users.role column"
```

---

### Task 10: Fix Asset-Expense Relationship (Fragile LIKE → FK)

**Files:**
- Create: `database/migrations/2026_06_16_000002_add_asset_id_to_expenses_table.php`
- Modify: `app/Models/Asset.php`
- Modify: `app/Models/Expense.php`

The Asset model uses fragile `LIKE` pattern matching to find linked expenses. Add a proper `asset_id` foreign key.

- [ ] **Step 1: Create the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table): void {
            $table->foreignId('asset_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('asset_id');
        });
    }
};
```

- [ ] **Step 2: Update Asset model — add relationship and fix booted()**

Add to Asset model:
```php
public function expense(): \Illuminate\Database\Eloquent\Relations\HasOne
{
    return $this->hasOne(Expense::class);
}
```

Update the `booted()` method:

Created handler — use relationship:
```php
static::created(function (Asset $asset): void {
    $asset->expense()->create([
        'date_expense' => $asset->purchase_date,
        'name' => 'Pembelian Aset: ' . $asset->name,
        'category' => 'asset',
        'amount' => $asset->price,
        'notes' => 'Otomatis dari aset (ID: ' . $asset->id . ')',
    ]);
});
```

Updated handler — use relationship:
```php
static::updated(function (Asset $asset): void {
    if ($asset->expense) {
        $asset->expense->update([
            'date_expense' => $asset->purchase_date,
            'name' => 'Pembelian Aset: ' . $asset->name,
            'amount' => $asset->price,
        ]);
    }
});
```

Deleted handler — use relationship:
```php
static::deleted(function (Asset $asset): void {
    $asset->expense?->delete();
});
```

- [ ] **Step 3: Update Expense model**

Add the inverse relationship to `app/Models/Expense.php`:
```php
public function asset(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(Asset::class);
}
```

- [ ] **Step 4: Run migration**

Run: `php artisan migrate`

- [ ] **Step 5: Commit**

```bash
git add app/Models/Asset.php app/Models/Expense.php database/migrations/2026_06_16_000002_add_asset_id_to_expenses_table.php
git commit -m "fix: replace fragile LIKE-based Asset-Expense linking with proper FK"
```

---

### Task 11: Fix PurchaseResource Decimal Price Truncation

**Files:**
- Modify: `app/Filament/Resources/PurchaseResource.php:23-74`

The `afterStateUpdated` callbacks cast `buy_price_per_unit` to `int`, truncating decimal prices.

- [ ] **Step 1: Read the current file**

Read `app/Filament/Resources/PurchaseResource.php` lines 23-74.

- [ ] **Step 2: Fix the casts**

For `buy_price_per_unit`, ensure the cast is `(float)` not `(int)`:
```php
->afterStateUpdated(function (Get $get, Set $set): void {
    $quantity = (int) ($get('quantity') ?? 0);
    $buyPrice = (float) ($get('buy_price_per_unit') ?? 0);
    $set('total_spend', $quantity * $buyPrice);
})
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Resources/PurchaseResource.php
git commit -m "fix: use float cast for buy_price_per_unit to prevent decimal truncation"
```

---

### Task 12: Fix Empty Migration Down Methods

**Files:**
- Modify: `database/migrations/2025_12_07_133410_transactions.php`
- Modify: `database/migrations/2025_12_07_134012_transaction_items.php`
- Modify: `database/migrations/2025_12_07_151543_purchases.php`
- Modify: `database/migrations/2025_12_07_152218_expenses.php`
- Modify: `database/migrations/2025_12_07_133350_vehicles.php`

Several migration `down()` methods are empty, meaning `php artisan migrate:rollback` will silently fail.

- [ ] **Step 1: For each migration, fix the down() method**

**transactions.php:**
```php
public function down(): void
{
    Schema::dropIfExists('transactions');
}
```

**transaction_items.php:**
```php
public function down(): void
{
    Schema::dropIfExists('transaction_items');
}
```

**purchases.php:**
```php
public function down(): void
{
    Schema::dropIfExists('purchases');
}
```

**expenses.php:**
```php
public function down(): void
{
    Schema::dropIfExists('expenses');
}
```

**vehicles.php:**
```php
public function down(): void
{
    Schema::dropIfExists('product_vehicle');
    Schema::dropIfExists('vehicles');
}
```

- [ ] **Step 2: Commit**

```bash
git add database/migrations/
git commit -m "fix: add proper down() methods to migrations for safe rollback"
```

---

### Task 13: Remove Duplicate Transaction Relationship

**Files:**
- Modify: `app/Models/Transaction.php:53-56`
- Modify: `app/Filament/Resources/TransactionResource/Pages/EditTransaction.php:62-65`

The `items()` method is an alias of `transactionItems()`. Remove `items()` and update all references.

- [ ] **Step 1: Remove the items() method from Transaction model**

Delete lines 53-56:
```php
public function items(): HasMany
{
    return $this->hasMany(TransactionItem::class);
}
```

- [ ] **Step 2: Update EditTransaction to use transactionItems**

Find:
```php
$transaction->load('items');
// ...
$totalAmount = $transaction->items->sum(fn ($item) => $item->quantity * $item->price_at_time);
$totalProfit = $transaction->items->sum(fn ($item) => $item->quantity * ($item->price_at_time - $item->cost_at_time));
```

Replace with:
```php
$transaction->load('transactionItems');
// ...
$totalAmount = $transaction->transactionItems->sum(fn ($item) => $item->quantity * $item->price_at_time);
$totalProfit = $transaction->transactionItems->sum(fn ($item) => $item->quantity * ($item->price_at_time - $item->cost_at_time));
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/Transaction.php app/Filament/Resources/TransactionResource/Pages/EditTransaction.php
git commit -m "refactor: remove duplicate items() relationship, use transactionItems() consistently"
```

---

### Task 14: Remove Orphaned EditStockAdjustment Page

**Files:**
- Delete: `app/Filament/Resources/StockAdjustmentResource/Pages/EditStockAdjustment.php`

The EditStockAdjustment page file exists but is not registered in `getPages()`. Stock adjustments are create-only (audit trail).

- [ ] **Step 1: Verify it's not referenced anywhere**

Search for `EditStockAdjustment` in the codebase.

- [ ] **Step 2: Delete the file**

```bash
rm app/Filament/Resources/StockAdjustmentResource/Pages/EditStockAdjustment.php
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Resources/StockAdjustmentResource/Pages/
git commit -m "cleanup: remove orphaned EditStockAdjustment page (stock adjustments are create-only)"
```

---

### Task 15: Enable TypeScript Checking on POS Files

**Files:**
- Modify: All files in `resources/js/pages/Transactions/` that have `@ts-nocheck`

All React POS files have `@ts-nocheck`, hiding potential runtime errors.

- [ ] **Step 1: Find all files with @ts-nocheck**

```bash
grep -rl "@ts-nocheck" resources/js/
```

- [ ] **Step 2: Remove @ts-nocheck from each file**

- [ ] **Step 3: Run TypeScript check**

Run: `npm run types`
Expected: There will be type errors. Fix them iteratively.

- [ ] **Step 4: Fix type errors until clean**

Run: `npm run types` repeatedly until no errors.

- [ ] **Step 5: Verify build still works**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add resources/js/
git commit -m "fix: enable TypeScript checking on POS files and fix type errors"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] `php artisan migrate` — all new migrations run cleanly
- [ ] `php artisan test` — all existing tests pass
- [ ] `npm run types` — TypeScript compiles without errors
- [ ] `npm run build` — frontend builds successfully
- [ ] Manual test: Admin dashboard loads with correct stats
- [ ] Manual test: POS cashier can process a transaction
- [ ] Manual test: Monthly analytics page loads with month filter
- [ ] Manual test: Stock adjustment create works
- [ ] Manual test: Purchase create with decimal price (e.g., Rp 15,500)
