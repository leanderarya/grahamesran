# Kasir Android — Capacitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing kasir POS web app into a native Android app with Capacitor, adding token auth, Bluetooth printing, and offline queue.

**Architecture:** Laravel Sanctum provides token-based API auth. A new `routes/api.php` serves JSON endpoints. The React frontend detects Capacitor via `@capacitor/core` and switches between Inertia (web) and fetch-based API calls (native). Bluetooth printing uses ESC/POS via `@nicepay/capacitor-bluetooth-printer`. Offline queue persists transactions to IndexedDB and syncs when network returns.

**Tech Stack:** Laravel 12, React 19, Inertia.js, Capacitor 7, Laravel Sanctum, @nicepay/capacitor-bluetooth-printer, @capacitor/network

## Global Constraints

- PHP >= 8.2
- Node >= 18
- Existing web behavior must not change — API layer is additive
- All API responses follow `{ data: {...} }` envelope pattern
- Kasir PIN login returns Sanctum token, not session cookie
- Thermal printer uses ESC/POS protocol, 58mm paper width
- Offline queue uses IndexedDB via a thin wrapper (no heavy library)

---

## File Structure

```
app/Http/Controllers/Api/
├── AuthController.php          — PIN login/logout (token)
├── ProductController.php       — Product list + categories
├── SessionController.php       — Cashier session open/close/status
├── TransactionController.php   — Create, show, recap transactions
└── DraftController.php         — Draft save/auto-save/clear/destroy

routes/api.php                  — All API routes

resources/js/
├── api/
│   └── client.ts               — fetch wrapper with Sanctum token
├── lib/
│   ├── capacitor.ts            — Platform detection helper
│   ├── printer.ts              — ESC/POS Bluetooth printer
│   └── offline-queue.ts        — IndexedDB transaction queue
├── hooks/
│   └── useNetwork.ts           — Online/offline detection hook
└── Pages/Auth/PinLogin.tsx     — Modified: dual-mode login

capacitor.config.ts             — Capacitor configuration
```

---

### Task 1: Install Laravel Sanctum

**Files:**
- Modify: `composer.json`
- Create: `config/sanctum.php`
- Modify: `app/Models/User.php`
- Create: `database/migrations/xxxx_add_api_token_to_users_table.php`

**Interfaces:**
- Produces: `User` model with `HasApiTokens` trait, `personal_access_tokens` table

- [ ] **Step 1: Install Sanctum via Composer**

```bash
cd /Users/aryaajisadda/Documents/KERJA/grahamesran
composer require laravel/sanctum
```

- [ ] **Step 2: Publish Sanctum config**

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Expected: Creates `config/sanctum.php`

- [ ] **Step 3: Add HasApiTokens trait to User model**

In `app/Models/User.php`, add the import and trait:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable, TwoFactorAuthenticatable;
```

- [ ] **Step 4: Ensure personal_access_tokens migration exists**

```bash
php artisan migrate:status | grep personal_access_tokens
```

If not present, run:

```bash
php artisan migrate
```

- [ ] **Step 5: Verify Sanctum is working**

```bash
php artisan tinker --execute="echo class_exists(\Laravel\Sanctum\Sanctum::class) ? 'OK' : 'FAIL';"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add composer.json composer.lock config/sanctum.php app/Models/User.php database/migrations/
git commit -m "feat: install Laravel Sanctum for API token auth"
```

---

### Task 2: Create API Auth Controller (PIN Login)

**Files:**
- Create: `app/Http/Controllers/Api/AuthController.php`
- Create: `routes/api.php`

**Interfaces:**
- Consumes: `User` model with `HasApiTokens` trait (Task 1)
- Produces: `POST /api/login` → `{ token, user }`, `POST /api/logout` → `{ message }`

- [ ] **Step 1: Create the API Auth Controller**

Create `app/Http/Controllers/Api/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'digits:4'],
        ]);

        $user = User::where('pin', $request->pin)
            ->where('role', 'kasir')
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'PIN salah.',
            ], 401);
        }

        // Revoke previous tokens for this user (single device)
        $user->tokens()->delete();

        $token = $user->createToken('kasir-android')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout.',
        ]);
    }
}
```

- [ ] **Step 2: Create API routes**

Create `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

- [ ] **Step 3: Ensure api.php is loaded**

Check `bootstrap/app.php` loads `routes/api.php`. In Laravel 12, it should already be registered. Verify:

```bash
php artisan route:list --path=api
```

Expected: Shows `POST /api/login` and `POST /api/logout`

- [ ] **Step 4: Test login endpoint**

```bash
# First, get a kasir user's PIN
php artisan tinker --execute="echo \App\Models\User::where('role','kasir')->first()?->pin ?? 'no kasir user';"

# Test login (replace 1234 with actual PIN)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"pin":"1234"}'
```

Expected: `{ "token": "...", "user": { "id": ..., "name": "...", "role": "kasir" } }`

- [ ] **Step 5: Test logout endpoint**

```bash
# Use the token from step 4
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

Expected: `{ "message": "Berhasil logout." }`

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/AuthController.php routes/api.php
git commit -m "feat: add API auth controller with PIN login and Sanctum token"
```

---

### Task 3: Create API Product & Session Controllers

**Files:**
- Create: `app/Http/Controllers/Api/ProductController.php`
- Create: `app/Http/Controllers/Api/SessionController.php`
- Modify: `routes/api.php`

**Interfaces:**
- Consumes: Sanctum auth middleware (Task 2)
- Produces: `GET /api/products` → `{ products, categories }`, `GET /api/session` → `{ session }`, `POST /api/session/open`, `POST /api/session/close`

- [ ] **Step 1: Create ProductController**

Create `app/Http/Controllers/Api/ProductController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with('vehicles')
            ->where('stock', '>', 0)
            ->select('id', 'sku', 'name', 'category', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
            ->get();

        $categories = Product::where('stock', '>', 0)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
```

- [ ] **Step 2: Create SessionController**

