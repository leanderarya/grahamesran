<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            [
                'email' => 'grahamesrankaliceret@gmail.com',
            ],
            [
                'name' => 'Arya Ajisadda',
                'password' => Hash::make('supersecurepassword'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}