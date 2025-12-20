<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Filament\Navigation\MenuItem;
use Illuminate\Support\Facades\Blade; // <-- Jangan lupa Import ini
use Illuminate\Support\HtmlString;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            
            // --- 1. BRANDING PROFESIONAL ---
            ->brandName('Graha Mesran') // Ganti tulisan Filament
            ->brandLogo(asset('GrahaMesran-light.png'))
            ->darkModeBrandLogo(asset('GrahaMesran-dark.png'))
            ->brandLogoHeight('4rem')
            // ->brandLogo(asset('images/logo.png')) // (Opsional) Kalau ada logo gambar
            ->favicon(asset('favicon.ico')) // (Opsional) Icon di tab browser
            ->renderHook(
                'panels::head.end',
                fn (): string => Blade::render(<<<HTML
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                    <link rel="manifest" href="/site.webmanifest">
                HTML)
            )
            
            // --- 2. GANTI TEMA WARNA ---
            ->colors([
                // Pakai Blue biar senada dengan POS & Login Page
                'primary' => Color::Blue, 
            ])
            
            // // --- 3. MENU LOGOUT MANUAL ---
            // ->userMenuItems([
            //     MenuItem::make()
            //         ->label('Log Out')
            //         ->url('/logout')
            //         ->icon('heroicon-o-arrow-right-start-on-rectangle'),
            // ])

            // --- 4. CONFIG RESOURCE ---
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            
            // --- 5. BERSIHKAN DASHBOARD ---
            ->widgets([
                // Kita kosongkan array ini.
                // Widgets\AccountWidget::class, (Hapus: Kotak "Welcome User")
                // Widgets\FilamentInfoWidget::class, (Hapus: Kotak Iklan Filament)
            ])
            
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}