<?php

namespace App\Filament\Concerns;

use App\Models\Transaction;
use Carbon\Carbon;

trait ResolvesMonthlyAnalyticsFilter
{
    protected function getMonthlyAnalyticsMonthOptions(): array
    {
        $months = Transaction::query()
            ->selectRaw('DISTINCT DATE_FORMAT(created_at, "%Y-%m") as month_key')
            ->orderByDesc('month_key')
            ->pluck('month_key');

        if ($months->isEmpty()) {
            $months = collect([now()->format('Y-m')]);
        }

        return $months
            ->mapWithKeys(function (string $monthKey): array {
                $label = Carbon::createFromFormat('Y-m', $monthKey)
                    ->locale('id')
                    ->translatedFormat('F Y');

                return [$monthKey => ucfirst($label)];
            })
            ->all();
    }

    protected function getSelectedAnalyticsMonth(?array $filters = null): Carbon
    {
        $monthOptions = $this->getMonthlyAnalyticsMonthOptions();
        $selectedMonth = $filters['month'] ?? array_key_first($monthOptions) ?? now()->format('Y-m');

        if (! is_string($selectedMonth) || ! array_key_exists($selectedMonth, $monthOptions)) {
            $selectedMonth = array_key_first($monthOptions) ?? now()->format('Y-m');
        }

        return Carbon::createFromFormat('Y-m', $selectedMonth)->startOfMonth();
    }
}
