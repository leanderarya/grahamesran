<?php

namespace App\Services;

use App\Models\MonthlyReport;
use App\Models\Transaction;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use RuntimeException;

class MonthlyReportService
{
    public function syncMonth(CarbonInterface|string $month): MonthlyReport
    {
        $monthDate = $this->normalizeMonth($month);
        [$monthStart, $monthEnd] = [$monthDate->copy()->startOfMonth(), $monthDate->copy()->endOfMonth()];

        $report = MonthlyReport::query()
            ->whereDate('month_date', $monthDate->toDateString())
            ->first();

        if (! $report) {
            $report = new MonthlyReport([
                'month_date' => $monthDate->toDateString(),
            ]);
        }

        $totals = Transaction::query()
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->selectRaw('COUNT(*) as transaction_count')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_amount')
            ->selectRaw('COALESCE(SUM(total_profit), 0) as total_profit')
            ->first();

        $report->fill([
            'transaction_count' => (int) ($totals?->transaction_count ?? 0),
            'total_amount' => (float) ($totals?->total_amount ?? 0),
            'total_profit' => (float) ($totals?->total_profit ?? 0),
        ]);
        $report->save();

        return $report->fresh();
    }

    public function isFinalized(CarbonInterface|string $month): bool
    {
        return MonthlyReport::query()
            ->whereDate('month_date', $this->normalizeMonth($month)->toDateString())
            ->whereNotNull('finalized_at')
            ->exists();
    }

    public function assertMonthIsOpen(CarbonInterface|string $month): void
    {
        $monthDate = $this->normalizeMonth($month);

        if (! $this->isFinalized($monthDate)) {
            return;
        }

        $label = ucfirst($monthDate->locale('id')->translatedFormat('F Y'));

        throw new RuntimeException("Bulan {$label} sudah difinalisasi dan tidak bisa diubah.");
    }

    public function normalizeMonth(CarbonInterface|string $month): Carbon
    {
        if ($month instanceof CarbonInterface) {
            return Carbon::instance($month)->startOfMonth();
        }

        if (preg_match('/^\d{4}-\d{2}$/', $month) === 1) {
            return Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $month) === 1) {
            return Carbon::parse($month)->startOfMonth();
        }

        return Carbon::createFromFormat('Y-m', $month)->startOfMonth();
    }
}
