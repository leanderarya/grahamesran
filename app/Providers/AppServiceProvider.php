<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// Import Interface Filament & Class buatan kita
use Filament\Http\Responses\Auth\Contracts\LogoutResponse as FilamentLogoutResponse;
use App\Filament\LogoutResponse as MyFilamentLogoutResponse;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        $this->app->bind(FilamentLogoutResponse::class, MyFilamentLogoutResponse::class);
    }
}
