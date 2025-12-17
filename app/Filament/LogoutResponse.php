<?php

namespace App\Filament;

use Filament\Http\Responses\Auth\Contracts\LogoutResponse as LogoutResponseContract;
use Illuminate\Http\RedirectResponse;

class LogoutResponse implements LogoutResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        // Paksa Filament untuk kembali ke halaman login utama (Kasir)
        return redirect('/login');
    }
}