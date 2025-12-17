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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date_expense'); // Tanggal pengeluaran
            $table->string('name'); // Nama pengeluaran (misal: Token Listrik Des)
            $table->string('category'); // Kategori (Gaji, Listrik, Sewa, Perlengkapan, Lainnya)
            $table->decimal('amount', 15, 2); // Jumlah uang
            $table->text('notes')->nullable();
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
