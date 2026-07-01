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
