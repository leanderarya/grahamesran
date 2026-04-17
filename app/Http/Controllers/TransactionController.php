<?php

namespace App\Http\Controllers;

use App\Models\CashierSession;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
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

        return Inertia::render('Transactions/Create', [
            'products' => Product::with('vehicles')
                ->where('stock', '>', 0)
                // Security: Jangan kirim cost_price (HPP) ke frontend!
                ->select('id', 'sku', 'name', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
                ->get(),
            'cashierSession' => $openSession ? $this->buildSessionPayload($openSession) : null,
        ]);
    }

    public function recap()
    {
        $openSession = $this->getOpenSession();
        $today = now()->startOfDay();

        $baseQuery = Transaction::query()
            ->with(['items.product'])
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
            ->flatMap(fn (Transaction $transaction) => $transaction->items)
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
                    'items_count' => $transaction->items->sum('quantity'),
                ];
            }),
            'topProducts' => $topProducts,
        ]);
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

        return redirect()->route('transactions.create')->with('success', 'Sesi kasir berhasil ditutup.');
    }

    public function store(Request $request)
    {
        // 1. Validasi Request
        $validated = $request->validate([
            'cart'              => 'required|array|min:1',
            'cart.*.id'         => 'required|exists:products,id',
            'cart.*.qty'        => 'required|integer|min:1',
            'payment_method'    => 'required|string',
            'amount_paid'       => 'required|numeric',
            'change_amount'     => 'required|numeric',
            'customer_type'     => 'required|in:general,workshop',
        ]);

        $openSession = $this->getOpenSession();

        if ($openSession === null) {
            throw ValidationException::withMessages([
                'cart' => 'Buka kasir terlebih dahulu sebelum memproses transaksi.',
            ]);
        }

        try {
            // 2. Eksekusi Database Transaction
            DB::transaction(function () use ($validated, $openSession) {
                
                // A. Buat Header Transaksi
                $transaction = Transaction::create([
                    'user_id'        => auth()->id(),
                    'cashier_session_id' => $openSession->id,
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'payment_method' => $validated['payment_method'],
                    'customer_type'  => $validated['customer_type'],
                    'amount_paid'    => $validated['amount_paid'],
                    'change_amount'  => $validated['change_amount'],
                    'total_amount'   => 0, // Placeholder
                    'total_profit'   => 0, // Placeholder
                ]);

                $grandTotal = 0;
                $totalProfit = 0;

                // B. Loop Cart Items
                foreach ($validated['cart'] as $item) {
                    // Lock row produk untuk mencegah race condition stok
                    $product = Product::lockForUpdate()->find($item['id']);

                    // Validasi Stok (Backend Safety Net)
                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'cart' => "Stok barang '{$product->name}' tidak mencukupi. Sisa: {$product->stock}"
                        ]);
                    }

                    // Tentukan Harga Jual (General vs Workshop)
                    $finalPrice = $this->determinePrice(
                        $product, 
                        $validated['customer_type']
                    );

                    // Hitung Subtotal & Profit
                    $subtotal = $finalPrice * $item['qty'];
                    $profit   = ($finalPrice - $product->cost_price) * $item['qty'];

                    // Simpan Detail Item
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id'     => $product->id,
                        'quantity'       => $item['qty'],
                        'price_at_time'  => $finalPrice,
                        'cost_at_time'   => $product->cost_price,
                    ]);

                    // Kurangi Stok
                    $product->decrement('stock', $item['qty']);

                    // Akumulasi Total
                    $grandTotal += $subtotal;
                    $totalProfit += $profit;
                }

                // C. Update Header dengan Total Akhir
                $transaction->update([
                    'total_amount' => $grandTotal,
                    'total_profit' => $totalProfit
                ]);

                $cashSales = $validated['payment_method'] === 'cash' ? $grandTotal : 0;
                $nonCashSales = $validated['payment_method'] === 'cash' ? 0 : $grandTotal;

                $openSession->increment('transactions_count');
                $openSession->increment('cash_sales_total', $cashSales);
                $openSession->increment('non_cash_sales_total', $nonCashSales);
            });

            return redirect()->back()->with('success', 'Transaksi Berhasil Disimpan!');

        } catch (ValidationException $e) {
            // Lempar error validasi kembali ke frontend (akan muncul di props.errors)
            throw $e;
        } catch (\Exception $e) {
            // Tangkap error tak terduga
            return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()]);
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
        return 'INV-' . date('Ymd') . '-' . time();
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