Create `app/Http/Controllers/Api/SessionController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashierSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function status(): JsonResponse
    {
        $session = $this->getOpenSession();

        return response()->json([
            'session' => $session ? $this->buildSessionPayload($session) : null,
        ]);
    }

    public function open(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'opening_notes' => 'nullable|string|max:1000',
        ]);

        if ($this->getOpenSession() !== null) {
            throw ValidationException::withMessages([
                'opening_cash' => 'Masih ada sesi kasir yang belum ditutup.',
            ]);
        }

        CashierSession::create([
            'user_id' => auth()->id(),
            'opening_cash' => $validated['opening_cash'],
            'opened_at' => now(),
            'opening_notes' => $validated['opening_notes'] ?? null,
        ]);

        return response()->json(['message' => 'Kasir berhasil dibuka.']);
    }

    public function close(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'closing_cash_physical' => 'required|numeric|min:0',
            'closing_notes' => 'nullable|string|max:1000',
        ]);

        $session = $this->getOpenSession();

        if ($session === null) {
            throw ValidationException::withMessages([
                'closing_cash_physical' => 'Tidak ada sesi kasir yang sedang berjalan.',
            ]);
        }

        $expectedCash = (float) $session->opening_cash + (float) $session->cash_sales_total;
        $closingCash = (float) $validated['closing_cash_physical'];

        $session->update([
            'closing_cash_physical' => $closingCash,
            'expected_cash' => $expectedCash,
            'cash_difference' => $closingCash - $expectedCash,
            'closing_notes' => $validated['closing_notes'] ?? null,
            'closed_at' => now(),
        ]);

        return response()->json(['message' => 'Sesi kasir berhasil ditutup.']);
    }

    private function getOpenSession(): ?CashierSession
    {
        return CashierSession::query()
            ->where('user_id', auth()->id())
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();
    }

    private function buildSessionPayload(CashierSession $session): array
    {
        $expectedCash = (float) $session->opening_cash + (float) $session->cash_sales_total;
        $difference = $session->cash_difference;
        $status = 'open';

        if ($session->closed_at !== null) {
            $status = $difference == 0.0 ? 'balance' : ($difference < 0 ? 'minus' : 'over');
        }

        return [
            'id' => $session->id,
            'opening_cash' => (float) $session->opening_cash,
            'cash_sales_total' => (float) $session->cash_sales_total,
            'non_cash_sales_total' => (float) $session->non_cash_sales_total,
            'transactions_count' => $session->transactions_count,
            'expected_cash' => $session->closed_at ? (float) $session->expected_cash : $expectedCash,
            'closing_cash_physical' => $session->closing_cash_physical !== null ? (float) $session->closing_cash_physical : null,
            'cash_difference' => $difference !== null ? (float) $difference : null,
            'status' => $status,
            'opened_at' => Carbon::parse($session->opened_at)->toIso8601String(),
            'closed_at' => $session->closed_at ? Carbon::parse($session->closed_at)->toIso8601String() : null,
            'opening_notes' => $session->opening_notes,
            'closing_notes' => $session->closing_notes,
        ];
    }
}
```

- [ ] **Step 3: Add routes to api.php**

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SessionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);

    // Cashier session
    Route::get('/session', [SessionController::class, 'status']);
    Route::post('/session/open', [SessionController::class, 'open']);
    Route::post('/session/close', [SessionController::class, 'close']);
});
```

- [ ] **Step 4: Test product endpoint**

```bash
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected: `{ "products": [...], "categories": [...] }`

- [ ] **Step 5: Test session endpoints**

```bash
# Check session status
curl http://localhost:8000/api/session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Open session
curl -X POST http://localhost:8000/api/session/open \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"opening_cash": 500000}'
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/ProductController.php app/Http/Controllers/Api/SessionController.php routes/api.php
git commit -m "feat: add API product and session controllers"
```

---

### Task 4: Create API Transaction & Draft Controllers

**Files:**
- Create: `app/Http/Controllers/Api/TransactionController.php`
- Create: `app/Http/Controllers/Api/DraftController.php`
- Modify: `routes/api.php`

**Interfaces:**
- Consumes: Sanctum auth, `Product` model, `Transaction` model, `CashierSession` model
- Produces: `POST /api/transactions`, `GET /api/transactions/{id}`, `GET /api/recap`, `POST /api/draft`, `PUT /api/draft/auto-save`, `POST /api/draft/clear`, `DELETE /api/draft/{id}`

- [ ] **Step 1: Create API TransactionController**

