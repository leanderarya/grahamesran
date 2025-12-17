<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExpenseResource\Pages;
use App\Filament\Resources\ExpenseResource\RelationManagers;
use App\Models\Expense;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ExpenseResource extends Resource
{
    protected static ?string $model = Expense::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\DatePicker::make('date_expense')
                    ->label('Tanggal')
                    ->required()
                    ->default(now()),

                \Filament\Forms\Components\TextInput::make('name')
                    ->label('Keterangan Pengeluaran')
                    ->placeholder('Contoh: Bayar Listrik Bulan Ini')
                    ->required(),

                \Filament\Forms\Components\Select::make('category')
                    ->label('Kategori Biaya')
                    ->options([
                        'Gaji' => 'Gaji Karyawan',
                        'Listrik' => 'Listrik & Air',
                        'Sewa' => 'Sewa Tempat',
                        'Perlengkapan' => 'Perlengkapan Toko (Plastik/ATK)',
                        'Lainnya' => 'Lain-lain',
                    ])
                    ->required(),

                \Filament\Forms\Components\TextInput::make('amount')
                    ->label('Jumlah Uang')
                    ->numeric()
                    ->prefix('Rp')
                    ->required(),
                    
                \Filament\Forms\Components\Textarea::make('notes')
                    ->label('Catatan Tambahan')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('date_expense')->date('d M Y')->sortable(),
                \Filament\Tables\Columns\TextColumn::make('name')->searchable(),
                \Filament\Tables\Columns\TextColumn::make('category')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Gaji' => 'warning',
                        'Listrik' => 'info',
                        'Sewa' => 'danger',
                        default => 'gray',
                    }),
                \Filament\Tables\Columns\TextColumn::make('amount')
                    ->money('IDR')
                    ->summarize(\Filament\Tables\Columns\Summarizers\Sum::make()->label('Total')),
            ])
            ->defaultSort('date_expense', 'desc');
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
            'index' => Pages\ListExpenses::route('/'),
            'create' => Pages\CreateExpense::route('/create'),
            'edit' => Pages\EditExpense::route('/{record}/edit'),
        ];
    }
}
