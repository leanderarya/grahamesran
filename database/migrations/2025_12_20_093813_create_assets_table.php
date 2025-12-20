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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // Nama Aset (Misal: Etalase Kaca Depan)
            $table->date('purchase_date');       // Tanggal Beli
            $table->decimal('price', 15, 2);     // Harga Beli (Nilai Aset)
            $table->enum('condition', ['good', 'repair', 'broken', 'lost'])->default('good'); // Kondisi
            $table->text('location')->nullable();// Lokasi (Gudang/Depan/Kasir)
            $table->text('note')->nullable();    // Keterangan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
