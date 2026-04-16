<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class SalesChart extends ChartWidget
{
    protected static ?string $heading = 'Grafik Penjualan Bulan Ini';

    // Urutan ke-2 (setelah StatsOverview)
    protected static ?int $sort = 2;

    protected static ?string $maxHeight = '260px';

    // Tampil sejajar dengan grafik bulanan
    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        // Ambil data bulan ini per hari
        $data = Trend::model(Transaction::class)
            ->between(
                start: now()->startOfMonth(),
                end: now()->endOfMonth(),
            )
            ->perDay()
            ->sum('total_amount'); // Sum kolom total belanja

        return [
            'datasets' => [
                [
                    'label' => 'Omset Harian (Rp)',
                    'data' => $data->map(fn (TrendValue $value) => $value->aggregate),
                    'borderColor' => '#3b82f6', // Warna Biru Filament
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)', // Biru transparan
                    'fill' => true,
                    'tension' => 0.4, // Biar garisnya melengkung halus (tidak kaku)
                    'pointRadius' => 3,
                    'pointHoverRadius' => 5,
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => Carbon::parse($value->date)->format('d M')),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
