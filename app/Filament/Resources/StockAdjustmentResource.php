<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StockAdjustmentResource\Pages;
use App\Models\StockAdjustment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class StockAdjustmentResource extends Resource
{
    protected static ?string $model = StockAdjustment::class;
    
    // Icon Timbangan / Clipboard
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check'; 
    protected static ?string $navigationLabel = 'Stock Opname';
    protected static ?string $navigationGroup = 'Gudang';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Input Audit Stok')
                    ->schema([
                        // 1. Pilih Produk
                        Forms\Components\Select::make('product_id')
                            ->relationship('product', 'name')
                            ->label('Produk')
                            ->searchable()
                            ->required()
                            ->reactive() // Agar bisa memicu load stok lama
                            ->afterStateUpdated(function ($state, callable $set) {
                                // Ambil stok saat ini dari database
                                $product = \App\Models\Product::find($state);
                                if ($product) {
                                    $set('system_stock', $product->stock);
                                    // Reset inputan lain
                                    $set('physical_stock', null);
                                    $set('difference', null);
                                }
                            }),

                        // 2. Stok Sistem (Read Only)
                        Forms\Components\TextInput::make('system_stock')
                            ->label('Stok di Komputer')
                            ->numeric()
                            ->disabled() // Tidak boleh diedit, ini fakta sistem
                            ->dehydrated() // Tetap dikirim ke DB
                            ->required(),

                        // 3. Stok Fisik (Inputan User)
                        Forms\Components\TextInput::make('physical_stock')
                            ->label('Stok Fisik (Asli)')
                            ->numeric()
                            ->required()
                            ->reactive() // Trigger hitung selisih
                            ->afterStateUpdated(function ($state, callable $get, callable $set) {
                                $system = (int) $get('system_stock');
                                $physical = (int) $state;
                                $set('difference', $physical - $system);
                            }),

                        // 4. Selisih (Otomatis)
                        Forms\Components\TextInput::make('difference')
                            ->label('Selisih')
                            ->numeric()
                            ->disabled()
                            ->dehydrated() // Tetap kirim ke DB meski disabled
                            ->prefix(fn ($state) => $state > 0 ? '+' : '')
                            // --- BAGIAN INI YANG DIPERBAIKI ---
                            // Kita pakai CSS Class manual karena TextInput tidak support ->colors()
                            ->extraInputAttributes(fn ($get) => [
                                'class' => match (true) {
                                    $get('difference') < 0 => 'text-red-600 font-bold',   // Merah jika minus
                                    $get('difference') > 0 => 'text-green-600 font-bold', // Hijau jika surplus
                                    default => '',
                                },
                            ]),

                        // 5. Keterangan
                        Forms\Components\Select::make('type')
                            ->label('Jenis Penyesuaian')
                            ->options([
                                'correction' => 'Koreksi Hitungan (Salah Input)',
                                'damage' => 'Barang Rusak/Expired',
                                'loss' => 'Barang Hilang (Maling/Tikus)',
                                'bonus' => 'Bonus Supplier/Ketemu',
                            ])
                            ->default('correction')
                            ->required(),
                            
                        Forms\Components\Textarea::make('note')
                            ->label('Catatan')
                            ->placeholder('Contoh: Ditemukan pecah di gudang belakang')
                            ->columnSpanFull(),
                            
                        // Hidden field user_id (Otomatis isi user login)
                        Forms\Components\Hidden::make('user_id')
                            ->default(fn () => auth()->id()),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('adjustment_date')->date()->label('Tanggal')->sortable(),
                Tables\Columns\TextColumn::make('product.name')->label('Produk')->searchable()->weight('bold'),
                
                Tables\Columns\TextColumn::make('system_stock')->label('Sistem')->alignCenter()->color('gray'),
                Tables\Columns\TextColumn::make('physical_stock')->label('Fisik')->alignCenter()->weight('bold'),
                
                Tables\Columns\TextColumn::make('difference')
                    ->label('Selisih')
                    ->alignCenter()
                    ->badge()
                    ->color(fn (string $state): string => match (true) {
                        $state < 0 => 'danger',
                        $state > 0 => 'success',
                        default => 'gray',
                    }),
                    
                Tables\Columns\TextColumn::make('type')
                    ->label('Alasan')
                    ->badge()
                    ->colors([
                        'warning' => 'damage',
                        'danger' => 'loss',
                        'info' => 'correction',
                    ]),

                Tables\Columns\TextColumn::make('user.name')->label('Auditor')->toggleable(),
            ])
            ->defaultSort('created_at', 'desc');
    }
    
    // Matikan fitur Edit. Audit itu jejak sejarah, tidak boleh diedit setelah disimpan!
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStockAdjustments::route('/'),
            'create' => Pages\CreateStockAdjustment::route('/create'),
            // 'edit' => Pages\EditStockAdjustment::route('/{record}/edit'), // HAPUS INI
        ];
    }
}