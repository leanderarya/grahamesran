<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use App\Models\Purchase;
use App\Models\Expense;
use App\Models\Product; // <--- Import Product buat hitung aset
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class StatsOverview extends BaseWidget
{
    protected static ?string $pollingInterval = '60s';

    protected function getStats(): array
    {
        // --- 1. SETUP WAKTU ---
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // --- 2. HITUNG OMSET (Bulan Ini vs Bulan Lalu) ---
        $omsetThisMonth = Transaction::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('total_amount');
        $omsetLastMonth = Transaction::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->sum('total_amount');
        
        // Tentukan warna & icon berdasarkan kenaikan/penurunan
        $omsetColor = $omsetThisMonth >= $omsetLastMonth ? 'success' : 'danger';
        $omsetIcon = $omsetThisMonth >= $omsetLastMonth ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down';
        $omsetDesc = $omsetThisMonth >= $omsetLastMonth ? 'Naik dari bulan lalu' : 'Turun dari bulan lalu';

        // --- 3. HITUNG PROFIT BERSIH (Bulan Ini) ---
        // Gross Profit Bulan Ini
        $grossProfit = Transaction::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('total_profit');
        // Pengeluaran Operasional Bulan Ini
        $expenses = Expense::whereBetween('date_expense', [$startOfMonth, $endOfMonth])->sum('amount');
        // Net Profit
        $netProfit = $grossProfit - $expenses;

        // --- 4. DATA GRAFIK (Omset 7 Hari Terakhir) ---
        // Consolidated from 7 queries to 1 grouped query
        $dailyTotals = Transaction::query()
            ->selectRaw('DATE(created_at) as sale_date')
            ->selectRaw('SUM(total_amount) as total')
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->groupBy('sale_date')
            ->get()
            ->keyBy('sale_date');

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $chartData[] = (float) ($dailyTotals[$date]->total ?? 0);
        }

        // --- 5. DATA ASET GUDANG (Snapshot Saat Ini) ---
        // Hitung nilai stok (Stok * HPP)
        // Ini uang yang "mati" di rak
        // Kita pakai native SQL perkalian biar cepat
        $totalAset = Cache::remember('dashboard_asset_value', 300, fn () => Product::query()->sum(\Illuminate\Support\Facades\DB::raw('stock * cost_price')));

        return [
            // KOTAK 1: Omset Bulan Ini (Dengan Komparasi)
            Stat::make('Omset Bulan Ini', 'Rp ' . number_format($omsetThisMonth, 0, ',', '.'))
                ->description($omsetDesc)
                ->descriptionIcon($omsetIcon)
                ->chart($chartData) // Grafik real 7 hari terakhir
                ->color($omsetColor),

            // KOTAK 2: Profit Bersih Bulan Ini
            Stat::make('Profit Bersih (Bulan Ini)', 'Rp ' . number_format($netProfit, 0, ',', '.'))
                ->description('Margin - Biaya Ops (Bulan Ini)')
                ->descriptionIcon($netProfit > 0 ? 'heroicon-m-face-smile' : 'heroicon-m-face-frown')
                ->color($netProfit >= 0 ? 'success' : 'danger'),

            // KOTAK 3: Valuasi Aset Gudang (PENTING BUAT TOKO)
            Stat::make('Nilai Aset Gudang', 'Rp ' . number_format($totalAset, 0, ',', '.'))
                ->description('Total modal mandek di barang')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('info'), // Biru netral
        ];
    }
}