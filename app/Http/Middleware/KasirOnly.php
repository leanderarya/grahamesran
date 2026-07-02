<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class KasirOnly
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('pin.login');
        }

        // Admin tidak boleh akses halaman kasir
        if ($user->role === 'admin') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Admin cannot access kasir endpoints.'], 403);
            }

            return redirect('/admin');
        }

        return $next($request);
    }
}
