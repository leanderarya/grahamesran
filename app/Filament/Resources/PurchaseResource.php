<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PurchaseResource\Pages;
use App\Filament\Resources\PurchaseResource\RelationManagers;
use App\Models\Purchase;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PurchaseResource extends Resource
{
    protected static ?string $model = Purchase::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\DatePicker::make('date')
                    ->label('Tanggal Belanja')
                    ->required()
                    ->default(now()),
                
                \Filament\Forms\Components\TextInput::make('supplier_name')
                    ->label('Supplier / Toko')
                    ->placeholder('Contoh: Toko Bintang Mas'),

                \Filament\Forms\Components\Select::make('product_id')
                    ->relationship('product', 'name')
                    ->label('Produk')
                    ->searchable()
                    ->required(),

                \Filament\Forms\Components\TextInput::make('quantity')
                    ->label('Jumlah (Qty)')
                    ->numeric()
                    ->required()
                    ->reactive() // Biar bisa hitung otomatis
                    ->afterStateUpdated(fn ($state, callable $set, $get) => 
                        $set('total_spend', $state * $get('buy_price_per_unit'))
                    ),

                \Filament\Forms\Components\TextInput::make('buy_price_per_unit')
                    ->label('Harga Beli Satuan')
                    ->numeric()
                    ->required()
                    ->reactive()
                    ->afterStateUpdated(fn ($state, callable $set, $get) => 
                        $set('total_spend', $state * $get('quantity'))
                    ),

                \Filament\Forms\Components\TextInput::make('total_spend')
                    ->label('Total Modal Keluar')
                    ->numeric()
                    ->readOnly() // Jangan diedit manual
                    ->prefix('Rp'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('date')->date(),
                \Filament\Tables\Columns\TextColumn::make('product.name')->label('Barang'),
                \Filament\Tables\Columns\TextColumn::make('quantity')->label('Qty'),
                \Filament\Tables\Columns\TextColumn::make('total_spend')
                    ->label('Modal Keluar')
                    ->money('IDR')
                    ->summarize(\Filament\Tables\Columns\Summarizers\Sum::make()->label('Total')),
            ])
            ->defaultSort('date', 'desc');
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
            'index' => Pages\ListPurchases::route('/'),
            'create' => Pages\CreatePurchase::route('/create'),
            'edit' => Pages\EditPurchase::route('/{record}/edit'),
        ];
    }
}
