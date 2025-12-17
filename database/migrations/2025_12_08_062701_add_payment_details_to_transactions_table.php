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
        Schema::table('transactions', function (Blueprint $table) {
            // Simpan info pembayaran setelah kolom total_profit
            $table->string('payment_method')->default('cash')->after('total_profit'); 
            $table->decimal('amount_paid', 15, 2)->default(0)->after('payment_method'); // Uang Diterima
            $table->decimal('change_amount', 15, 2)->default(0)->after('amount_paid'); // Kembalian
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'amount_paid', 'change_amount']);
        });
    }
};
