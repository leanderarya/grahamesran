<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use pxlrbt\FilamentExcel\Actions\Tables\ExportBulkAction; // <-- PENTING: Class Export

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    // Ganti icon jadi 'uang' biar lebih relevan, atau biarkan stack
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationLabel = 'Laporan Transaksi';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // --- SECTION 1: INFORMASI UTAMA ---
                \Filament\Forms\Components\Section::make('Informasi Transaksi')
                    ->columns(2)
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('invoice_number')
                            ->label('No. Invoice')
                            ->default('INV-' . random_int(100000, 999999)), // Dummy default

                        \Filament\Forms\Components\TextInput::make('created_at')
                            ->label('Waktu Transaksi')
                            ->formatStateUsing(fn ($state) => $state ? \Carbon\Carbon::parse($state)->format('d M Y, H:i') : now()->format('d M Y, H:i')),

                        \Filament\Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->label('Kasir'),

                        \Filament\Forms\Components\TextInput::make('payment_method')
                            ->label('Metode Bayar')
                            ->formatStateUsing(fn (string $state): string => strtoupper($state)),
                    ])
                    ->disabled(), // KUNCI MATI (Read Only)

                // --- SECTION 2: DAFTAR BARANG (ITEMS) ---
                \Filament\Forms\Components\Section::make('Detail Barang Belanjaan')
                    ->schema([
                        \Filament\Forms\Components\Repeater::make('transactionItems')
                            ->relationship()
                            ->schema([
                                // 1. NAMA PRODUK
                                // Kita pakai 'product_id' sebagai dasar, tapi tampilannya kita ubah jadi Nama
                                \Filament\Forms\Components\TextInput::make('product_id') 
                                    ->label('Nama Produk')
                                    ->formatStateUsing(fn ($state, $record) => $record?->product?->name ?? 'Produk Dihapus')
                                    ->disabled() // Pastikan disabled agar tidak jadi dropdown
                                    ->dehydrated(false), // Jangan kirim balik ke DB

                                // 2. QUANTITY (Sesuai DB)
                                \Filament\Forms\Components\TextInput::make('quantity')
                                    ->label('Qty')
                                    ->numeric(),

                                // 3. HARGA SATUAN (Sesuaikan dengan kolom DB: price_at_time)
                                \Filament\Forms\Components\TextInput::make('price_at_time')
                                    ->label('Harga Satuan')
                                    ->prefix('Rp')
                                    ->numeric()
                                    // Format angka jadi Rupiah (opsional, biar cantik)
                                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.')),

                                // 4. SUBTOTAL (Hitungan Manual)
                                // Karena kolom total tidak ada di DB, kita hitung on-the-fly
                                \Filament\Forms\Components\TextInput::make('total_calculated') 
                                    ->label('Subtotal')
                                    ->prefix('Rp')
                                    ->formatStateUsing(function ($record) {
                                        // Rumus: Qty * Harga Saat Itu
                                        $total = ($record->quantity ?? 0) * ($record->price_at_time ?? 0);
                                        return number_format($total, 0, ',', '.');
                                    })
                                    ->dehydrated(false), // Jangan simpan ke DB karena kolom ini fiktif
                            ])
                            ->columns(4)
                            ->addable(false)
                            ->deletable(false)
                            ->reorderable(false)
                            ->disabled(),
                    ]),

                // --- SECTION 3: RINGKASAN UANG ---
                \Filament\Forms\Components\Section::make('Ringkasan Keuangan')
                    ->columns(3)
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('amount_paid')
                            ->label('Uang Diterima')
                            ->prefix('Rp')
                            ->numeric(),

                        \Filament\Forms\Components\TextInput::make('total_amount')
                            ->label('Total Belanja')
                            ->prefix('Rp')
                            ->numeric()
                            ->extraInputAttributes(['class' => 'text-xl font-bold']),

                        \Filament\Forms\Components\TextInput::make('change_amount')
                            ->label('Kembalian')
                            ->prefix('Rp')
                            ->numeric()
                            ->extraInputAttributes(['class' => 'text-green-600 font-bold']),
                    ])
                    ->disabled(), // KUNCI MATI
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

                // 4. METODE BAYAR
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

                // 5. TOTAL OMSET
                TextColumn::make('total_amount')
                    ->label('Total Omset')
                    ->money('IDR')
                    ->sortable()
                    ->alignRight()
                    // Summarize: Menjumlahkan apa yang tampil di layar (setelah filter)
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
            
            // --- BAGIAN BARU: FILTERS ---
            ->filters([
                // A. Filter Rentang Tanggal (Wajib buat Laporan Bulanan)
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from')->label('Dari Tanggal'),
                        DatePicker::make('created_until')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date) => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date) => $query->whereDate('created_at', '<=', $date),
                            );
                    }),

                // B. Filter Metode Bayar (Buat Cek Uang Cash vs Transfer)
                SelectFilter::make('payment_method')
                    ->label('Metode Bayar')
                    ->options([
                        'cash' => 'Tunai',
                        'qris' => 'QRIS',
                        'bank' => 'Transfer Bank',
                    ]),
            ])
            
            // --- BAGIAN BARU: ACTIONS ---
            ->actions([
                // Kita ganti Edit menjadi View, agar Admin bisa lihat detail barang
                // tanpa merusak data harga/profit yg sudah terkunci.
                Tables\Actions\ViewAction::make(),
            ])
            
            // --- BAGIAN BARU: EXPORT EXCEL ---
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    // Fitur Export (Centang semua -> Export)
                    ExportBulkAction::make()->label('Download Excel'),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // Nanti kita isi ini agar saat klik "View", 
            // muncul daftar barang apa saja yang dibeli.
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransactions::route('/'),
            // Create kita hilangkan karena transaksi hanya boleh dari POS Kasir (React)
            // 'create' => Pages\CreateTransaction::route('/create'),
            'edit' => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }
}