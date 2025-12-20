<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssetResource\Pages;
use App\Models\Asset;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AssetResource extends Resource
{
    protected static ?string $model = Asset::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Input Aset Baru')
                    ->description('Pembelian aset di sini otomatis tercatat sebagai Pengeluaran.')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nama Aset')
                            ->placeholder('Contoh: Etalase, AC, Komputer')
                            ->required(),

                        Forms\Components\DatePicker::make('purchase_date')
                            ->label('Tanggal Beli')
                            ->default(now())
                            ->required(),

                        Forms\Components\TextInput::make('price')
                            ->label('Harga Beli')
                            ->prefix('Rp')
                            ->numeric()
                            ->required(),

                        Forms\Components\Select::make('condition')
                            ->label('Kondisi')
                            ->options([
                                'good' => 'Baik',
                                'repair' => 'Butuh Servis',
                                'broken' => 'Rusak',
                            ])
                            ->default('good')
                            ->required(),

                        Forms\Components\TextInput::make('location')
                            ->label('Lokasi')
                            ->placeholder('Gudang / Kasir'),
                            
                        Forms\Components\Textarea::make('note')
                            ->label('Catatan Aset')
                            ->rows(2),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('purchase_date')->date('d M Y')->sortable(),
                Tables\Columns\TextColumn::make('price')->money('IDR')->sortable()
                    ->summarize(\Filament\Tables\Columns\Summarizers\Sum::make()->label('Total Aset')),
                Tables\Columns\TextColumn::make('condition')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'good' => 'success',
                        'repair' => 'warning',
                        'broken' => 'danger',
                    }),
            ])
            ->defaultSort('purchase_date', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAssets::route('/'),
            'create' => Pages\CreateAsset::route('/create'),
            'edit' => Pages\EditAsset::route('/{record}/edit'),
        ];
    }
}