<?php

namespace Database\Seeders;

// Jangan lupa import class Seeder yang baru dibuat
use Database\Seeders\AdminSeeder;
use Database\Seeders\VehicleSeeder; 
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Masukkan daftar seeder di dalam array ini
        $this->call([
            AdminSeeder::class,
            VehicleSeeder::class,
        ]);
    }
}