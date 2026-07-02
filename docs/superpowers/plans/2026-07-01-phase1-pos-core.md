# Phase 1 POS Core Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three core POS features: Dokumen Closing (printable closing report), Setting Printer (Bluetooth configuration), and Riwayat Penjualan + Void (sales history with void capability).

**Architecture:** Extend existing dual-mode pattern (Inertia web + Capacitor API). All features follow the `isNative()` branch pattern. New routes under `kasir-only` middleware group. Database changes via additive migrations only.

**Tech Stack:** Laravel 12, React 19, Inertia.js, Capacitor 8, Tailwind CSS 4, ESC/POS thermal printing

## Global Constraints

- All UI follows compact tablet design (padding `p-2.5` to `p-3`, font `text-xs` to `text-sm`)
- Every feature must implement both web (Inertia) and Capacitor (API) modes
- No breaking changes to existing functionality
- Commits after each task completion
- All new routes inside `kasir-only` middleware group

---

## File Structure

### New Files
| File | Responsibility |
|------|----------------|
| `database/migrations/xxxx_add_void_fields_to_transactions_table.php` | Add void columns to transactions |
| `resources/js/Pages/Transactions/History.tsx` | Sales history page with filters |
| `resources/js/Components/pos/void-modal.tsx` | Void confirmation modal with PIN |
| `resources/js/Pages/Settings/Printer.tsx` | Printer configuration page |
| `resources/js/hooks/usePrinter.ts` | Bluetooth printer scan/connect/status |
| `resources/js/Components/pos/closing-report.tsx` | Closing report display component |
| `resources/js/hooks/usePrintClosing.ts` | ESC/POS closing report generator |

### Modified Files
| File | Changes |
|------|---------|
| `app/Models/Transaction.php` | Add void fields to `$fillable`, `$casts`, void scopes |
| `app/Http/Controllers/TransactionController.php` | Add `history()`, `void()` methods; enhance `closeSession()` with closing data |
| `app/Http/Controllers/Api/TransactionController.php` | Add `history()`, `void()` API endpoints |
| `app/Http/Controllers/Api/SessionController.php` | Return closing data in `close()` response |
| `routes/web.php` | Add history, void, settings routes |
| `routes/api.php` | Add history, void API routes |
| `resources/js/Components/pos/top-bar.tsx` | Add Riwayat link + printer status icon |
| `resources/js/Components/pos/settlement-modal.tsx` | Trigger closing report after settlement |
| `resources/js/lib/printer.ts` | Add `generateClosingEscPos()` function |

---

## Task 1: Database Migration — Void Fields

**Files:**
- Create: `database/migrations/2026_07_02_000001_add_void_fields_to_transactions_table.php`
- Modify: `app/Models/Transaction.php`

**Interfaces:**
- Produces: `transactions.void_reason`, `transactions.voided_by`, `transactions.voided_at`, `transactions.status` (extended values: 'paid', 'draft', 'voided')

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
            $table->text('void_reason')->nullable()->after('status');
            $table->foreignId('voided_by')->nullable()->after('void_reason')->constrained('users');
            $table->timestamp('voided_at')->nullable()->after('voided_by');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropForeign(['voided_by']);
            $table->dropColumn(['void_reason', 'voided_by', 'voided_at']);
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate`
Expected: `Migration table created successfully.` + `Migrated: 2026_07_02_000001_add_void_fields_to_transactions_table`

- [ ] **Step 3: Update Transaction model**

Add to `$fillable`:
```php
'void_reason',
'voided_by',
'voided_at',
```

Add to `$casts`:
```php
'voided_at' => 'datetime',
```

Add scopes and methods:
```php
public function scopeVoided($query)
{
    return $query->where('status', 'voided');
}

public function isVoided(): bool
{
    return $this->status === 'voided';
}
```

- [ ] **Step 4: Verify model loads**

Run: `php artisan tinker --execute="echo App\Models\Transaction::count();"`
Expected: Prints count (e.g., `5`)

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_07_02_000001_add_void_fields_to_transactions_table.php app/Models/Transaction.php
git commit -m "feat(db): add void fields to transactions table"
```

---

