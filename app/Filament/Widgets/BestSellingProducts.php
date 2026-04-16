<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class BestSellingProducts extends BaseWidget
{
    // Atur urutan tampilan di dashboard (biar gak paling atas)
    protected static ?int $sort = 4;

    // Sejajar dengan widget stok menipis agar lebih ringkas
    protected int|string|array $columnSpan = 1;

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
            ->heading('Produk Paling Laris')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Barang')
                    ->weight('bold')
                    ->wrap(),

                Tables\Columns\TextColumn::make('sku')
                    ->label('SKU')
                    ->color('gray')
                    ->limit(12)
                    ->tooltip(fn (Product $record): string => $record->sku)
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('total_sold')
                    ->label('Terjual (Pcs)')
                    ->alignCenter()
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('stock')
                    ->label('Sisa Stok')
                    ->alignCenter()
                    ->badge()
                    ->weight('bold')
                    ->color(fn (string $state): string => $state <= 5 ? 'danger' : 'success'),
            ])
            ->paginated(false); // Matikan pagination biar ringkas
    }
}
