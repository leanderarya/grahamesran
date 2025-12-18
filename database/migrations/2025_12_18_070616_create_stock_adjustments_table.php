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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained(); // Siapa yang audit?
            $table->date('adjustment_date')->default(now());
            
            $table->integer('system_stock');   // Stok di komputer sebelum dihitung
            $table->integer('physical_stock'); // Stok asli di rak
            $table->integer('difference');     // Selisih (Minus = Hilang/Rug)
            
            $table->enum('type', ['correction', 'damage', 'loss', 'bonus'])
                ->default('correction')
                ->comment('correction: salah input, damage: rusak, loss: hilang, bonus: dapat lebih');
                
            $table->text('note')->nullable(); // Alasan kenapa beda
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
