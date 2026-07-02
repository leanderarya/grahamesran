<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

class DraftService
{
    public function __construct(
        private PricingService $pricing,
        private InvoiceService $invoice,
        private CashierSessionService $sessionService,
    ) {}

    /**
     * Save a draft transaction (manual save, redirects to checkout).
     */
    public function save(Authenticatable $user, array $validated): Transaction
    {
        $openSession = $this->sessionService->getOpenSession($user->id);

        if ($openSession === null) {
            throw new \Illuminate\Validation\ValidationException(
                validator: null,
                errors: ['cart' => ['Buka kasir terlebih dahulu.']]
            );
        }

        return DB::transaction(function () use ($validated, $openSession, $user) {
            $draft = $this->findOrCreateDraft($validated, $openSession->id, $user->id);
            $this->syncDraftItems($draft, $validated['cart'], $validated['customer_type']);

            return $draft;
        });
    }

    /**
     * Auto-save a draft transaction (debounced, returns JSON).
     */
    public function autoSave(Authenticatable $user, array $validated): Transaction
    {
        $openSession = $this->sessionService->getOpenSession($user->id);

        if ($openSession === null) {
            throw new \Illuminate\Validation\ValidationException(
                validator: null,
                errors: ['cart' => ['Buka kasir terlebih dahulu.']]
            );
        }

        return DB::transaction(function () use ($validated, $openSession, $user) {
            $draft = $this->findOrCreateDraft($validated, $openSession->id, $user->id, allowMissing: true);
            $this->syncDraftItems($draft, $validated['cart'], $validated['customer_type']);

            return $draft;
        });
    }

    /**
     * Clear draft(s) — optionally filtered by draft_id.
     */
    public function clear(?int $draftId, int $userId): void
    {
        $query = Transaction::where('status', 'draft')
            ->where('user_id', $userId);

        if ($draftId) {
            $query->where('id', $draftId);
        }

        $drafts = $query->get();

        foreach ($drafts as $draft) {
            $draft->transactionItems()->delete();
            $draft->delete();
        }
    }

    /**
     * Destroy a specific draft.
     */
    public function destroy(Transaction $transaction, int $userId): bool
    {
        if ($transaction->status !== 'draft' || $transaction->user_id !== $userId) {
            return false;
        }

        $transaction->transactionItems()->delete();
        $transaction->delete();

        return true;
    }

    /**
     * Find an existing draft by ID or create a new one.
     */
    private function findOrCreateDraft(array $validated, int $sessionId, int $userId, bool $allowMissing = false): Transaction
    {
        if (! empty($validated['draft_id'])) {
            $draft = Transaction::where('id', $validated['draft_id'])
                ->where('status', 'draft')
                ->where('user_id', $userId)
                ->first();

            if ($draft) {
                $draft->transactionItems()->delete();

                return $draft;
            }

            if (! $allowMissing) {
                abort(404);
            }
        }

        return Transaction::create([
            'user_id' => $userId,
            'cashier_session_id' => $sessionId,
            'invoice_number' => $this->invoice->generate(),
            'customer_type' => $validated['customer_type'],
            'total_amount' => 0,
            'total_profit' => 0,
            'payment_method' => 'cash',
            'status' => 'draft',
        ]);
    }

    /**
     * Sync draft items from cart data — recreate all items and recalculate totals.
     * Optimized: bulk-loads products in 1 query, batch-inserts items.
     *
     * @return int[] Array of product IDs that were not found
     */
    private function syncDraftItems(Transaction $draft, array $cart, string $customerType): array
    {
        $grandTotal = 0;
        $totalProfit = 0;
        $missingProductIds = [];

        // Bulk-load all products in 1 query instead of N individual queries
        $productIds = array_column($cart, 'id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $itemsToInsert = [];

        foreach ($cart as $item) {
            $product = $products->get($item['id']);
            if (! $product) {
                $missingProductIds[] = $item['id'];
                continue;
            }

            $finalPrice = $this->pricing->getEffectivePrice($product, $customerType);
            $subtotal = $finalPrice * $item['qty'];
            $profit = ($finalPrice - $product->cost_price) * $item['qty'];

            $itemsToInsert[] = [
                'transaction_id' => $draft->id,
                'product_id' => $product->id,
                'quantity' => $item['qty'],
                'price_at_time' => $finalPrice,
                'cost_at_time' => $product->cost_price,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $grandTotal += $subtotal;
            $totalProfit += $profit;
        }

        // Batch insert instead of N individual create() calls
        if (! empty($itemsToInsert)) {
            TransactionItem::insert($itemsToInsert);
        }

        $draft->update([
            'total_amount' => $grandTotal,
            'total_profit' => $totalProfit,
            'customer_type' => $customerType,
        ]);

        return $missingProductIds;
    }
}
