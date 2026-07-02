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
     *
     * @param bool $allowMissing If true, creates a new draft when the referenced draft is missing (for auto-save resilience)
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

            // If allowMissing is false (manual save), throw 404
            if (! $allowMissing) {
                abort(404);
            }

            // Otherwise fall through to create a new draft
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
     */
    private function syncDraftItems(Transaction $draft, array $cart, string $customerType): void
    {
        $grandTotal = 0;
        $totalProfit = 0;

        foreach ($cart as $item) {
            $product = Product::find($item['id']);
            if (! $product) {
                continue;
            }

            $finalPrice = $this->pricing->getEffectivePrice($product, $customerType);
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
            'customer_type' => $customerType,
        ]);
    }
}
