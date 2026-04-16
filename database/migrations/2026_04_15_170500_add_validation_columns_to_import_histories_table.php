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
        Schema::table('import_histories', function (Blueprint $table) {
            $table->unsignedInteger('matched_days')->default(0)->after('imported_items');
            $table->unsignedInteger('out_of_month_days')->default(0)->after('matched_days');
            $table->date('first_transaction_date')->nullable()->after('out_of_month_days');
            $table->date('last_transaction_date')->nullable()->after('first_transaction_date');
            $table->json('detected_months')->nullable()->after('last_transaction_date');
            $table->string('validation_status')->default('unchecked')->after('detected_months');
            $table->text('validation_notes')->nullable()->after('validation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('import_histories', function (Blueprint $table) {
            $table->dropColumn([
                'matched_days',
                'out_of_month_days',
                'first_transaction_date',
                'last_transaction_date',
                'detected_months',
                'validation_status',
                'validation_notes',
            ]);
        });
    }
};