## Task 2: Backend — Transaction History & Void API

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php`
- Modify: `app/Http/Controllers/Api/TransactionController.php`
- Modify: `routes/web.php`
- Modify: `routes/api.php`

**Interfaces:**
- Produces: `GET /pos/history` → web route (Inertia)
- Produces: `GET /api/history` → API route (JSON)
- Produces: `POST /pos/transaction/{id}/void` → web route
- Produces: `POST /api/transactions/{id}/void` → API route
- Void params: `{ pin: string, reason: string }`
- Void returns: `{ message: string, transaction: object }`

- [ ] **Step 1: Add history method to web TransactionController**

Add after `recap()` method in `app/Http/Controllers/TransactionController.php`:

```php
public function history()
{
    $transactions = Transaction::with('user')
        ->where('user_id', auth()->id())
        ->whereIn('status', ['paid', 'voided'])
        ->orderByDesc('created_at')
        ->paginate(20);

    return Inertia::render('Transactions/History', [
        'transactions' => $transactions,
    ]);
}
```

- [ ] **Step 2: Add void method to web TransactionController**

Add after `history()` method:

```php
public function void(Request $request, Transaction $transaction)
{
    $request->validate([
        'pin' => ['required', 'digits:4'],
        'reason' => ['required', 'string', 'max:500'],
    ]);

    // Verify admin PIN
    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return back()->withErrors(['pin' => 'PIN admin salah.']);
    }

    if ($transaction->status === 'voided') {
        return back()->withErrors(['transaction' => 'Transaksi sudah dibatalkan.']);
    }

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

    return back()->with('success', 'Transaksi berhasil dibatalkan.');
}
```

- [ ] **Step 3: Add history method to API TransactionController**

Add after `recap()` method in `app/Http/Controllers/Api/TransactionController.php`:

```php
public function history(): JsonResponse
{
    $transactions = Transaction::with('user')
        ->where('user_id', auth()->id())
        ->whereIn('status', ['paid', 'voided'])
        ->orderByDesc('created_at')
        ->paginate(20);

    return response()->json([
        'transactions' => $transactions->items(),
        'current_page' => $transactions->currentPage(),
        'last_page' => $transactions->lastPage(),
        'total' => $transactions->total(),
    ]);
}
```

- [ ] **Step 4: Add void method to API TransactionController**

Add after `history()` method:

```php
public function void(Request $request, Transaction $transaction): JsonResponse
{
    $request->validate([
        'pin' => ['required', 'digits:4'],
        'reason' => ['required', 'string', 'max:500'],
    ]);

    // Verify admin PIN
    $admin = User::where('pin', $request->pin)
        ->where('role', 'admin')
        ->first();

    if (! $admin) {
        return response()->json(['message' => 'PIN admin salah.'], 422);
    }

    if ($transaction->status === 'voided') {
        return response()->json(['message' => 'Transaksi sudah dibatalkan.'], 422);
    }

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

    return response()->json([
        'message' => 'Transaksi berhasil dibatalkan.',
        'transaction' => $transaction->fresh(),
    ]);
}
```

- [ ] **Step 5: Add routes to web.php**

Inside the `kasir-only` group in `routes/web.php`, add before the closing `});`:

```php
Route::get('/pos/history', [TransactionController::class, 'history'])->name('transactions.history');
Route::post('/pos/transaction/{transaction}/void', [TransactionController::class, 'void'])->name('transactions.void');
```

- [ ] **Step 6: Add routes to api.php**

Inside the `auth:sanctum` group in `routes/api.php`, add:

```php
Route::get('/history', [TransactionController::class, 'history']);
Route::post('/transactions/{transaction}/void', [TransactionController::class, 'void']);
```

- [ ] **Step 7: Verify routes register**

Run: `php artisan route:list | grep -E "history|void"`
Expected: Shows both new routes

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/TransactionController.php routes/web.php routes/api.php
git commit -m "feat(backend): add transaction history and void endpoints"
```

---

## Task 3: Frontend — Void Modal Component

**Files:**
- Create: `resources/js/Components/pos/void-modal.tsx`

**Interfaces:**
- Consumes: `show: boolean`, `onClose()`, `onConfirm(pin: string, reason: string)`, `isProcessing: boolean`
- Produces: Calls `onConfirm(pin, reason)` when user submits

- [ ] **Step 1: Create void-modal.tsx**

```tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, AlertTriangle } from 'lucide-react';

interface VoidModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: (pin: string, reason: string) => void;
    isProcessing: boolean;
    invoiceNumber: string;
}

export function VoidModal({
    show,
    onClose,
    onConfirm,
    isProcessing,
    invoiceNumber,
}: VoidModalProps) {
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('');

    if (!show) return null;

    const handleSubmit = () => {
        if (pin.length !== 4 || !reason.trim()) return;
        onConfirm(pin, reason.trim());
    };

    const handleClose = () => {
        setPin('');
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-bold text-slate-950">Batalkan Transaksi</span>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    Transaksi <span className="font-bold text-slate-700">{invoiceNumber}</span> akan dibatalkan. Stok produk akan dikembalikan.
                </p>

                {/* PIN Input */}
                <div className="mt-3">
                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PIN Admin</label>
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 digit"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg font-bold tracking-[0.5em] text-slate-950 focus:border-red-300 focus:ring-0 focus:outline-none"
                    />
                </div>

                {/* Reason Input */}
                <div className="mt-2">
                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Alasan Pembatalan</label>
                    <textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Wajib diisi..."
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-red-300 focus:ring-0 focus:outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={pin.length !== 4 || !reason.trim() || isProcessing}
                        className="flex-1 rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isProcessing ? 'Membatalkan...' : 'Batalkan Transaksi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/void-modal.tsx
git commit -m "feat(ui): add void modal component"
```

---

## Task 4: Frontend — Sales History Page

**Files:**
- Create: `resources/js/Pages/Transactions/History.tsx`

**Interfaces:**
- Consumes: `transactions` (paginated list from Inertia props)
- Consumes: `apiClient.get('/history')` for Capacitor mode
- Produces: Links to `/pos/transaction/{id}` for detail
- Produces: Void button triggering `VoidModal`

- [ ] **Step 1: Create History.tsx**

