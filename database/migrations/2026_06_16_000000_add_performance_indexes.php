<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->index('created_at');
            $table->index('user_id');
            $table->index('cashier_session_id');
            $table->index('payment_method');
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->index('product_id');
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->index('date');
        });

        Schema::table('expenses', function (Blueprint $table): void {
            $table->index('date_expense');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->index('stock');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table): void {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['cashier_session_id']);
            $table->dropIndex(['payment_method']);
        });

        Schema::table('transaction_items', function (Blueprint $table): void {
            $table->dropIndex(['product_id']);
        });

        Schema::table('purchases', function (Blueprint $table): void {
            $table->dropIndex(['date']);
        });

        Schema::table('expenses', function (Blueprint $table): void {
            $table->dropIndex(['date_expense']);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex(['stock']);
        });
    }
};
