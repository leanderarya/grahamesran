<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'digits:4'],
        ]);

        $user = User::where('pin', $request->pin)
            ->where('role', 'kasir')
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'PIN salah.',
            ], 401);
        }

        // Revoke previous tokens for this user (single device)
        $user->tokens()->delete();

        $token = $user->createToken('kasir-android')->plainTextToken;

        // Also create web session so Capacitor can load web pages
        Auth::login($user);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout.',
        ]);
    }
}