Create `app/Http/Controllers/Api/TransactionController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashierSession;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.qty' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'amount_paid' => 'required|numeric',
            'change_amount' => 'required|numeric',
            'customer_type' => 'required|in:general,workshop',
            'draft_id' => 'nullable|exists:transactions,id',
        ]);

        $openSession = $this->getOpenSession();

        if ($openSession === null) {
            throw ValidationException::withMessages([
                'cart' => 'Buka kasir terlebih dahulu sebelum memproses transaksi.',
            ]);
        }

        try {
            $transaction = DB::transaction(function () use ($validated, $openSession) {
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
                    ]);
                } else {
                    $transaction = Transaction::create([
                        'user_id' => auth()->id(),
                        'cashier_session_id' => $openSession->id,
                        'invoice_number' => $this->generateInvoiceNumber(),
                        'payment_method' => $validated['payment_method'],
                        'customer_type' => $validated['customer_type'],
                        'amount_paid' => $validated['amount_paid'],
                        'change_amount' => $validated['change_amount'],
                        'total_amount' => 0,
                        'total_profit' => 0,
                        'status' => 'paid',
                    ]);
                }

                $grandTotal = 0;
                $totalProfit = 0;

                foreach ($validated['cart'] as $item) {
                    $product = Product::lockForUpdate()->find($item['id']);

                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'cart' => "Stok barang '{$product->name}' tidak mencukupi. Sisa: {$product->stock}",
                        ]);
                    }

                    $finalPrice = $this->determinePrice($product, $validated['customer_type']);
                    $subtotal = $finalPrice * $item['qty'];
                    $profit = ($finalPrice - $product->cost_price) * $item['qty'];

                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $item['qty'],
                        'price_at_time' => $finalPrice,
                        'cost_at_time' => $product->cost_price,
                    ]);

                    $product->decrement('stock', $item['qty']);

                    $grandTotal += $subtotal;
                    $totalProfit += $profit;
                }

                $transaction->update([
                    'total_amount' => $grandTotal,
                    'total_profit' => $totalProfit,
                ]);

                $cashSales = $validated['payment_method'] === 'cash' ? $grandTotal : 0;
                $nonCashSales = $validated['payment_method'] === 'cash' ? 0 : $grandTotal;

                $openSession->increment('transactions_count');
                $openSession->increment('cash_sales_total', $cashSales);
                $openSession->increment('non_cash_sales_total', $nonCashSales);

                return $transaction;
            });

            return response()->json([
                'message' => 'Transaksi berhasil.',
                'transaction' => [
                    'id' => $transaction->id,
                    'invoice_number' => $transaction->invoice_number,
                    'total_amount' => (float) $transaction->total_amount,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                ],
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan sistem: '.$e->getMessage(),
            ], 500);
        }
    }

    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load('transactionItems.product');

        return response()->json([
            'transaction' => [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'created_at' => $transaction->created_at?->toIso8601String(),
                'payment_method' => $transaction->payment_method,
                'customer_type' => $transaction->customer_type,
                'total_amount' => (float) $transaction->total_amount,
                'amount_paid' => (float) $transaction->amount_paid,
                'change_amount' => (float) $transaction->change_amount,
                'items' => $transaction->transactionItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product?->display_name ?? 'Produk terhapus',
                        'quantity' => $item->quantity,
                        'price_at_time' => (float) $item->price_at_time,
                        'subtotal' => (float) ($item->quantity * $item->price_at_time),
                    ];
                }),
            ],
        ]);
    }

    public function recap(): JsonResponse
    {
        $openSession = $this->getOpenSession();
        $today = now()->startOfDay();

        $baseQuery = Transaction::query()
            ->with(['transactionItems.product'])
            ->where('user_id', auth()->id());

        if ($openSession !== null) {
            $baseQuery->where('cashier_session_id', $openSession->id);
        } else {
            $baseQuery->where('created_at', '>=', $today);
        }

        $transactions = $baseQuery->latest()->limit(20)->get();

        $summary = [
            'total_transactions' => $transactions->count(),
            'cash_total' => (float) $transactions->where('payment_method', 'cash')->sum('total_amount'),
            'non_cash_total' => (float) $transactions->where('payment_method', '!=', 'cash')->sum('total_amount'),
            'revenue_total' => (float) $transactions->sum('total_amount'),
            'profit_total' => (float) $transactions->sum('total_profit'),
        ];

        return response()->json([
            'session' => $openSession ? $this->buildSessionPayload($openSession) : null,
            'summary' => $summary,
            'transactions' => $transactions->map(fn (Transaction $t) => [
                'id' => $t->id,
                'invoice_number' => $t->invoice_number,
                'created_at' => $t->created_at?->toIso8601String(),
                'payment_method' => $t->payment_method,
                'customer_type' => $t->customer_type,
                'total_amount' => (float) $t->total_amount,
                'items_count' => $t->transactionItems->sum('quantity'),
            ]),
        ]);
    }

    private function determinePrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return $product->workshop_price;
        }
        return $product->sell_price;
    }

    private function generateInvoiceNumber(): string
    {
        return 'INV-'.date('Ymd').'-'.time();
    }

    private function getOpenSession(): ?CashierSession
    {
        return CashierSession::query()
            ->where('user_id', auth()->id())
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();
    }

    private function buildSessionPayload(CashierSession $session): array
    {
        $expectedCash = (float) $session->opening_cash + (float) $session->cash_sales_total;
        $difference = $session->cash_difference;
        $status = 'open';

        if ($session->closed_at !== null) {
            $status = $difference == 0.0 ? 'balance' : ($difference < 0 ? 'minus' : 'over');
        }

        return [
            'id' => $session->id,
            'opening_cash' => (float) $session->opening_cash,
            'cash_sales_total' => (float) $session->cash_sales_total,
            'non_cash_sales_total' => (float) $session->non_cash_sales_total,
            'transactions_count' => $session->transactions_count,
            'expected_cash' => $session->closed_at ? (float) $session->expected_cash : $expectedCash,
            'closing_cash_physical' => $session->closing_cash_physical !== null ? (float) $session->closing_cash_physical : null,
            'cash_difference' => $difference !== null ? (float) $difference : null,
            'status' => $status,
            'opened_at' => $session->opened_at,
            'closed_at' => $session->closed_at,
            'opening_notes' => $session->opening_notes,
            'closing_notes' => $session->closing_notes,
        ];
    }
}
```

- [ ] **Step 2: Create API DraftController**

Create `app/Http/Controllers/Api/DraftController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashierSession;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DraftController extends Controller
{
    public function save(Request $request): JsonResponse
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

        $draft = DB::transaction(function () use ($validated, $openSession) {
            if (! empty($validated['draft_id'])) {
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
                    'payment_method' => 'cash',
                    'status' => 'draft',
                ]);
            }

            $grandTotal = 0;
            $totalProfit = 0;

            foreach ($validated['cart'] as $item) {
                $product = Product::find($item['id']);
                if (! $product) continue;

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

            return $draft;
        });

        return response()->json([
            'draft_id' => $draft->id,
            'invoice_number' => $draft->invoice_number,
            'total_amount' => (float) $draft->total_amount,
            'message' => 'Draft tersimpan.',
        ]);
    }

    public function autoSave(Request $request): JsonResponse
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
            return response()->json(['message' => 'Buka kasir terlebih dahulu.'], 422);
        }

        $draft = DB::transaction(function () use ($validated, $openSession) {
            if (! empty($validated['draft_id'])) {
                $draft = Transaction::where('id', $validated['draft_id'])
                    ->where('status', 'draft')
                    ->where('user_id', auth()->id())
                    ->first();

                if (! $draft) {
                    $draft = Transaction::create([
                        'user_id' => auth()->id(),
                        'cashier_session_id' => $openSession->id,
                        'invoice_number' => $this->generateInvoiceNumber(),
                        'customer_type' => $validated['customer_type'],
                        'total_amount' => 0,
                        'total_profit' => 0,
                        'payment_method' => 'cash',
                        'status' => 'draft',
                    ]);
                } else {
                    $draft->transactionItems()->delete();
                }
            } else {
                $draft = Transaction::create([
                    'user_id' => auth()->id(),
                    'cashier_session_id' => $openSession->id,
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'customer_type' => $validated['customer_type'],
                    'total_amount' => 0,
                    'total_profit' => 0,
                    'payment_method' => 'cash',
                    'status' => 'draft',
                ]);
            }

            $grandTotal = 0;
            $totalProfit = 0;

            foreach ($validated['cart'] as $item) {
                $product = Product::find($item['id']);
                if (! $product) continue;

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

            return $draft;
        });

        return response()->json([
            'draft_id' => $draft->id,
            'message' => 'Draft tersimpan.',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $query = Transaction::where('status', 'draft')
            ->where('user_id', auth()->id());

        if ($request->filled('draft_id')) {
            $query->where('id', $request->draft_id);
        }

        $drafts = $query->get();

        foreach ($drafts as $draft) {
            $draft->transactionItems()->delete();
            $draft->delete();
        }

        return response()->json(['message' => 'Draft dihapus.']);
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        if ($transaction->status !== 'draft' || $transaction->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $transaction->transactionItems()->delete();
        $transaction->delete();

        return response()->json(['message' => 'Draft dibatalkan.']);
    }

    private function determinePrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return $product->workshop_price;
        }
        return $product->sell_price;
    }

    private function generateInvoiceNumber(): string
    {
        return 'INV-'.date('Ymd').'-'.time();
    }

    private function getOpenSession(): ?CashierSession
    {
        return CashierSession::query()
            ->where('user_id', auth()->id())
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();
    }
}
```

