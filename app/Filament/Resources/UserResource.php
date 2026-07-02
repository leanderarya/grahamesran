<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    // Ganti ikon jadi ikon Orang/Group
    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Pengguna & Pegawai';

    protected static ?string $navigationGroup = 'Pengaturan';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('role')
                    ->label('Jabatan')
                    ->options([
                        'admin' => 'Administrator',
                        'staff' => 'Staff',
                        'kasir' => 'Kasir (Hanya POS)',
                    ])
                    ->required()
                    ->default('kasir')
                    ->live(),

                Forms\Components\TextInput::make('name')
                    ->label('Nama Lengkap')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required(fn (Forms\Get $get): bool => in_array($get('role'), ['admin', 'staff']))
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->visible(fn (Forms\Get $get): bool => in_array($get('role'), ['admin', 'staff'])),

                Forms\Components\TextInput::make('pin')
                    ->label('PIN Login')
                    ->numeric()
                    ->length(4)
                    ->required(fn (Forms\Get $get): bool => $get('role') === 'kasir')
                    ->visible(fn (Forms\Get $get): bool => $get('role') === 'kasir')
                    ->unique(ignoreRecord: true)
                    ->helperText('4 digit angka untuk login kasir'),

                Forms\Components\TextInput::make('password')
                    ->password()
                    ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn (Forms\Get $get, string $context): bool => $context === 'create' && in_array($get('role'), ['admin', 'staff']))
                    ->visible(fn (Forms\Get $get): bool => in_array($get('role'), ['admin', 'staff']))
                    ->label('Password'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->placeholder(fn (User $record): string => $record->role === 'kasir' ? 'PIN: '.$record->pin : '-'),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'admin' => 'danger',
                        'staff' => 'info',
                        'kasir' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'admin' => 'Admin',
                        'staff' => 'Staff',
                        'kasir' => 'Kasir',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(), // Fitur Pecat
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
