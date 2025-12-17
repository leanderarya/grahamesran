<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Harga khusus bengkel (bisa nullable jika tidak semua barang punya harga bengkel)
            $table->decimal('workshop_price', 15, 2)->nullable()->after('sell_price');
        });

        Schema::table('transactions', function (Blueprint $table) {
            // Menyimpan jenis customer saat transaksi terjadi (UMUM / BENGKEL)
            $table->string('customer_type')->default('general')->after('total_amount'); 
            // Pastikan kolom payment_method sudah ada
            // $table->string('payment_method')->default('cash'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