- [ ] **Step 3: Add transaction and draft routes**

Update `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DraftController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);

    // Cashier session
    Route::get('/session', [SessionController::class, 'status']);
    Route::post('/session/open', [SessionController::class, 'open']);
    Route::post('/session/close', [SessionController::class, 'close']);

    // Transactions
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/recap', [TransactionController::class, 'recap']);

    // Drafts
    Route::post('/draft', [DraftController::class, 'save']);
    Route::put('/draft/auto-save', [DraftController::class, 'autoSave']);
    Route::post('/draft/clear', [DraftController::class, 'clear']);
    Route::delete('/draft/{transaction}', [DraftController::class, 'destroy']);
});
```

- [ ] **Step 4: Test transaction and draft endpoints**

```bash
# Save draft
curl -X POST http://localhost:8000/api/draft \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"cart":[{"id":1,"qty":2}],"customer_type":"general"}'

# Recap
curl http://localhost:8000/api/recap \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/TransactionController.php app/Http/Controllers/Api/DraftController.php routes/api.php
git commit -m "feat: add API transaction and draft controllers"
```

---

### Task 5: Create Frontend API Client & Platform Detection

**Files:**
- Create: `resources/js/lib/capacitor.ts`
- Create: `resources/js/api/client.ts`

**Interfaces:**
- Produces: `isNative()` → boolean, `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.delete()` with auto token injection

- [ ] **Step 1: Create platform detection helper**

Create `resources/js/lib/capacitor.ts`:

```typescript
/**
 * Detect if running inside Capacitor native shell.
 * Returns false on web — no Capacitor dependency loaded.
 */
export function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Capacitor' in window &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}
```

- [ ] **Step 2: Create API client with Sanctum token**

Create `resources/js/api/client.ts`:

```typescript
import { isNative } from '@/lib/capacitor';

const API_BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('kasir_token');
}

export function setToken(token: string): void {
    localStorage.setItem('kasir_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('kasir_token');
}

export function hasToken(): boolean {
    return getToken() !== null;
}

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T = any>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const token = getToken();

    const fetchHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
    };

    if (token) {
        fetchHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: fetchHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearToken();
            window.location.href = '/pin-login';
            throw new Error('Unauthorized');
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
            status: response.status,
            message: errorData.message || 'Terjadi kesalahan.',
            errors: errorData.errors || {},
        };
    }

    return response.json();
}

export const apiClient = {
    get: <T = any>(endpoint: string) => request<T>(endpoint),

    post: <T = any>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'POST', body }),

    put: <T = any>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: 'PUT', body }),

    delete: <T = any>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/capacitor.ts resources/js/api/client.ts
git commit -m "feat: add frontend API client with Sanctum token and platform detection"
```

---

### Task 6: Modify PinLogin for Dual-Mode (Web + Capacitor)

**Files:**
- Modify: `resources/js/Pages/Auth/PinLogin.tsx`

**Interfaces:**
- Consumes: `isNative()` (Task 5), `apiClient`, `setToken` (Task 5)
- Produces: Web mode uses Inertia `router.post()` (unchanged), Capacitor mode uses `apiClient.post()` + stores token

- [ ] **Step 1: Modify PinLogin.tsx**

Replace the `submit` function in `resources/js/Pages/Auth/PinLogin.tsx` to support dual-mode:

```typescript
import InputError from '@/Components/input-error';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { route } from 'ziggy-js';
import { isNative } from '@/lib/capacitor';
import { apiClient, setToken } from '@/api/client';

export default function PinLogin() {
    const [pin, setPin] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [shake, setShake] = useState(false);
    const submitting = useRef(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

    const submit = (value: string) => {
        if (submitting.current) return;
        submitting.current = true;
        setProcessing(true);
        setErrors({});

        if (isNative()) {
            // Capacitor: use API with token auth
            apiClient
                .post('/login', { pin: value })
                .then((data) => {
                    setToken(data.token);
                    window.location.href = '/pos';
                })
                .catch((err) => {
                    setErrors({ pin: err.message || 'PIN salah.' });
                    setShake(true);
                    setTimeout(() => {
                        setShake(false);
                        setPin('');
                        submitting.current = false;
                        setProcessing(false);
                    }, 500);
                });
        } else {
            // Web: use Inertia (existing behavior)
            router.post(
                route('pin.login.store'),
                { pin: value },
                {
                    onError: (errs) => {
                        setErrors(errs);
                        setShake(true);
                        setTimeout(() => {
                            setShake(false);
                            setPin('');
                            submitting.current = false;
                            setProcessing(false);
                        }, 500);
                    },
                    onFinish: () => {
                        if (!submitting.current) setProcessing(false);
                    },
                },
            );
        }
    };

    const handleKey = (digit: string) => {
        if (processing) return;
        setErrors({});
        if (pin.length < 4) {
            const next = pin + digit;
            setPin(next);
            if (next.length === 4) {
                submit(next);
            }
        }
    };

    const handleDelete = () => {
        if (processing) return;
        setErrors({});
        setPin(pin.slice(0, -1));
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-950">
            <Head title="Masuk Kasir - Graha Motor" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10rem] left-[-6rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute right-[-7rem] bottom-[-8rem] h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
            </div>

            <main className="relative mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-8 sm:px-6">
                <section className="mx-auto w-full max-w-sm">
                    <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
                        <div className="mt-4 text-center">
                            <div className="font-sans text-3xl font-extrabold tracking-tight text-slate-950">
                                {greeting}
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Masukkan PIN kasir untuk melanjutkan.
                            </p>
                        </div>

                        {/* PIN Dots */}
                        <div
                            className={cn(
                                'mt-8 flex items-center justify-center gap-4',
                                shake && 'animate-[shake_0.5s_ease-in-out]',
                            )}
                        >
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all duration-200',
                                        pin.length > i
                                            ? 'border-slate-950 bg-slate-950 text-white scale-105'
                                            : 'border-slate-200 bg-slate-50 text-slate-300',
                                        errors.pin &&
                                            'border-red-400 bg-red-50',
                                    )}
                                >
                                    {pin.length > i ? '•' : ''}
                                </div>
                            ))}
                        </div>

                        {errors.pin && (
                            <InputError
                                message={errors.pin}
                                className="mt-3 text-center"
                            />
                        )}

                        {/* Numpad */}
                        <div className="mt-8 grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                                <button
                                    key={digit}
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleKey(String(digit))}
                                    className="flex h-16 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-900 transition-all duration-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50"
                                >
                                    {digit}
                                </button>
                            ))}
                            <div /> {/* empty space */}
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => handleKey('0')}
                                className="flex h-16 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-900 transition-all duration-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleDelete}
                                className="flex h-16 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-500 transition-all duration-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50"
                            >
                                ←
                            </button>
                        </div>

                        {processing && (
                            <div className="mt-4 text-center text-sm font-semibold text-slate-500">
                                Memproses...
                            </div>
                        )}

                        <div className="mt-8 border-t border-slate-200 pt-5 text-center">
                            <a
                                href="/login"
                                className="text-xs font-bold text-slate-400 transition hover:text-slate-600"
                            >
                                Login Admin →
                            </a>
                        </div>
                    </div>

                    <footer className="mt-8 text-center">
                        <p className="text-xs font-medium text-slate-400">
                            © 2026 Graha Motor
                        </p>
                    </footer>
                </section>
            </main>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
}
```

