<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashier_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_cash', 15, 2)->default(0);
            $table->timestamp('opened_at');
            $table->decimal('cash_sales_total', 15, 2)->default(0);
            $table->decimal('non_cash_sales_total', 15, 2)->default(0);
            $table->unsignedInteger('transactions_count')->default(0);
            $table->decimal('closing_cash_physical', 15, 2)->nullable();
            $table->decimal('expected_cash', 15, 2)->nullable();
            $table->decimal('cash_difference', 15, 2)->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('opening_notes')->nullable();
            $table->text('closing_notes')->nullable();
            $table->timestamps();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('cashier_session_id')
                ->nullable()
                ->after('user_id')
                ->constrained('cashier_sessions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cashier_session_id');
        });

        Schema::dropIfExists('cashier_sessions');
    }
};
