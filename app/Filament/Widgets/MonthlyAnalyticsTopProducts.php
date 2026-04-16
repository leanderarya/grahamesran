<?php

namespace App\Filament\Widgets;

use App\Filament\Concerns\ResolvesMonthlyAnalyticsFilter;
use App\Models\TransactionItem;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\Concerns\InteractsWithPageFilters;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Model;

class MonthlyAnalyticsTopProducts extends TableWidget
{
    use InteractsWithPageFilters;
    use ResolvesMonthlyAnalyticsFilter;

    protected int|string|array $columnSpan = 1;

    public function getTableRecordKey(Model $record): string
    {
        return (string) $record->name;
    }

    public function table(Table $table): Table
    {
        [$monthStart, $monthEnd] = [
            $this->getSelectedAnalyticsMonth($this->filters)->copy()->startOfMonth(),
            $this->getSelectedAnalyticsMonth($this->filters)->copy()->endOfMonth(),
        ];

        return $table
            ->query(
                TransactionItem::query()
                    ->select('products.name')
                    ->selectRaw('SUM(transaction_items.quantity) as total_sold')
                    ->selectRaw('SUM(transaction_items.quantity * transaction_items.price_at_time) as total_revenue')
                    ->join('products', 'products.id', '=', 'transaction_items.product_id')
                    ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
                    ->whereBetween('transactions.created_at', [$monthStart, $monthEnd])
                    ->groupBy('products.name')
                    ->orderByDesc('total_sold')
                    ->limit(8)
            )
            ->heading('Top Produk Bulan Terpilih')
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Produk')
                    ->weight('bold')
                    ->searchable(),

                Tables\Columns\TextColumn::make('total_sold')
                    ->label('Terjual')
                    ->badge()
                    ->alignCenter()
                    ->color('success'),

                Tables\Columns\TextColumn::make('total_revenue')
                    ->label('Omset')
                    ->money('IDR')
                    ->alignEnd(),
            ]);
    }
}
