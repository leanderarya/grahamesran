<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PinLoginController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/PinLogin');
    }

    public function store(Request $request)
    {
        $request->validate([
            'pin' => ['required', 'digits:4'],
        ]);

        // Cari user kasir berdasarkan PIN
        $user = User::where('pin', $request->pin)
            ->where('role', 'kasir')
            ->first();

        if (! $user) {
            return back()->withErrors([
                'pin' => 'PIN salah. Silakan coba lagi.',
            ]);
        }

        Auth::login($user);

        return redirect()->route('transactions.create');
    }
}