```tsx
import { AppNotifications, notifyError, notifySuccess } from '@/Components/app-notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Ban } from 'lucide-react';
import type { SharedData } from '@/types';
import { formatRupiah, formatTime } from '@/lib/format';
import { TopBar } from '@/Components/pos/top-bar';
import { isNative } from '@/lib/capacitor';
import { apiClient } from '@/api/client';
import { VoidModal } from '@/Components/pos/void-modal';

interface Transaction {
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
    user?: { name: string };
}

interface PaginatedData {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function SalesHistory({ transactions }: { transactions: PaginatedData }) {
    const { auth, flash } = usePage<SharedData>().props;
    const [apiData, setApiData] = useState<PaginatedData | null>(null);
    const [search, setSearch] = useState('');
    const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
    const [isVoiding, setIsVoiding] = useState(false);

    useEffect(() => {
        if (!isNative()) return;
        apiClient.get('/history').then((data) => {
            setApiData({
                data: data.transactions,
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
            });
        }).catch(console.error);
    }, []);

    const activeTransactions = isNative() ? apiData : transactions;
    const hasOpenSession = true; // History accessible anytime

    const filtered = useMemo(() => {
        const items = activeTransactions?.data ?? [];
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((t) =>
            t.invoice_number.toLowerCase().includes(q) ||
            (t.user?.name ?? '').toLowerCase().includes(q)
        );
    }, [activeTransactions, search]);

    const handleVoid = async (pin: string, reason: string) => {
        if (!voidTarget) return;
        setIsVoiding(true);

        if (isNative()) {
            try {
                await apiClient.post(`/transactions/${voidTarget.id}/void`, { pin, reason });
                setApiData((prev) => prev ? {
                    ...prev,
                    data: prev.data.map((t) => t.id === voidTarget.id ? { ...t, status: 'voided', void_reason: reason, voided_at: new Date().toISOString() } : t),
                } : prev);
                setVoidTarget(null);
            } catch (error: any) {
                notifyError(error?.message || 'Gagal membatalkan transaksi.');
            } finally {
                setIsVoiding(false);
            }
        } else {
            router.post(route('transactions.void', voidTarget.id), { pin, reason }, {
                onSuccess: () => setVoidTarget(null),
                onError: (errors) => notifyError(errors?.pin || errors?.transaction || 'Gagal membatalkan.'),
                onFinish: () => setIsVoiding(false),
            });
        }
    };

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Riwayat Penjualan - Graha Motor" />
            <AppNotifications flash={flash} />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={hasOpenSession}
                userName={auth?.user?.name || ''}
                onSettlementClick={() => router.visit(route('transactions.create'))}
            />

            <main className="flex-1 overflow-y-auto p-3 lg:p-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('transactions.create')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span className="text-base font-bold text-slate-950">Riwayat</span>
                        <span className="text-xs text-slate-400">{activeTransactions?.total ?? 0} transaksi</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari invoice..."
                            className="w-32 border-0 bg-transparent p-0 text-xs text-slate-950 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Transaction List */}
                <div className="mt-3 space-y-1">
                    {filtered.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs font-semibold text-slate-400">
                            Tidak ada transaksi ditemukan.
                        </div>
                    )}

                    {filtered.map((tx) => (
                        <div
                            key={tx.id}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                                tx.status === 'voided'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            <Link href={route('transactions.show', tx.id)} className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-950">{tx.invoice_number}</span>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                        {tx.payment_method}
                                    </span>
                                    {tx.status === 'voided' && (
                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                                            Void
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                    {formatTime(tx.created_at)} · {tx.items_count} item
                                    {tx.status === 'voided' && tx.void_reason && (
                                        <span className="text-red-400"> · {tx.void_reason}</span>
                                    )}
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${tx.status === 'voided' ? 'text-red-400 line-through' : 'text-slate-950'}`}>
                                    Rp {formatRupiah(tx.total_amount)}
                                </span>
                                {tx.status === 'paid' && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setVoidTarget(tx); }}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        title="Batalkan transaksi"
                                    >
                                        <Ban className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <VoidModal
                show={!!voidTarget}
                onClose={() => setVoidTarget(null)}
                onConfirm={handleVoid}
                isProcessing={isVoiding}
                invoiceNumber={voidTarget?.invoice_number ?? ''}
            />
        </div>
    );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Transactions/History.tsx
git commit -m "feat(ui): add sales history page with void capability"
```

---

## Task 5: Frontend — Add History Link to TopBar

**Files:**
- Modify: `resources/js/Components/pos/top-bar.tsx`

**Interfaces:**
- Consumes: Existing TopBar props (no new props needed)
- Produces: Navigation to `/pos/history`

- [ ] **Step 1: Add History button to TopBar dropdown**

In `resources/js/Components/pos/top-bar.tsx`, add import:
```tsx
import { BarChart3, Calculator, LogOut, History } from 'lucide-react';
```

Add after the "Rekap Penjualan" button (before the "Settlement" button):

```tsx
<button
    onClick={() => {
        setDropdownOpen(false);
        router.visit(route('transactions.history'));
    }}
    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-950 hover:bg-slate-50"
>
    <History className="h-4 w-4 text-slate-400" />
    Riwayat Penjualan