- [ ] **Step 2: Test web mode still works**

```bash
npm run build
# Visit /pin-login in browser, enter PIN, should work as before
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Auth/PinLogin.tsx
git commit -m "feat: add dual-mode PIN login (Inertia web + API Capacitor)"
```

---

### Task 7: Install & Configure Capacitor

**Files:**
- Modify: `package.json`
- Create: `capacitor.config.ts`

**Interfaces:**
- Produces: Capacitor project initialized, `capacitor.config.ts` created, Android platform added

- [ ] **Step 1: Install Capacitor packages**

```bash
cd /Users/aryaajisadda/Documents/KERJA/grahamesran
npm install @capacitor/core @capacitor/cli
```

- [ ] **Step 2: Initialize Capacitor**

```bash
npx cap init "Graha Motor Kasir" com.grahamotor.kasir --web-dir=public/build
```

Expected: Creates `capacitor.config.ts`

- [ ] **Step 3: Configure Capacitor for development**

Update `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.grahamotor.kasir',
    appName: 'Graha Motor Kasir',
    webDir: 'public/build',
    server: {
        // For development: point to local Laravel server
        // Change to production URL before release
        url: 'http://10.0.2.2:8000', // Android emulator localhost
        cleartext: true,
    },
    android: {
        allowMixedContent: true,
    },
};

export default config;
```

- [ ] **Step 4: Add Android platform**

```bash
npm install @capacitor/android
npx cap add android
```

Expected: Creates `android/` directory with Gradle project

- [ ] **Step 5: Build and sync**

```bash
npm run build
npx cap sync android
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json capacitor.config.ts android/
git commit -m "feat: initialize Capacitor with Android platform"
```

---

### Task 8: Add Bluetooth Thermal Printer Support

**Files:**
- Create: `resources/js/lib/printer.ts`
- Modify: `resources/js/Components/pos/print-receipt.tsx`

**Interfaces:**
- Consumes: `isNative()` (Task 5)
- Produces: `printReceipt(data)` — on web uses `window.print()`, on Capacitor uses Bluetooth ESC/POS

- [ ] **Step 1: Install printer plugin**

```bash
npm install @nicepay/capacitor-bluetooth-printer
npx cap sync android
```

- [ ] **Step 2: Create ESC/POS printer helper**

Create `resources/js/lib/printer.ts`:

```typescript
import { isNative } from './capacitor';

interface ReceiptData {
    invoice: string;
    date: string;
    items: Array<{
        name: string;
        volume_liter?: number | string;
        sell_price: number | string;
        qty: number;
    }>;
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
}

interface StoreInfo {
    name: string;
    address: string;
    phone: string;
}

// ESC/POS commands
const ESC = 0x1b;
const LF = 0x0a;
const GS = 0x1d;

function encodeText(text: string): number[] {
    return Array.from(new TextEncoder().encode(text));
}

function centerAlign(): number[] {
    return [ESC, 0x61, 0x01];
}

function leftAlign(): number[] {
    return [ESC, 0x61, 0x00];
}

function boldOn(): number[] {
    return [ESC, 0x45, 0x01];
}

function boldOff(): number[] {
    return [ESC, 0x45, 0x00];
}

function feedLines(n: number): number[] {
    return [ESC, 0x64, n];
}

function cutPaper(): number[] {
    return [GS, 0x56, 0x00];
}

function hr(width: number = 32): number[] {
    return encodeText('-'.repeat(width) + '\n');
}

export function generateEscPos(data: ReceiptData, store: StoreInfo): number[] {
    const commands: number[] = [];

    // Header - centered and bold
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText(store.name + '\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(store.address + '\n'));
    commands.push(...encodeText(store.phone + '\n'));
    commands.push(...leftAlign());
    commands.push(...hr());

    // Transaction info
    commands.push(...encodeText(`No: ${data.invoice}\n`));
    commands.push(...encodeText(`Tgl: ${data.date}\n`));
    commands.push(...encodeText(`Kasir: ${data.cashier || '-'}\n`));
    commands.push(...encodeText(`Plg: ${data.customerType}\n`));
    commands.push(...hr());

    // Items
    for (const item of data.items) {
        const label = item.volume_liter
            ? `${item.name} ${item.volume_liter}L`
            : item.name;
        commands.push(...boldOn());
        commands.push(...encodeText(`${label}\n`));
        commands.push(...boldOff());

        const price = Number(item.sell_price || 0).toLocaleString('id-ID');
        const subtotal = (
            Number(item.qty || 0) * Number(item.sell_price || 0)
        ).toLocaleString('id-ID');
        commands.push(
            ...encodeText(`  ${item.qty} x ${price}    ${subtotal}\n`),
        );
    }

    commands.push(...hr());

    // Total
    commands.push(...boldOn());
    commands.push(
        ...encodeText(
            `TOTAL        Rp ${data.total.toLocaleString('id-ID')}\n`,
        ),
    );
    commands.push(...boldOff());
    commands.push(
        ...encodeText(
            `Bayar (${data.paymentMethod})  Rp ${data.payAmount.toLocaleString('id-ID')}\n`,
        ),
    );
    commands.push(
        ...encodeText(
            `Kembali      Rp ${data.change.toLocaleString('id-ID')}\n`,
        ),
    );

    commands.push(...feedLines(2));
    commands.push(...centerAlign());
    commands.push(...encodeText('*** TERIMA KASIH ***\n'));
    commands.push(
        ...encodeText('Barang yang dibeli tidak dapat ditukar/dikembalikan\n'),
    );
    commands.push(...feedLines(3));
    commands.push(...cutPaper());

    return commands;
}

export async function printReceipt(
    data: ReceiptData,
    store: StoreInfo,
): Promise<void> {
    if (!isNative()) {
        // Web fallback: trigger browser print
        window.print();
        return;
    }

    try {
        // Dynamic import to avoid loading on web
        const { BluetoothPrinter } = await import(
            '@nicepay/capacitor-bluetooth-printer'
        );

        // List paired devices
        const { devices } = await BluetoothPrinter.getPairedDevices();

        if (devices.length === 0) {
            throw new Error(
                'Tidak ada printer Bluetooth yang terpasang. Silakan pasangkan printer terlebih dahulu.',
            );
        }

        // Connect to first available printer
        await BluetoothPrinter.connect({ address: devices[0].address });

        // Generate ESC/POS data
        const escPosData = generateEscPos(data, store);

        // Send to printer
        await BluetoothPrinter.printRawData({ data: escPosData });

        // Disconnect
        await BluetoothPrinter.disconnect();

        return;
    } catch (error: any) {
        throw new Error(error.message || 'Gagal mencetak struk.');
    }
}
```

