<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Filament\Resources\TransactionResource\RelationManagers;
use App\Models\Transaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\Summarizers\Sum;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // 1. Nomor Invoice
                TextColumn::make('invoice_number')
                    ->label('No. Nota')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('bold'),

                // 2. Siapa Kasirnya?
                TextColumn::make('user.name')
                    ->label('Kasir')
                    ->sortable()
                    ->color('gray'),

                // 3. Waktu Transaksi
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),

                // 4. METODE BAYAR (Yang Baru Ditambahkan)
                TextColumn::make('payment_method')
                    ->label('Metode')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'cash' => 'success',    // Hijau
                        'qris' => 'info',       // Biru
                        'bca' => 'primary',     // Biru Tua
                        'mandiri' => 'warning', // Kuning
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => strtoupper($state))
                    ->sortable(),

                // 5. TOTAL OMSET (Cukup Satu Saja)
                TextColumn::make('total_amount')
                    ->label('Total Omset')
                    ->money('IDR')
                    ->sortable()
                    ->alignRight()
                    ->summarize(Sum::make()->label('Total Pendapatan')), 

                // 6. MARGIN / PROFIT
                TextColumn::make('total_profit')
                    ->label('Margin (Cuan)')
                    ->money('IDR')
                    ->color('success')
                    ->weight('bold')
                    ->alignRight()
                    ->sortable()
                    ->summarize(Sum::make()->label('Total Bersih')), 
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                // Action edit dihapus biar data gak diubah-ubah
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransactions::route('/'),
            'create' => Pages\CreateTransaction::route('/create'),
            'edit' => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }
}
