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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // Kapan belanja?
            $table->string('supplier_name')->nullable(); // Beli di mana?
            $table->foreignId('product_id')->constrained(); // Beli apa?
            $table->integer('quantity'); // Berapa banyak?
            $table->decimal('buy_price_per_unit', 15, 2); // Harga satuan saat beli
            $table->decimal('total_spend', 15, 2); // Total uang keluar (qty * harga)
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
