<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockAlert extends BaseWidget
{
    protected static ?int $sort = 2; // Taruh di bawah StatsOverview
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->where('stock', '<=', 5) // Ambang batas stok tipis
                    ->orderBy('stock', 'asc') // Yang paling sedikit di atas
                    ->limit(5)
            )
            ->heading('⚠️ Peringatan: Stok Menipis!')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Barang')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('stock')
                    ->label('Sisa Stok')
                    ->badge()
                    ->color('danger') // Merah menyala
                    ->icon('heroicon-m-exclamation-triangle'),
                
                Tables\Columns\TextColumn::make('cost_price')
                    ->label('HPP')
                    ->money('IDR'),
            ])
            ->emptyStateHeading('Gudang Aman')
            ->emptyStateDescription('Tidak ada barang yang stoknya kritis.')
            ->paginated(false);
    }
}