</button>
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/top-bar.tsx
git commit -m "feat(ui): add history link to topbar dropdown"
```

---

## Task 6: Closing Report — ESC/POS Generator

**Files:**
- Modify: `resources/js/lib/printer.ts`

**Interfaces:**
- Consumes: `ClosingReportData` interface
- Produces: `generateClosingEscPos(data, store): number[]`

- [ ] **Step 1: Add ClosingReportData interface and generator**

Add at the end of `resources/js/lib/printer.ts`:

```typescript
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
}

export function generateClosingEscPos(data: ClosingReportData, store: StoreInfo): number[] {
    const commands: number[] = [];

    // Header
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText(store.name + '\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(store.address + '\n'));
    commands.push(...encodeText(store.phone + '\n'));
    commands.push(...leftAlign());
    commands.push(...hr());

    // Title
    commands.push(...centerAlign(), ...boldOn());
    commands.push(...encodeText('LAPORAN CLOSING KASIR\n'));
    commands.push(...boldOff());
    commands.push(...leftAlign());
    commands.push(...hr());

    // Session info
    commands.push(...encodeText(`Tanggal : ${data.date}\n`));
    commands.push(...encodeText(`Kasir   : ${data.cashierName}\n`));
    commands.push(...encodeText(`Buka    : ${data.openedAt}\n`));
    commands.push(...encodeText(`Tutup   : ${data.closedAt}\n`));
    commands.push(...encodeText(`Durasi  : ${data.duration}\n`));
    commands.push(...hr());

    // Summary
    commands.push(...boldOn());
    commands.push(...encodeText('RINGKASAN TRANSAKSI\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Total Transaksi : ${data.totalTransactions}\n`));
    commands.push(...encodeText(`Total Penjualan : Rp ${data.totalRevenue.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Total Profit    : Rp ${data.totalProfit.toLocaleString('id-ID')}\n`));
    commands.push(...hr());

    // Payment breakdown
    commands.push(...boldOn());
    commands.push(...encodeText('BREAKDOWN PEMBAYARAN\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Tunai    : Rp ${data.cashTotal.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Non Tunai: Rp ${data.nonCashTotal.toLocaleString('id-ID')}\n`));
    commands.push(...hr());

    // Settlement
    commands.push(...boldOn());
    commands.push(...encodeText('SETTLEMENT\n'));
    commands.push(...boldOff());
    commands.push(...encodeText(`Saldo Awal    : Rp ${data.openingCash.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Cash Sales    : Rp ${data.cashSales.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Expected Cash : Rp ${data.expectedCash.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Uang Fisik    : Rp ${data.physicalCash.toLocaleString('id-ID')}\n`));
    commands.push(...boldOn());
    commands.push(...encodeText(`Selisih       : Rp ${data.difference.toLocaleString('id-ID')}\n`));
    commands.push(...encodeText(`Status        : ${data.settlementStatus.toUpperCase()}\n`));
    commands.push(...boldOff());
    commands.push(...hr());

    // Top products
    if (data.topProducts.length > 0) {
        commands.push(...boldOn());
        commands.push(...encodeText('PRODUK TERLARIS\n'));
        commands.push(...boldOff());
        data.topProducts.slice(0, 5).forEach((p, i) => {
            commands.push(...encodeText(`${i + 1}. ${p.name}\n`));
            commands.push(...encodeText(`   ${p.quantity}x Rp ${p.revenue.toLocaleString('id-ID')}\n`));
        });
        commands.push(...hr());
    }

    // Signature
    commands.push(...feedLines(2));
    commands.push(...encodeText('TTD Kasir: ____________\n'));
    commands.push(...encodeText('TTD Supervisor: ________\n'));
    commands.push(...feedLines(3));
    commands.push(...cutPaper());

    return commands;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/printer.ts
git commit -m "feat(printer): add closing report ESC/POS generator"
```

---

## Task 7: Closing Report — Print Hook

**Files:**
- Create: `resources/js/hooks/usePrintClosing.ts`

**Interfaces:**
- Consumes: `ClosingReportData` from `printer.ts`
- Produces: `{ print(data: ClosingReportData): Promise<void>, isPrinting, printError }`

- [ ] **Step 1: Create usePrintClosing.ts**

```typescript
import { useState, useCallback } from 'react';
import { generateClosingEscPos, printReceipt } from '@/lib/printer';
import type { ClosingReportData, StoreInfo } from '@/lib/printer';
import { isNative } from '@/lib/capacitor';

const STORE_CONFIG: StoreInfo = {
    name: 'GRAHA MOTOR',
    address: 'Jl. Raya Pertamina No. 1',
    phone: '0812-3456-7890',
};

export function usePrintClosing() {
    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

    const print = useCallback(async (data: ClosingReportData) => {
        setIsPrinting(true);
        setPrintError(null);

        try {
            if (!isNative()) {
                // Web fallback: show as printable HTML
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <html><head><title>Closing Report</title>
                        <style>body{font-family:monospace;font-size:12px;padding:20px;max-width:300px;margin:0 auto}
                        h2,h3{text-align:center;margin:4px 0}hr{border:none;border-top:1px dashed #000;margin:8px 0}
                        .row{display:flex;justify-content:space-between}</style></head><body>
                        <h2>${STORE_CONFIG.name}</h2><p style="text-align:center">${STORE_CONFIG.address}<br>${STORE_CONFIG.phone}</p><hr>
                        <h3>LAPORAN CLOSING KASIR</h3><hr>
                        <p>Tanggal: ${data.date}<br>Kasir: ${data.cashierName}<br>Buka: ${data.openedAt} → Tutup: ${data.closedAt}<br>Durasi: ${data.duration}</p><hr>
                        <p><strong>RINGKASAN</strong><br>Transaksi: ${data.totalTransactions}<br>Revenue: Rp ${data.totalRevenue.toLocaleString('id-ID')}<br>Profit: Rp ${data.totalProfit.toLocaleString('id-ID')}</p><hr>
                        <p><strong>SETTLEMENT</strong><br>Saldo Awal: Rp ${data.openingCash.toLocaleString('id-ID')}<br>Expected: Rp ${data.expectedCash.toLocaleString('id-ID')}<br>Fisik: Rp ${data.physicalCash.toLocaleString('id-ID')}<br>Selisih: Rp ${data.difference.toLocaleString('id-ID')} (${data.settlementStatus})</p><hr>
                        <p style="margin-top:30px">TTD Kasir: ____________<br>TTD Supervisor: ________</p>
                        </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                }
                return;
            }

            // Capacitor: send to Bluetooth printer
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { listDevices: () => Promise<{ devices: Array<{ name: string; address: string }> }>; connect: (opts: { address: string }) => Promise<void>; print: (opts: { data: string }) => Promise<{ success: boolean }>; disconnect: () => Promise<void> } };
            const { BluetoothPrinter } = plugin;

            const savedAddress = localStorage.getItem('printer_address');
            if (!savedAddress) {
                throw new Error('Printer belum dikonfigurasi. Buka Pengaturan Printer.');
            }

            await BluetoothPrinter.connect({ address: savedAddress });
            const bytes = generateClosingEscPos(data, STORE_CONFIG);
            const dataStr = String.fromCharCode(...bytes);
            await BluetoothPrinter.print({ data: dataStr });
            await BluetoothPrinter.disconnect();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal mencetak closing report.';
            setPrintError(message);
        } finally {
            setIsPrinting(false);
        }
    }, []);

    return { print, isPrinting, printError };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/hooks/usePrintClosing.ts
git commit -m "feat(printer): add closing report print hook"
```

---

## Task 8: Closing Report — UI Component & Integration

**Files:**
- Create: `resources/js/Components/pos/closing-report.tsx`
- Modify: `resources/js/Components/pos/settlement-modal.tsx`

**Interfaces:**
- Consumes: `ClosingReportData` from settlement response
- Consumes: `usePrintClosing` hook
- Produces: Print button triggers Bluetooth print

- [ ] **Step 1: Create closing-report.tsx**

```tsx
import { formatRupiah } from '@/lib/format';
import { Printer, X } from 'lucide-react';
import { usePrintClosing } from '@/hooks/usePrintClosing';
import type { ClosingReportData } from '@/lib/printer';

interface ClosingReportProps {
    show: boolean;
    onClose: () => void;
    data: ClosingReportData | null;
}

export function ClosingReport({ show, onClose, data }: ClosingReportProps) {
    const { print, isPrinting, printError } = usePrintClosing();

    if (!show || !data) return null;

    const handlePrint = () => {
        print(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-950">Closing Report</span>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Report Preview */}
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed">
                    <div className="text-center font-bold">GRAHA MOTOR</div>
                    <div className="text-center text-[10px] text-slate-500">Jl. Raya Pertamina No. 1</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="text-center font-bold">LAPORAN CLOSING KASIR</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div>Tanggal: {data.date}</div>
                    <div>Kasir: {data.cashierName}</div>
                    <div>Buka: {data.openedAt} → Tutup: {data.closedAt}</div>
                    <div>Durasi: {data.duration}</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="font-bold">RINGKASAN</div>
                    <div>Transaksi: {data.totalTransactions}</div>
                    <div>Revenue: Rp {formatRupiah(data.totalRevenue)}</div>
                    <div>Profit: Rp {formatRupiah(data.totalProfit)}</div>
                    <div className="my-2 border-t border-dashed border-slate-300" />
                    <div className="font-bold">SETTLEMENT</div>
                    <div>Saldo Awal: Rp {formatRupiah(data.openingCash)}</div>
                    <div>Expected: Rp {formatRupiah(data.expectedCash)}</div>
                    <div>Fisik: Rp {formatRupiah(data.physicalCash)}</div>
                    <div className="font-bold">Selisih: Rp {formatRupiah(data.difference)} ({data.settlementStatus})</div>
                </div>

                {printError && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                        {printError}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        {isPrinting ? 'Mencetak...' : 'Cetak'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Update settlement-modal.tsx to show closing report after close**

In `resources/js/Components/pos/settlement-modal.tsx`, update the component to accept a `closingData` prop and show the closing report after successful settlement.

Update the interface to add:
```tsx
import { ClosingReport } from './closing-report';
import type { ClosingReportData } from '@/lib/printer';

// Add to SettlementModalProps:
closingData: ClosingReportData | null;
showClosingReport: boolean;
onCloseClosingReport: () => void;
```

Add at the end of the return (before the final closing `</div>`):
```tsx
<ClosingReport
    show={showClosingReport}
    onClose={onCloseClosingReport}
    data={closingData}
/>
```

- [ ] **Step 3: Update Create.tsx to pass closing data**

In `resources/js/Pages/Transactions/Create.tsx`, add state for closing data and pass to settlement modal:

Add state:
```tsx
const [closingData, setClosingData] = useState<ClosingReportData | null>(null);
const [showClosingReport, setShowClosingReport] = useState(false);
```

Update `handleCloseSession` to capture closing data and show report:
```tsx
// After successful close, prepare closing data
const now = new Date();
const openedAt = sessionState?.opened_at ? new Date(sessionState.opened_at) : now;
const durationMs = now.getTime() - openedAt.getTime();
const hours = Math.floor(durationMs / 3600000);
const minutes = Math.floor((durationMs % 3600000) / 60000);

setClosingData({
    date: now.toLocaleDateString('id-ID'),
    cashierName: auth?.user?.name || '-',
    openedAt: openedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    closedAt: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    duration: `${hours}j ${minutes}m`,
    totalTransactions: sessionState?.transactions_count || 0,
    totalRevenue: Number(sessionState?.cash_sales_total || 0) + Number(sessionState?.non_cash_sales_total || 0),
    totalProfit: 0, // Calculate if available
    cashTotal: Number(sessionState?.cash_sales_total || 0),
    nonCashTotal: Number(sessionState?.non_cash_sales_total || 0),
    openingCash: Number(sessionState?.opening_cash || 0),
    cashSales: Number(sessionState?.cash_sales_total || 0),
    expectedCash: expectedCash,
    physicalCash: Number(closingCashPhysical || 0),
    difference: settlementDifference,
    settlementStatus: settlementStatus,
    topProducts: [], // Populate from recap data if available
});
setShowClosingReport(true);
```

Pass to SettlementModal:
```tsx
<SettlementModal
    // ... existing props
    closingData={closingData}
    showClosingReport={showClosingReport}
    onCloseClosingReport={() => setShowClosingReport(false)}
/>
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 5: Commit**

```bash
git add resources/js/Components/pos/closing-report.tsx resources/js/Components/pos/settlement-modal.tsx resources/js/Pages/Transactions/Create.tsx
git commit -m "feat(ui): add closing report component and integrate with settlement"
```

---

## Task 9: Setting Printer — Hook & Page

**Files:**
- Create: `resources/js/hooks/usePrinter.ts`
- Create: `resources/js/Pages/Settings/Printer.tsx`
- Modify: `routes/web.php`

**Interfaces:**
- `usePrinter()` → `{ devices, isScanning, scan, connect, disconnect, connectedDevice, isConnected }`
- `GET /settings/printer` → web route

- [ ] **Step 1: Create usePrinter.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { isNative } from '@/lib/capacitor';

interface BluetoothDevice {
    name: string;
    address: string;
    type?: string;
}

export function usePrinter() {
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Load saved printer on mount
    useEffect(() => {
        const saved = localStorage.getItem('printer_device');
        if (saved) {
            try {
                const device = JSON.parse(saved);
                setConnectedDevice(device);
            } catch {}
        }
    }, []);

    const scan = useCallback(async () => {
        if (!isNative()) {
            // Web: show mock devices for testing
            setDevices([
                { name: 'MTP-III', address: '00:11:22:33:44:55' },
                { name: 'RPP300', address: 'AA:BB:CC:DD:EE:FF' },
            ]);
            return;
        }

        setIsScanning(true);
        try {
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { listDevices: () => Promise<{ devices: BluetoothDevice[] }> } };
            const { BluetoothPrinter } = plugin;
            const { devices: found } = await BluetoothPrinter.listDevices();
            setDevices(found || []);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    }, []);

    const connect = useCallback(async (device: BluetoothDevice) => {
        if (!isNative()) {
            setConnectedDevice(device);
            setIsConnected(true);
            localStorage.setItem('printer_device', JSON.stringify(device));
            localStorage.setItem('printer_address', device.address);
            return;
        }

        try {
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { connect: (opts: { address: string }) => Promise<void> } };
            const { BluetoothPrinter } = plugin;
            await BluetoothPrinter.connect({ address: device.address });
            setConnectedDevice(device);
            setIsConnected(true);
            localStorage.setItem('printer_device', JSON.stringify(device));
            localStorage.setItem('printer_address', device.address);
        } catch (error) {
            console.error('Connect failed:', error);
            throw error;
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (!isNative()) {
            setConnectedDevice(null);
            setIsConnected(false);
            localStorage.removeItem('printer_device');
            localStorage.removeItem('printer_address');
            return;
        }

        try {
            const plugin = (await import(
                '@candraadiw/capacitor-bluetooth-printer'
            )) as unknown as { BluetoothPrinter: { disconnect: () => Promise<void> } };
            const { BluetoothPrinter } = plugin;
            await BluetoothPrinter.disconnect();
            setConnectedDevice(null);
            setIsConnected(false);
            localStorage.removeItem('printer_device');
            localStorage.removeItem('printer_address');
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }, []);

    return { devices, isScanning, scan, connect, disconnect, connectedDevice, isConnected };
}
```

- [ ] **Step 2: Create Printer.tsx settings page**

```tsx
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { ArrowLeft, Bluetooth, Search, Check, X, Printer as PrinterIcon } from 'lucide-react';
import type { SharedData } from '@/types';
import { usePrinter } from '@/hooks/usePrinter';
import { TopBar } from '@/Components/pos/top-bar';

export default function PrinterSettings() {
    const { auth } = usePage<SharedData>().props;
    const { devices, isScanning, scan, connect, disconnect, connectedDevice, isConnected } = usePrinter();
    const [connectingTo, setConnectingTo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (device: { name: string; address: string }) => {
        setConnectingTo(device.address);
        setError(null);
        try {
            await connect(device);
        } catch {
            setError(`Gagal terhubung ke ${device.name}`);
        } finally {
            setConnectingTo(null);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-white">
            <Head title="Pengaturan Printer - Graha Motor" />

            <TopBar
                search=""
                onSearchChange={() => {}}
                hasOpenSession={false}
                userName={auth?.user?.name || ''}
                onSettlementClick={() => {}}
            />

            <main className="flex-1 overflow-y-auto p-3 lg:p-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link
                        href={route('transactions.create')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-base font-bold text-slate-950">Pengaturan Printer</span>
                </div>

                {/* Status */}
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PrinterIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-950">Status Printer</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {isConnected ? '● Terhubung' : '○ Tidak Terhubung'}
                        </span>
                    </div>
                    {connectedDevice && (
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                            <div>
                                <div className="text-xs font-semibold text-slate-950">{connectedDevice.name}</div>
                                <div className="text-[10px] text-slate-400">{connectedDevice.address}</div>
                            </div>
                            <button
                                onClick={disconnect}
                                className="rounded-lg px-2 py-1 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-50"
                            >
                                Putus
                            </button>
                        </div>
                    )}
                </div>

                {/* Scan */}
                <div className="mt-3">
                    <button
                        onClick={scan}
                        disabled={isScanning}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Bluetooth className="h-4 w-4" />
                        {isScanning ? 'Mencari...' : 'Scan Perangkat Bluetooth'}
                    </button>
                </div>

                {/* Device List */}
                <div className="mt-3 space-y-1">
                    {devices.length === 0 && !isScanning && (
                        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                            Tekan Scan untuk mencari perangkat.
                        </div>
                    )}

                    {devices.map((device) => (
                        <div
                            key={device.address}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                        >
                            <div>
                                <div className="text-xs font-semibold text-slate-950">{device.name || 'Unknown Device'}</div>
                                <div className="text-[10px] text-slate-400">{device.address}</div>
                            </div>
                            <button
                                onClick={() => handleConnect(device)}
                                disabled={connectingTo === device.address}
                                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                                    connectedDevice?.address === device.address
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                } disabled:opacity-50`}
                            >
                                {connectingTo === device.address ? '...' : connectedDevice?.address === device.address ? '✓ Terpilih' : 'Pilih'}
                            </button>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}
```

- [ ] **Step 3: Add route to web.php**

Inside the `kasir-only` group in `routes/web.php`, add:

```php
Route::get('/settings/printer', function () {
    return \Inertia\Inertia::render('Settings/Printer');
})->name('settings.printer');
```

- [ ] **Step 4: Add printer settings link to TopBar dropdown**

In `resources/js/Components/pos/top-bar.tsx`, add import:
```tsx
import { BarChart3, Calculator, LogOut, History, Settings } from 'lucide-react';
```

Add after the "Riwayat Penjualan" button:

```tsx
<button
    onClick={() => {
        setDropdownOpen(false);
        router.visit(route('settings.printer'));
    }}
    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-950 hover:bg-slate-50"
>
    <Settings className="h-4 w-4 text-slate-400" />
    Pengaturan Printer
</button>
```

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 6: Commit**

```bash
git add resources/js/hooks/usePrinter.ts resources/js/Pages/Settings/Printer.tsx routes/web.php resources/js/Components/pos/top-bar.tsx
git commit -m "feat: add printer settings page with Bluetooth scan and connect"
```

---

## Task 10: Printer Status Indicator in TopBar

**Files:**
- Modify: `resources/js/Components/pos/top-bar.tsx`

**Interfaces:**
- Consumes: `localStorage.getItem('printer_device')` for saved printer
- Produces: Printer status icon in TopBar (green dot if saved, gray if not)

- [ ] **Step 1: Add printer status indicator**

In `resources/js/Components/pos/top-bar.tsx`, add state for printer status:

```tsx
const [hasSavedPrinter, setHasSavedPrinter] = useState(false);

useEffect(() => {
    const saved = localStorage.getItem('printer_device');
    setHasSavedPrinter(!!saved);
}, []);
```

Add printer icon next to the session status dot (in the Right section):

```tsx
{/* Printer Status */}
<Link
    href={route('settings.printer')}
    className="relative"
    title={hasSavedPrinter ? 'Printer terkonfigurasi' : 'Printer belum dikonfigurasi'}
>
    <Printer className="h-4 w-4 text-slate-400" />
    <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${hasSavedPrinter ? 'bg-emerald-500' : 'bg-slate-300'}`} />
</Link>
```

Add Printer import:
```tsx
import { BarChart3, Calculator, LogOut, History, Settings, Printer } from 'lucide-react';
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/pos/top-bar.tsx
git commit -m "feat(ui): add printer status indicator to topbar"
```

---

## Task 11: Backend — Enhance Session Close with Closing Data

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php`
- Modify: `app/Http/Controllers/Api/SessionController.php`

**Interfaces:**
- `closeSession()` now returns closing report data in response
- API `close()` returns closing report data in JSON

- [ ] **Step 1: Update web closeSession to return closing data**

In `app/Http/Controllers/TransactionController.php`, update `closeSession()` to return closing data:

After the session update, before returning, add:

```php
// Build closing report data
$transactions = Transaction::where('cashier_session_id', $session->id)->get();
$paymentBreakdown = $transactions->groupBy('payment_method')->map(fn($txns) => [
    'count' => $txns->count(),
    'total' => (float) $txns->sum('total_amount'),
]);

$topProducts = TransactionItem::whereHas('transaction', fn($q) => $q->where('cashier_session_id', $session->id))
    ->selectRaw('product_name, SUM(quantity) as qty, SUM(quantity * price_at_time) as revenue')
    ->groupBy('product_name')
    ->orderByDesc('qty')
    ->limit(5)
    ->get()
    ->map(fn($item) => [
        'name' => $item->product_name,
        'quantity' => (int) $item->qty,
        'revenue' => (float) $item->revenue,
    ]);

$closingData = [
    'date' => now()->toLocaleDateString('id-ID'),
    'cashierName' => auth()->user()->name,
    'openedAt' => $session->opened_at->format('H:i'),
    'closedAt' => now()->format('H:i'),
    'duration' => $session->opened_at->diffForHumans(now(), true),
    'totalTransactions' => (int) $session->transactions_count,
    'totalRevenue' => (float) ($session->cash_sales_total + $session->non_cash_sales_total),
    'totalProfit' => (float) $transactions->sum('total_profit'),
    'cashTotal' => (float) $session->cash_sales_total,
    'nonCashTotal' => (float) $session->non_cash_sales_total,
    'openingCash' => (float) $session->opening_cash,
    'cashSales' => (float) $session->cash_sales_total,
    'expectedCash' => $expectedCash,
    'physicalCash' => $closingCash,
    'difference' => $closingCash - $expectedCash,
    'settlementStatus' => ($closingCash - $expectedCash) === 0 ? 'balance' : (($closingCash - $expectedCash) < 0 ? 'minus' : 'over'),
    'topProducts' => $topProducts->toArray(),
    'paymentBreakdown' => $paymentBreakdown->toArray(),
];
```

Update the return statement:
```php
return back()
    ->with('success', 'Sesi kasir berhasil ditutup.')
    ->with('closingData', $closingData);
```

- [ ] **Step 2: Update API close to return closing data**

In `app/Http/Controllers/Api/SessionController.php`, add the same closing data logic and return it:

```php
// After session update, build closingData (same logic as web)
// ...

return response()->json([
    'message' => 'Sesi kasir berhasil ditutup.',
    'closingData' => $closingData,
]);
```

- [ ] **Step 3: Verify routes work**

Run: `php artisan route:list | grep close`
Expected: Shows session close routes

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/TransactionController.php app/Http/Controllers/Api/SessionController.php
git commit -m "feat(backend): return closing report data from session close"
```

---

## Task 12: Integration Testing & Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Build frontend**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in` with no errors

- [ ] **Step 2: Verify all routes register**

Run: `php artisan route:list | grep -E "history|void|printer|closing"`
Expected: All new routes appear

- [ ] **Step 3: Verify database migration**

Run: `php artisan migrate:status | grep void`
Expected: Shows `Ran` status

- [ ] **Step 4: Test web flow manually**

1. Open `/pos` → verify TopBar has new links
2. Open `/pos/history` → verify page loads
3. Open `/settings/printer` → verify page loads
4. Do a transaction → close session → verify closing report appears

- [ ] **Step 5: Sync and test on tablet**

Run:
```bash
npx cap sync android
cd android && JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Test on tablet:
1. Login with PIN 1234
2. Open menu → verify "Riwayat Penjualan" and "Pengaturan Printer" appear
3. Open Riwayat → verify transaction list loads
4. Open Pengaturan Printer → verify scan works

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: phase 1 complete - closing report, printer settings, sales history with void"
```

---

## Summary

| Task | Feature | Est. Time |
|------|---------|-----------|
| 1 | Database migration (void fields) | 10 min |
| 2 | Backend history & void API | 30 min |
| 3 | Void modal component | 15 min |
| 4 | Sales history page | 30 min |
| 5 | TopBar history link | 10 min |
| 6 | Closing ESC/POS generator | 20 min |
| 7 | Closing print hook | 15 min |
| 8 | Closing UI + settlement integration | 30 min |
| 9 | Printer settings hook + page | 30 min |
| 10 | Printer status indicator | 10 min |
| 11 | Session close with closing data | 20 min |
| 12 | Integration testing | 20 min |
| **Total** | | **~4-5 jam** |
