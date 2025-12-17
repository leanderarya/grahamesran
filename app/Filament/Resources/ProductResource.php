<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Model;
use Filament\Forms\Components\View;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube'; // Ikon Kotak
    protected static ?string $navigationGroup = 'Master Data';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Data Barang')
                    ->schema([
                        View::make('filament.components.sku-scanner')
                            ->columnSpanFull(), // Biar tombolnya lebar

                        // --- 2. INPUT SKU (Tetap Ada) ---
                        // Ini yang akan terisi otomatis saat scan berhasil
                        TextInput::make('sku')
                            ->label('Kode Part (SKU)')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->placeholder('Scan atau ketik manual...'),

                        // Nama Produk
                        TextInput::make('name')
                            ->label('Nama Sparepart')
                            ->placeholder('Contoh: Oli Fastron Techno 10W-30 (1L)')
                            ->required()
                            ->columnSpanFull(),

                        // Keuangan & Stok
                        TextInput::make('stock')
                            ->label('Stok Saat Ini')
                            ->numeric()
                            ->required(),

                        TextInput::make('cost_price')
                            ->label('HPP (Modal Rata-rata)')
                            ->numeric()
                            ->prefix('Rp')
                            // UBAH BARIS INI:
                            // Hanya Read Only kalau lagi mode 'edit'. Kalau 'create', boleh diisi.
                            ->readOnly(fn (string $context): bool => $context === 'edit') 
                            
                            // Wajib diisi saat bikin baru, biar HPP nggak nol
                            ->required(fn (string $context): bool => $context === 'create') 
                            
                            ->helperText(fn (string $context) => $context === 'create' 
                                ? 'Masukkan modal awal untuk stok ini.' 
                                : 'HPP terkunci. Input via menu Pembelian untuk update harga (Moving Average).'
                            ),

                        TextInput::make('sell_price')
                            ->label('Harga Jual')
                            ->numeric()
                            ->prefix('Rp')
                            ->required(),

                        TextInput::make('workshop_price')
                            ->label('Harga Bengkel (Opsional)')
                            ->numeric()
                            ->prefix('Rp')
                            ->helperText('Harga khusus pelanggan bengkel. Jika kosong, harga umum akan digunakan.'),
                    ])->columns(2),

                // --- FITUR JODOHKAN MOBIL ---
                Section::make('Kompatibilitas Kendaraan')
                    ->description('Sparepart ini bisa dipakai di mobil/motor apa saja?')
                    ->schema([
                        Select::make('vehicles')
                            ->relationship('vehicles', 'model') // Ambil data dari tabel vehicles
                            ->label('Pilih Kendaraan')
                            ->multiple() // Bisa pilih banyak
                            ->preload()
                            // 1. MODIFIKASI TAMPILAN LABEL (Merk + Model + Tahun)
                            ->getOptionLabelFromRecordUsing(fn (Model $record) => "{$record->brand} {$record->model} ({$record->year_generation})")
                            
                            // 2. MODIFIKASI PENCARIAN (Biar bisa ketik "2015" atau "Gen 2")
                            ->searchable(['brand', 'model', 'year_generation'])
                            
                            ->placeholder('Pilih mobil... (Bisa lebih dari satu)')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // SKU
                TextColumn::make('sku')
                    ->label('SKU')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                // Nama Barang
                TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'),

                // Indikator Stok (Merah kalau sedikit)
                TextColumn::make('stock')
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match (true) {
                        $state <= 5 => 'danger',   // Stok Kritis (Merah)
                        $state <= 10 => 'warning', // Stok Tipis (Kuning)
                        default => 'success',      // Stok Aman (Hijau)
                    }),

                // Harga Jual
                TextColumn::make('sell_price')
                    ->label('Harga Jual')
                    ->money('IDR')
                    ->sortable(),

                TextColumn::make('workshop_price')
                    ->label('Harga Bengkel')
                    ->money('IDR')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                
                // HPP (Hanya Owner yang boleh lihat, tapi di sini kita buka dulu)
                TextColumn::make('cost_price')
                    ->label('HPP')
                    ->money('IDR')
                    ->toggleable(isToggledHiddenByDefault: true), // Default tersembunyi biar aman

                // List Mobil yang Cocok (Ditampilkan sebagai Tag)
                TextColumn::make('vehicles.model')
                    ->label('Cocok Untuk')
                    ->badge()
                    ->separator(',')
                    ->limitList(3),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}