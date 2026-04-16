<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\BestSellingProducts;
use App\Filament\Widgets\LowStockAlert;
use App\Filament\Widgets\MonthlyRevenueChart;
use App\Filament\Widgets\SalesChart;
use App\Filament\Widgets\StatsOverview;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?int $navigationSort = -1;

    protected static ?string $title = 'Dashboard';

    protected ?string $heading = 'Dashboard Admin';

    protected ?string $subheading = 'Ringkasan performa toko, omset, stok, dan produk terlaris.';

    public function getWidgets(): array
    {
        return [
            StatsOverview::class,
            SalesChart::class,
            MonthlyRevenueChart::class,
            BestSellingProducts::class,
            LowStockAlert::class,
        ];
    }

    public function getColumns(): int|string|array
    {
        return 2;
    }
}
