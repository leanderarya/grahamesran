<?php

namespace App\Http\Controllers;

use App\Models\CashierSession;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function create()
    {
        $openSession = $this->getOpenSession();

        $categories = Product::where('stock', '>', 0)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        $activeDraft = Transaction::draft()
            ->where('user_id', auth()->id())
            ->latest()
            ->first();

        if ($activeDraft) {
            $activeDraft->load('transactionItems.product');
        }

        return Inertia::render('Transactions/Create', [
            'products' => Product::with('vehicles')
                ->where('stock', '>', 0)
                ->select('id', 'sku', 'name', 'category', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
                ->get(),
            'categories' => $categories,
            'cashierSession' => $openSession ? $this->buildSessionPayload($openSession) : null,
            'activeDraft' => $activeDraft ? [
                'id' => $activeDraft->id,
                'invoice_number' => $activeDraft->invoice_number,
                'customer_type' => $activeDraft->customer_type,
                'total_amount' => (float) $activeDraft->total_amount,
                'transaction_items' => $activeDraft->transactionItems->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price_at_time' => (float) $item->price_at_time,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'sku' => $item->product->sku,
                        'name' => $item->product->name,
                        'category' => $item->product->category,
                        'image_path' => $item->product->image_path,
                        'image_url' => $item->product->image_url,
                        'volume_liter' => $item->product->volume_liter ? (float) $item->product->volume_liter : null,
                        'stock' => $item->product->stock,
                        'sell_price' => (float) $item->product->sell_price,
                        'workshop_price' => $item->product->workshop_price ? (float) $item->product->workshop_price : null,
                        'display_name' => $item->product->display_name,
                    ] : null,
                ]),
            ] : null,
        ]);
    }

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

        return redirect()->route('transactions.checkout', ['transaction' => $draft->id]);
    }

    public function checkout(Request $request, $transactionId = null)
    {
        $draftId = $transactionId ?? $request->query('draft');

        if (! $draftId) {
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

    /**
     * Auto-save draft — dipanggil otomatis saat keranjang berubah.
     * Return JSON, bukan redirect.
     */
    public function autoSaveDraft(Request $request)
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

                // Draft sudah tidak ada (mungkin dihapus), buat baru
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

    /**
     * Hapus draft saat keranjang dikosongkan.
     * Bisa pakai draft_id, atau hapus semua draft milik user.
     */
    public function clearDraft(Request $request)
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

    public function destroyDraft(Transaction $transaction)
    {
        if ($transaction->status !== 'draft' || $transaction->user_id !== auth()->id()) {
            abort(403);
        }

        $transaction->transactionItems()->delete();
        $transaction->delete();

        return redirect()->route('transactions.create')->with('success', 'Draft transaksi dibatalkan.');
    }

    public function recap()
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

        $transactions = $baseQuery
            ->latest()
            ->limit(20)
            ->get();

        $summary = [
            'total_transactions' => $transactions->count(),
            'cash_total' => (float) $transactions->where('payment_method', 'cash')->sum('total_amount'),
            'non_cash_total' => (float) $transactions->where('payment_method', '!=', 'cash')->sum('total_amount'),
            'revenue_total' => (float) $transactions->sum('total_amount'),
            'profit_total' => (float) $transactions->sum('total_profit'),
        ];

        $topProducts = $transactions
            ->flatMap(fn (Transaction $transaction) => $transaction->transactionItems)
            ->groupBy('product_id')
            ->map(function ($items) {
                /** @var \App\Models\TransactionItem $firstItem */
                $firstItem = $items->first();
                $product = $firstItem?->product;

                return [
                    'product_name' => $product?->display_name ?? 'Produk terhapus',
                    'image_url' => $product?->image_url,
                    'quantity' => (int) $items->sum('quantity'),
                    'revenue' => (float) $items->sum(fn ($item) => $item->quantity * $item->price_at_time),
                ];
            })
            ->sortByDesc('quantity')
            ->take(8)
            ->values();

        return Inertia::render('Transactions/Recap', [
            'cashierSession' => $openSession ? $this->buildSessionPayload($openSession) : null,
            'summary' => $summary,
            'transactions' => $transactions->map(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice_number' => $transaction->invoice_number,
                    'created_at' => $transaction->created_at?->toIso8601String(),
                    'payment_method' => $transaction->payment_method,
                    'customer_type' => $transaction->customer_type,
                    'total_amount' => (float) $transaction->total_amount,
                    'items_count' => $transaction->transactionItems->sum('quantity'),
                ];
            }),
            'topProducts' => $topProducts,
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['transactionItems.product', 'user']);

        return Inertia::render('Transactions/Show', [
            'transaction' => [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'created_at' => $transaction->created_at?->toIso8601String(),
                'payment_method' => $transaction->payment_method,
                'customer_type' => $transaction->customer_type,
                'total_amount' => (float) $transaction->total_amount,
                'amount_paid' => (float) $transaction->amount_paid,
                'change_amount' => (float) $transaction->change_amount,
                'cashier_name' => $transaction->user?->name ?? '-',
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

    public function openSession(Request $request)
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

        return redirect()->route('transactions.create')->with('success', 'Kasir berhasil dibuka.');
    }

    public function closeSession(Request $request)
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

        // Build closing report data
        $transactions = Transaction::where('cashier_session_id', $session->id)->get();
        $paymentBreakdown = $transactions->groupBy('payment_method')->map(fn ($txns) => [
            'count' => $txns->count(),
            'total' => (float) $txns->sum('total_amount'),
        ]);

        $topProducts = TransactionItem::whereHas('transaction', fn ($q) => $q->where('cashier_session_id', $session->id))
            ->join('products', 'products.id', '=', 'transaction_items.product_id')
            ->selectRaw('products.name as product_name, products.volume_liter, SUM(transaction_items.quantity) as qty, SUM(transaction_items.quantity * transaction_items.price_at_time) as revenue')
            ->groupBy('products.id', 'products.name', 'products.volume_liter')
            ->orderByDesc('qty')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $volume = $item->volume_liter ? rtrim(rtrim(number_format((float) $item->volume_liter, 2, '.', ''), '0'), '.') : null;
                $name = $volume ? "{$item->product_name} ({$volume}L)" : $item->product_name;

                return [
                    'name' => $name,
                    'quantity' => (int) $item->qty,
                    'revenue' => (float) $item->revenue,
                ];
            });

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

        return back()
            ->with('success', 'Sesi kasir berhasil ditutup.')
            ->with('closingData', $closingData);
    }

    public function store(Request $request)
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
            DB::transaction(function () use ($validated, $openSession) {

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

                    $finalPrice = $this->determinePrice(
                        $product,
                        $validated['customer_type']
                    );

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
            });

            return redirect()->back()->with('success', 'Transaksi Berhasil Disimpan!');

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem: '.$e->getMessage()]);
        }
    }

    /**
     * Logic Harga: Pilih harga bengkel atau umum.
     */
    private function determinePrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return $product->workshop_price;
        }

        return $product->sell_price;
    }

    /**
     * Generator Invoice Unik.
     * Format: INV-YYYYMMDD-TIMESTAMP (Lebih aman dari duplikasi)
     */
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
            'opened_at' => Carbon::parse($session->opened_at)->toIso8601String(),
            'closed_at' => $session->closed_at ? Carbon::parse($session->closed_at)->toIso8601String() : null,
            'opening_notes' => $session->opening_notes,
            'closing_notes' => $session->closing_notes,
        ];
    }
}