- [ ] **Step 3: Update PrintReceipt component to use native print**

The `PrintReceipt` component stays as-is for the hidden HTML (used by web print). The actual print trigger will be done by calling `printReceipt()` from the page that has the receipt data.

Add a `usePrintReceipt` hook that pages can call:

Create `resources/js/hooks/usePrintReceipt.ts`:

```typescript
import { useState, useCallback } from 'react';
import { printReceipt } from '@/lib/printer';

interface ReceiptData {
    invoice: string;
    date: string;
    items: Array<{
        name: string;
        volume_liter?: number | string;
        sell_price: number | string;
        qty: number;
    }>;
    total: number;
    payAmount: number;
    change: number;
    paymentMethod: string;
    cashier?: string;
    customerType: string;
}

const STORE_CONFIG = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

export function usePrintReceipt() {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

    const print = useCallback(async (data: ReceiptData) => {
        setIsPrinting(true);
        setPrintError(null);

        try {
            await printReceipt(data, STORE_CONFIG);
        } catch (error: any) {
            setPrintError(error.message || 'Gagal mencetak.');
        } finally {
            setIsPrinting(false);
        }
    }, []);

    return { print, isPrinting, printError };
}
```

- [ ] **Step 4: Sync Capacitor**

```bash
npx cap sync android
```

- [ ] **Step 5: Commit**

```bash
git add resources/js/lib/printer.ts resources/js/hooks/usePrintReceipt.ts package.json package-lock.json
git commit -m "feat: add Bluetooth thermal printer support with ESC/POS"
```

---

### Task 9: Add Offline Queue

**Files:**
- Create: `resources/js/lib/offline-queue.ts`
- Create: `resources/js/hooks/useNetwork.ts`

**Interfaces:**
- Produces: `offlineQueue.add(transaction)`, `offlineQueue.getPending()`, `offlineQueue.markSent(id)`, `offlineQueue.sync(apiClient)`, `useNetwork()` → `{ isOnline }`

- [ ] **Step 1: Create network detection hook**

Create `resources/js/hooks/useNetwork.ts`:

```typescript
import { useState, useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useNetwork() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true,
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // For Capacitor: use @capacitor/network if available
        if (isNative()) {
            import('@capacitor/network').then(({ Network }) => {
                Network.getStatus().then((status) => {
                    setIsOnline(status.connected);
                });

                Network.addListener('networkStatusChange', (status) => {
                    setIsOnline(status.connected);
                });
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline };
}
```

- [ ] **Step 2: Create offline queue using IndexedDB**

Create `resources/js/lib/offline-queue.ts`:

```typescript
const DB_NAME = 'kasir_offline';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

interface QueuedTransaction {
    id: string; // UUID
    cart: Array<{ id: number; qty: number }>;
    payment_method: string;
    amount_paid: number;
    change_amount: number;
    customer_type: string;
    draft_id: number | null;
    timestamp: number;
    status: 'pending' | 'sent' | 'failed';
    error?: string;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const offlineQueue = {
    async add(transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'status'>): Promise<string> {
        const db = await openDB();
        const id = generateId();

        const item: QueuedTransaction = {
            ...transaction,
            id,
            timestamp: Date.now(),
            status: 'pending',
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).add(item);
            tx.oncomplete = () => resolve(id);
            tx.onerror = () => reject(tx.error);
        });
    },

    async getPending(): Promise<QueuedTransaction[]> {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const all = request.result as QueuedTransaction[];
                resolve(all.filter((item) => item.status === 'pending'));
            };
            request.onerror = () => reject(request.error);
        });
    },

    async markSent(id: string): Promise<void> {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const item = request.result as QueuedTransaction;
                if (item) {
                    item.status = 'sent';
                    store.put(item);
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async markFailed(id: string, error: string): Promise<void> {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const item = request.result as QueuedTransaction;
                if (item) {
                    item.status = 'failed';
                    item.error = error;
                    store.put(item);
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async clearSent(): Promise<void> {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const all = request.result as QueuedTransaction[];
                for (const item of all) {
                    if (item.status === 'sent') {
                        store.delete(item.id);
                    }
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async sync(
        postFn: (data: any) => Promise<any>,
    ): Promise<{ sent: number; failed: number }> {
        const pending = await this.getPending();
        let sent = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                await postFn({
                    cart: item.cart,
                    payment_method: item.payment_method,
                    amount_paid: item.amount_paid,
                    change_amount: item.change_amount,
                    customer_type: item.customer_type,
                    draft_id: item.draft_id,
                });
                await this.markSent(item.id);
                sent++;
            } catch (error: any) {
                await this.markFailed(item.id, error.message || 'Sync failed');
                failed++;
            }
        }

        if (sent > 0) {
            await this.clearSent();
        }

        return { sent, failed };
    },
};
```

- [ ] **Step 3: Install @capacitor/network**

```bash
npm install @capacitor/network
npx cap sync android
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/lib/offline-queue.ts resources/js/hooks/useNetwork.ts package.json package-lock.json
git commit -m "feat: add offline transaction queue with IndexedDB and network detection"
```

---

### Task 10: Modify Checkout to Use API + Offline Queue

**Files:**
- Modify: `resources/js/Pages/Transactions/Checkout.tsx`

**Interfaces:**
- Consumes: `isNative()` (Task 5), `apiClient` (Task 5), `offlineQueue` (Task 9), `useNetwork` (Task 9), `usePrintReceipt` (Task 8)
- Produces: Checkout page works in both web (Inertia) and Capacitor (API) modes, with offline queue fallback

- [ ] **Step 1: Modify Checkout.tsx**

Replace the `processPayment` callback in `resources/js/Pages/Transactions/Checkout.tsx`:

