<?php

namespace App\Services;

use App\Models\CashierSession;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;

class ClosingReportService
{
    /**
     * Build closing report data for a cashier session.
     * Returns the array consumed by both web and API controllers.
     */
    public function buildReport(CashierSession $session): array
    {
        $expectedCash = (float) $session->opening_cash + (float) $session->cash_sales_total;
        $closingCash = (float) $session->closing_cash_physical;
        $difference = $closingCash - $expectedCash;

        $transactions = Transaction::where('cashier_session_id', $session->id)
            ->where('status', 'paid')
            ->get();

        $paymentBreakdown = $transactions->groupBy('payment_method')->map(fn ($txns) => [
            'count' => $txns->count(),
            'total' => (float) $txns->sum('total_amount'),
        ]);

        $topProducts = TransactionItem::whereHas('transaction', fn ($q) => $q->where('cashier_session_id', $session->id)->where('status', 'paid'))
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

        return [
            'date' => now()->toLocaleDateString('id-ID'),
            'cashierName' => $session->user?->name ?? '-',
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
            'difference' => $difference,
            'settlementStatus' => $difference === 0 ? 'balance' : ($difference < 0 ? 'minus' : 'over'),
            'topProducts' => $topProducts->toArray(),
            'paymentBreakdown' => $paymentBreakdown->toArray(),
        ];
    }
}
