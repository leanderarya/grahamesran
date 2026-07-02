<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\PinLoginController;
use Illuminate\Support\Facades\Auth;

// --- LOGIN KASIR (PIN) ---
Route::get('/pin-login', [PinLoginController::class, 'show'])->name('pin.login');
Route::post('/pin-login', [PinLoginController::class, 'store'])->name('pin.login.store')->middleware('throttle:5,1');

// --- ROUTE UTAMA (ROOT) ---
Route::get('/', function () {
    if (!auth()->check()) {
        // Kasir ke PIN login, admin ke login biasa
        return redirect()->route('pin.login');
    }

    $user = auth()->user();

    if ($user->role === 'admin') {
        return redirect('/admin');
    }

    return redirect()->route('transactions.create');
});

Route::post('/logout', function () {
    $user = auth()->user();
    Auth::guard('web')->logout();

    request()->session()->invalidate();
    request()->session()->regenerateToken();

    // Admin balik ke login biasa, kasir ke PIN login
    if ($user && $user->role === 'admin') {
        return redirect('/login');
    }

    return redirect()->route('pin.login');
})->middleware(['auth', 'prevent-open-cashier-logout'])->name('logout');

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
    Route::get('/pos/recap', [TransactionController::class, 'recap'])->name('transactions.recap');
    Route::get('/pos/transaction/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/pos', [TransactionController::class, 'store'])->name('transactions.store')->middleware('throttle:30,1');
    Route::post('/pos/session/open', [TransactionController::class, 'openSession'])->name('transactions.session.open');
    Route::post('/pos/session/close', [TransactionController::class, 'closeSession'])->name('transactions.session.close');
    Route::get('/pos/checkout/{transaction?}', [TransactionController::class, 'checkout'])->name('transactions.checkout');
    Route::post('/pos/draft', [TransactionController::class, 'saveDraft'])->name('transactions.draft.save');
    Route::put('/pos/draft/auto-save', [TransactionController::class, 'autoSaveDraft'])->name('transactions.draft.autoSave');
    Route::post('/pos/draft/clear', [TransactionController::class, 'clearDraft'])->name('transactions.draft.clear');
    Route::delete('/pos/draft/{transaction}', [TransactionController::class, 'destroyDraft'])->name('transactions.draft.destroy');
});

require __DIR__.'/settings.php';