```typescript
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/format';
import { ArrowLeft, Banknote, QrCode, Building2 } from 'lucide-react';
import type { SharedData } from '@/types';
import {
    AppNotifications,
    notifyError,
    notifyWarning,
} from '@/Components/app-notifications';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { useNetwork } from '@/hooks/useNetwork';
import { offlineQueue } from '@/lib/offline-queue';
import { usePrintReceipt } from '@/hooks/usePrintReceipt';

// ... keep all existing interfaces and constants ...

export default function Checkout({ draft, cashierSession }: CheckoutProps) {
    const { flash } = usePage<SharedData>().props;
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { isOnline } = useNetwork();
    const { print: printReceipt } = usePrintReceipt();

    // ... keep existing computed values (hasOpenSession, totalAmount, change, cashShortcutAmounts) ...

    const processPayment = useCallback(async () => {
        if (!hasOpenSession) {
            notifyWarning('Buka kasir terlebih dahulu.', 'Sesi kasir tidak aktif');
            return;
        }

        const finalPaid =
            paymentMethod === 'cash' ? Number(cashReceived || 0) : totalAmount;

        if (paymentMethod === 'cash' && finalPaid < totalAmount) {
            notifyWarning('Uang pembayaran kurang.', 'Pembayaran belum cukup');
            return;
        }

        setIsProcessing(true);

        const finalChange =
            paymentMethod === 'cash' ? finalPaid - totalAmount : 0;

        const transactionData = {
            draft_id: draft.id,
            cart: draft.items.map((item) => ({
                id: item.product_id,
                qty: item.quantity,
            })),
            payment_method: paymentMethod,
            amount_paid: finalPaid,
            change_amount: finalChange,
            customer_type: draft.customer_type,
        };

        if (isNative()) {
            // Capacitor mode
            if (!isOnline) {
                // Offline: queue transaction
                await offlineQueue.add(transactionData);
                notifyWarning(
                    'Transaksi disimpan offline.',
                    'Akan dikirim saat online.',
                );
                router.visit(route('transactions.create'));
                return;
            }

            // Online: submit via API
            try {
                const data = await apiClient.post('/transactions', transactionData);

                // Print receipt
                await printReceipt({
                    invoice: data.transaction.invoice_number,
                    date: new Date().toLocaleDateString('id-ID'),
                    items: draft.items.map((item) => ({
                        name: item.product_name,
                        sell_price: item.price_at_time,
                        qty: item.quantity,
                    })),
                    total: totalAmount,
                    payAmount: finalPaid,
                    change: finalChange,
                    paymentMethod,
                    customerType: draft.customer_type,
                });

                router.visit(route('transactions.create'));
            } catch (error: any) {
                notifyError(error.message || 'Gagal memproses transaksi.');
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Web mode: existing Inertia behavior
            router.post(
                route('transactions.store'),
                transactionData,
                {
                    onSuccess: () => {
                        router.visit(route('transactions.create'));
                    },
                    onError: (errors: Record<string, string>) => {
                        const message =
                            errors?.cart ||
                            errors?.payment_method ||
                            errors?.amount_paid ||
                            'Gagal memproses transaksi.';
                        notifyError(message);
                    },
                    onFinish: () => setIsProcessing(false),
                },
            );
        }
    }, [
        cashReceived,
        draft,
        hasOpenSession,
        isOnline,
        paymentMethod,
        printReceipt,
        totalAmount,
    ]);

    // ... keep existing JSX ...
}
```

- [ ] **Step 2: Test web mode still works**

```bash
npm run build
# Test checkout flow in browser
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Checkout.tsx
git commit -m "feat: add dual-mode checkout with offline queue and native print"
```

---

### Task 11: Modify Create.tsx (POS Page) for API Mode

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

**Interfaces:**
- Consumes: `isNative()` (Task 5), `apiClient` (Task 5), `useNetwork` (Task 9), `offlineQueue` (Task 9)
- Produces: POS page loads products via API in Capacitor mode, auto-saves via API

- [ ] **Step 1: Add API data fetching to Create.tsx**

The Create.tsx page is large. The key changes are:

1. Add an `useEffect` that fetches products via API when in Capacitor mode
2. Replace `router.put()` for auto-save with `apiClient.put()` when in Capacitor mode
3. Replace `router.post()` for save-draft with `apiClient.post()` when in Capacitor mode

Add these imports at the top:

```typescript
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { useNetwork } from '@/hooks/useNetwork';
```

Add state for API-loaded data (when in Capacitor mode, products come from API, not Inertia props):

```typescript
const [apiProducts, setApiProducts] = useState<Product[]>([]);
const [apiCategories, setApiCategories] = useState<string[]>([]);
const [apiSession, setApiSession] = useState<CashierSession | null>(null);
const [apiDraft, setApiDraft] = useState<ActiveDraft | null>(null);
```

Add useEffect to load data via API:

```typescript
useEffect(() => {
    if (!isNative()) return;

    const loadData = async () => {
        try {
            const [productData, sessionData] = await Promise.all([
                apiClient.get('/products'),
                apiClient.get('/session'),
            ]);
            setApiProducts(productData.products);
            setApiCategories(productData.categories);
            setApiSession(sessionData.session);
        } catch (error) {
            console.error('Failed to load POS data:', error);
        }
    };

    loadData();
}, []);
```

Use the appropriate data source:

```typescript
const activeProducts = isNative() ? apiProducts : products;
const activeCategories = isNative() ? apiCategories : categories;
const activeSession = isNative() ? apiSession : sessionState;
```

For auto-save, wrap the existing auto-save logic:

```typescript
const autoSaveDraft = async (cart: CartItem[], customerType: string) => {
    if (isNative()) {
        try {
            const data = await apiClient.put('/draft/auto-save', {
                cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
                customer_type: customerType,
                draft_id: draftId,
            });
            if (data.draft_id) setDraftId(data.draft_id);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    } else {
        // Existing Inertia auto-save
        router.put(
            route('transactions.draft.autoSave'),
            {
                cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
                customer_type: customerType,
                draft_id: draftId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page: any) => {
                    const newDraftId = page.props?.activeDraft?.id;
                    if (newDraftId) setDraftId(newDraftId);
                },
            },
        );
    }
};
```

For save-draft (checkout navigation):

```typescript
const saveDraftAndCheckout = async () => {
    if (isNative()) {
        try {
            const data = await apiClient.post('/draft', {
                cart: data.cart.map((item) => ({ id: item.id, qty: item.qty })),
                customer_type: customerType,
                draft_id: draftId,
            });
            window.location.href = `/pos/checkout/${data.draft_id}`;
        } catch (error: any) {
            notifyError(error.message || 'Gagal menyimpan draft.');
        }
    } else {
        router.post(route('transactions.draft.save'), {
            cart: data.cart.map((item) => ({ id: item.id, qty: item.qty })),
            customer_type: customerType,
            draft_id: draftId,
        });
    }
};
```

