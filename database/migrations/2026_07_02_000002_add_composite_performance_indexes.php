<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'idx_txn_status_created');
            $table->index(['user_id', 'status'], 'idx_txn_user_status');
        });

        Schema::table('cashier_sessions', function (Blueprint $table) {
            $table->index(['user_id', 'closed_at'], 'idx_session_user_closed');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index(['transaction_id', 'product_id'], 'idx_ti_txn_product');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_txn_status_created');
            $table->dropIndex('idx_txn_user_status');
        });

        Schema::table('cashier_sessions', function (Blueprint $table) {
            $table->dropIndex('idx_session_user_closed');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex('idx_ti_txn_product');
        });
    }
};
