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
        // 1. Tabel Header Transaksi (Nota)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // INV-20231201-001
            $table->foreignId('user_id')->constrained(); // Siapa Kasirnya? (Penting buat audit)
            $table->decimal('total_amount', 15, 2);
            $table->decimal('total_profit', 15, 2); // Simpan profit per nota di sini biar report kencang!
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
