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
