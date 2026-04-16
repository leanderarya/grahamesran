<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class MonthlyRevenueChart extends ChartWidget
{
    protected static ?string $heading = 'Grafik Omset 6 Bulan Terakhir';

    protected static ?int $sort = 3;

    protected static ?string $maxHeight = '260px';

    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        $data = Trend::model(Transaction::class)
            ->between(
                start: now()->subMonths(5)->startOfMonth(),
                end: now()->endOfMonth(),
            )
            ->perMonth()
            ->sum('total_amount');

        return [
            'datasets' => [
                [
                    'label' => 'Omset Bulanan (Rp)',
                    'data' => $data->map(fn (TrendValue $value) => (float) $value->aggregate),
                    'backgroundColor' => [
                        'rgba(59, 130, 246, 0.45)',
                        'rgba(59, 130, 246, 0.45)',
                        'rgba(59, 130, 246, 0.45)',
                        'rgba(59, 130, 246, 0.45)',
                        'rgba(59, 130, 246, 0.45)',
                        'rgba(11, 43, 163, 0.85)',
                    ],
                    'borderColor' => [
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(11, 43, 163, 1)',
                    ],
                    'borderWidth' => 1,
                    'borderRadius' => 10,
                    'barThickness' => 32,
                    'maxBarThickness' => 40,
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => Carbon::parse($value->date)->translatedFormat('M Y')),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
