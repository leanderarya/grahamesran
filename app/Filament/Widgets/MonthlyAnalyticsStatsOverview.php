<?php

namespace App\Filament\Widgets;

use App\Filament\Concerns\ResolvesMonthlyAnalyticsFilter;
use App\Models\Transaction;
use Filament\Widgets\Concerns\InteractsWithPageFilters;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class MonthlyAnalyticsStatsOverview extends StatsOverviewWidget
{
    use InteractsWithPageFilters;
    use ResolvesMonthlyAnalyticsFilter;

    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $month = $this->getSelectedAnalyticsMonth($this->filters);
        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();
        $previousMonthStart = $month->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $month->copy()->subMonth()->endOfMonth();

        $monthlyRevenue = (float) Transaction::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount');
        $monthlyProfit = (float) Transaction::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_profit');
        $recordCount = Transaction::whereBetween('created_at', [$monthStart, $monthEnd])->count();
        $previousRevenue = (float) Transaction::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->sum('total_amount');
        $activeDays = Transaction::whereBetween('created_at', [$monthStart, $monthEnd])
            ->selectRaw('DATE(created_at) as sales_date')
            ->groupBy('sales_date')
            ->get()
            ->count();
        $averageRevenue = $activeDays > 0 ? $monthlyRevenue / $activeDays : 0;
        $bestDailyRevenue = (float) Transaction::whereBetween('created_at', [$monthStart, $monthEnd])
            ->selectRaw('SUM(total_amount) as revenue')
            ->groupByRaw('DATE(created_at)')
            ->orderByDesc('revenue')
            ->value('revenue');

        return [
            Stat::make('Omset '.$month->translatedFormat('F Y'), $this->formatCurrency($monthlyRevenue))
                ->description($this->makeComparisonText($monthlyRevenue, $previousRevenue))
                ->descriptionIcon($monthlyRevenue >= $previousRevenue ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($monthlyRevenue >= $previousRevenue ? 'success' : 'danger'),

            Stat::make('Profit Bulanan', $this->formatCurrency($monthlyProfit))
                ->description('Akumulasi margin bulan terpilih')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('primary'),

            Stat::make('Hari Aktif', number_format($activeDays, 0, ',', '.'))
                ->description('Jumlah hari dengan transaksi')
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color('warning'),

            Stat::make('Rata-rata Omset / Hari', $this->formatCurrency($averageRevenue))
                ->description('Dihitung dari hari yang memiliki penjualan')
                ->descriptionIcon('heroicon-m-chart-bar')
                ->color('gray'),

            Stat::make('Record Transaksi', number_format($recordCount, 0, ',', '.'))
                ->description('Termasuk hasil impor rekap')
                ->descriptionIcon('heroicon-m-receipt-percent')
                ->color('info'),

            Stat::make('Puncak Penjualan Harian', $this->formatCurrency($bestDailyRevenue))
                ->description('Omset harian tertinggi pada bulan ini')
                ->descriptionIcon('heroicon-m-fire')
                ->color('success'),
        ];
    }

    private function formatCurrency(float $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    private function makeComparisonText(float $current, float $previous): string
    {
        if ($previous <= 0) {
            return $current > 0 ? 'Data bulan sebelumnya belum tersedia' : 'Belum ada penjualan';
        }

        $difference = (($current - $previous) / $previous) * 100;
        $prefix = $difference >= 0 ? '+' : '';

        return $prefix.number_format($difference, 1, ',', '.').'% vs bulan sebelumnya';
    }
}
