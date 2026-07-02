<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashierSession;
use App\Models\Transaction;
use App\Models\TransactionItem;
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

        return response()->json([
            'message' => 'Sesi kasir berhasil ditutup.',
            'closingData' => $closingData,
        ]);
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
