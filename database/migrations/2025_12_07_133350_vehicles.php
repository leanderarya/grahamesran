<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel Kendaraan
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand'); // Toyota, Honda
            $table->string('model'); // Avanza, Beat
            $table->string('year_generation')->nullable(); // 2012-2015, Gen 1
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
