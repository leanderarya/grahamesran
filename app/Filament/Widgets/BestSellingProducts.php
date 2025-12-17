<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class BestSellingProducts extends BaseWidget
{
    // Atur urutan tampilan di dashboard (biar gak paling atas)
    protected static ?int $sort = 3; 
    
    // Lebar widget (Full width biar enak lihatnya)
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    // Hitung jumlah qty terjual dari tabel items
                    ->withSum('transactionItems as total_sold', 'quantity')
                    // Hanya ambil yang sudah pernah laku
                    ->having('total_sold', '>', 0)
                    ->orderByDesc('total_sold')
                    ->limit(5) // Ambil Top 5 saja
            )
            ->heading('Produk Paling Laris (Top 5)')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Barang')
                    ->weight('bold'),
                
                Tables\Columns\TextColumn::make('sku')
                    ->label('SKU')
                    ->color('gray'),

                Tables\Columns\TextColumn::make('total_sold')
                    ->label('Terjual (Pcs)')
                    ->alignCenter()
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('stock')
                    ->label('Sisa Stok')
                    ->alignCenter()
                    ->color(fn (string $state): string => $state <= 5 ? 'danger' : 'gray'),
            ])
            ->paginated(false); // Matikan pagination biar ringkas
    }
}