- [ ] **Step 2: Test web mode**

```bash
npm run build
# Test POS flow in browser — should work unchanged
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "feat: add dual-mode POS page with API data fetching"
```

---

### Task 12: Modify Recap.tsx and Show.tsx for API Mode

**Files:**
- Modify: `resources/js/Pages/Transactions/Recap.tsx`
- Modify: `resources/js/Pages/Transactions/Show.tsx`

**Interfaces:**
- Consumes: `isNative()` (Task 5), `apiClient` (Task 5)
- Produces: Recap and Show pages load data via API in Capacitor mode

- [ ] **Step 1: Modify Recap.tsx for dual-mode**

Add imports and API data fetching:

```typescript
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
```

Add state and useEffect for API mode:

```typescript
const [apiData, setApiData] = useState<any>(null);

useEffect(() => {
    if (!isNative()) return;

    apiClient.get('/recap').then((data) => {
        setApiData(data);
    }).catch((err) => {
        console.error('Failed to load recap:', err);
    });
}, []);
```

Use `apiData` when in Capacitor mode, Inertia props when on web:

```typescript
const activeSession = isNative() ? apiData?.session : cashierSession;
const activeSummary = isNative() ? apiData?.summary : summary;
const activeTransactions = isNative() ? apiData?.transactions : transactions;
const activeTopProducts = isNative() ? apiData?.topProducts : topProducts;
```

- [ ] **Step 2: Modify Show.tsx for dual-mode**

Add imports:

```typescript
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
```

The Show page receives transaction ID from URL. In Capacitor mode, fetch via API:

```typescript
const [apiTransaction, setApiTransaction] = useState<any>(null);

useEffect(() => {
    if (!isNative()) return;

    // Extract transaction ID from current URL
    const pathParts = window.location.pathname.split('/');
    const transactionId = pathParts[pathParts.length - 1];

    apiClient.get(`/transactions/${transactionId}`).then((data) => {
        setApiTransaction(data.transaction);
    }).catch((err) => {
        console.error('Failed to load transaction:', err);
    });
}, []);

const activeTransaction = isNative() ? apiTransaction : transaction;
```

- [ ] **Step 3: Test web mode**

```bash
npm run build
# Verify Recap and Show pages work in browser
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Transactions/Recap.tsx resources/js/Pages/Transactions/Show.tsx
git commit -m "feat: add dual-mode Recap and Show pages with API fetching"
```

---

### Task 13: Android Optimization (Back Button, Status Bar, Lifecycle)

**Files:**
- Create: `resources/js/hooks/useAndroidBackButton.ts`
- Modify: `resources/js/app.tsx`

**Interfaces:**
- Produces: Android back button navigates within app, status bar color set, app pause/resume handled

- [ ] **Step 1: Install Capacitor App plugin**

```bash
npm install @capacitor/app @capacitor/status-bar
npx cap sync android
```

- [ ] **Step 2: Create back button handler**

Create `resources/js/hooks/useAndroidBackButton.ts`:

```typescript
import { useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useAndroidBackButton() {
    useEffect(() => {
        if (!isNative()) return;

        import('@capacitor/app').then(({ App }) => {
            App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    // Exit confirmation
                    App.exitApp();
                }
            });
        });
    }, []);
}
```

- [ ] **Step 3: Configure status bar**

Create `resources/js/hooks/useStatusBar.ts`:

```typescript
import { useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useStatusBar() {
    useEffect(() => {
        if (!isNative()) return;

        import('@capacitor/status-bar').then(({ StatusBar }) => {
            StatusBar.setBackgroundColor({ color: '#f1f5f9' }); // slate-100
            StatusBar.setStyle({ style: 'DARK' });
        });
    }, []);
}
```

- [ ] **Step 4: Add hooks to app entry point**

In `resources/js/app.tsx`, add the hooks inside the root component:

```typescript
import { useAndroidBackButton } from '@/hooks/useAndroidBackButton';
import { useStatusBar } from '@/hooks/useStatusBar';

function App() {
    useAndroidBackButton();
    useStatusBar();
    // ... rest of app
}
```

- [ ] **Step 5: Add app lifecycle handler**

Create `resources/js/hooks/useAppLifecycle.ts`:

```typescript
import { useEffect } from 'react';
import { isNative } from '@/lib/capacitor';

export function useAppLifecycle(onResume?: () => void, onPause?: () => void) {
    useEffect(() => {
        if (!isNative()) return;

        import('@capacitor/app').then(({ App }) => {
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    onResume?.();
                } else {
                    onPause?.();
                }
            });

            App.addListener('resume', () => {
                onResume?.();
            });
        });
    }, [onResume, onPause]);
}
```

- [ ] **Step 6: Sync and commit**

```bash
npx cap sync android
git add resources/js/hooks/useAndroidBackButton.ts resources/js/hooks/useStatusBar.ts resources/js/hooks/useAppLifecycle.ts resources/js/app.tsx package.json package-lock.json
git commit -m "feat: add Android back button, status bar, and app lifecycle handling"
```

---

### Task 14: Configure Android Splash Screen

**Files:**
- Modify: `capacitor.config.ts`
- Create: `android/app/src/main/res/drawable/splash.png` (placeholder)

**Interfaces:**
- Produces: Splash screen shows Graha Motor branding on app launch

- [ ] **Step 1: Update capacitor.config.ts with splash config**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.grahamotor.kasir',
    appName: 'Graha Motor Kasir',
    webDir: 'public/build',
    server: {
        url: 'http://10.0.2.2:8000',
        cleartext: true,
    },
    android: {
        allowMixedContent: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#1e293b', // slate-800
            showSpinner: false,
            androidSplashResourceName: 'splash',
        },
    },
};

export default config;
```

- [ ] **Step 2: Install SplashScreen plugin**

```bash
npm install @capacitor/splash-screen
npx cap sync android
```

- [ ] **Step 3: Commit**

```bash
git add capacitor.config.ts package.json package-lock.json
git commit -m "feat: configure Android splash screen with Graha Motor branding"
```

---

### Task 15: Final Build & Test

**Files:**
- None (verification only)

- [ ] **Step 1: Build frontend**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Sync to Android**

```bash
npx cap sync android
```

Expected: Sync succeeds, Android project updated

- [ ] **Step 3: Open in Android Studio**

```bash
npx cap open android
```

- [ ] **Step 4: Test in emulator**

1. Run app in Android emulator
2. PIN login → should get token and navigate to POS
3. Products should load
4. Add items to cart
5. Save draft → navigate to checkout
6. Process payment
7. Test offline: disable network → add transaction → re-enable → verify sync

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: kasir Android Capacitor build complete"
```
