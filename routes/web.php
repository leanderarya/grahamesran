<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Auth;

// --- ROUTE UTAMA (ROOT) ---
Route::get('/', function () {
    // 1. Cek apakah user sudah login?
    if (!auth()->check()) {
        // Kalau belum, suruh login dulu
        return redirect()->route('login');
    }

    // 2. Kalau sudah login, ambil datanya
    $user = auth()->user();

    // 3. Arahkan sesuai jabatan
    if ($user->role === 'admin') {
        return redirect('/admin'); // Bos ke Kantor
    }

    return redirect()->route('transactions.create'); // Kasir ke Toko
});

Route::post('/logout', function () {
    Auth::guard('web')->logout();

    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect('/login');
})->name('logout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return redirect('/admin'); // Tendang Bos ke Filament
        }

        return redirect()->route('transactions.create'); // Tendang Kasir ke POS
    })->name('dashboard');

    // Rute Kasir
    Route::get('/pos', [TransactionController::class, 'create'])->name('transactions.create');
    Route::post('/pos', [TransactionController::class, 'store'])->name('transactions.store');
});

require __DIR__.'/settings.php';
