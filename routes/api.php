<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DraftController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);

    // Cashier session
    Route::get('/session', [SessionController::class, 'status']);
    Route::post('/session/open', [SessionController::class, 'open']);
    Route::post('/session/close', [SessionController::class, 'close']);

    // Transactions
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/recap', [TransactionController::class, 'recap']);
    Route::get('/history', [TransactionController::class, 'history']);
    Route::post('/transactions/{transaction}/void', [TransactionController::class, 'void']);

    // Drafts
    Route::post('/draft', [DraftController::class, 'save']);
    Route::put('/draft/auto-save', [DraftController::class, 'autoSave']);
    Route::post('/draft/clear', [DraftController::class, 'clear']);
    Route::delete('/draft/{transaction}', [DraftController::class, 'destroy']);
});
