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
        // Pindahkan logic CREATE ke dalam sini!
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique(); // Barcode/Kode Part
            $table->string('name');
            $table->integer('stock')->default(0);
            $table->decimal('cost_price', 15, 2)->default(0); // INI MOVING AVERAGE (HPP)
            $table->decimal('sell_price', 15, 2)->default(0); // Harga Jual ke User
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Logic untuk menghapus tabel saat rollback
        Schema::dropIfExists('products');
    }
};