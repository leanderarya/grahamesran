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
        if (Schema::hasTable('import_histories')) {
            Schema::table('import_histories', function (Blueprint $table) {
                $table->foreign('monthly_report_id')
                    ->references('id')
                    ->on('monthly_reports')
                    ->nullOnDelete();
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });

            return;
        }

        Schema::create('import_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_report_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->date('import_month');
            $table->string('original_file_name');
            $table->string('stored_file_path')->nullable();
            $table->string('status')->default('success');
            $table->unsignedInteger('imported_days')->default(0);
            $table->unsignedInteger('skipped_days')->default(0);
            $table->unsignedInteger('created_transactions')->default(0);
            $table->unsignedInteger('updated_transactions')->default(0);
            $table->unsignedInteger('created_products')->default(0);
            $table->unsignedInteger('imported_items')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_histories');
    }
};
