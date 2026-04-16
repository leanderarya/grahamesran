<?php

namespace App\Filament\Widgets;

use App\Filament\Concerns\ResolvesMonthlyAnalyticsFilter;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;
use Filament\Widgets\Concerns\InteractsWithPageFilters;

class MonthlyAnalyticsDailySalesChart extends ChartWidget
{
    use InteractsWithPageFilters;
    use ResolvesMonthlyAnalyticsFilter;

    protected static ?string $heading = 'Grafik Penjualan Harian';

    protected static ?string $maxHeight = '300px';

    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        $month = $this->getSelectedAnalyticsMonth($this->filters);
        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();

        $rawData = Transaction::query()
            ->selectRaw('DATE(created_at) as sales_date')
            ->selectRaw('SUM(total_amount) as revenue')
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->groupBy('sales_date')
            ->orderBy('sales_date')
            ->get()
            ->keyBy('sales_date');

        $labels = [];
        $values = [];
        $cursor = $monthStart->copy();

        while ($cursor->lte($monthEnd)) {
            $labels[] = $cursor->translatedFormat('d M');
            $values[] = (float) ($rawData[$cursor->toDateString()]->revenue ?? 0);
            $cursor->addDay();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Omset Harian (Rp)',
                    'data' => $values,
                    'borderColor' => '#2563eb',
                    'backgroundColor' => 'rgba(37, 99, 235, 0.12)',
                    'fill' => true,
                    'tension' => 0.35,
                    'pointRadius' => 2,
                    'pointHoverRadius' => 4,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
