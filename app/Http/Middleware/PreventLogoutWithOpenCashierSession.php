<?php

namespace App\Http\Middleware;

use Closure;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventLogoutWithOpenCashierSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasOpenCashierSession()) {
            return $next($request);
        }

        $message = 'Kasir masih terbuka. Selesaikan settlement / tutup kasir terlebih dahulu sebelum logout.';

        if ($request->routeIs('filament.admin.auth.logout')) {
            Notification::make()
                ->danger()
                ->title('Logout diblokir')
                ->body($message)
                ->persistent()
                ->send();

            return redirect()->route('filament.admin.pages.dashboard');
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
            ], 423);
        }

        return redirect()
            ->route('transactions.create')
            ->with('error', $message);
    }
}
