<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asset extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'purchase_date' => 'date',
        'price' => 'decimal:2',
    ];

    // --- LOGIC OTOMATIS (SINKRONISASI KE EXPENSE) ---
    protected static function booted()
    {
        // 1. SAAT ASET BARU DIBUAT
        static::created(function ($asset) {
            \App\Models\Expense::create([
                'name' => 'Beli Aset: ' . $asset->name, // Nama pengeluaran
                'amount' => $asset->price,              // Jumlah uang
                'date_expense' => $asset->purchase_date,// Tanggal
                
                // Karena di migrasi tipe datanya STRING, kita bebas isi teks apa saja.
                // Kita isi 'asset' agar nanti mudah difilter di laporan.
                'category' => 'asset', 
                
                // PERHATIKAN: Pakai 'notes' (ada huruf s) sesuai migrasi Anda
                'notes' => 'Auto-generated dari Menu Aset (ID: ' . $asset->id . ')',
            ]);
        });

        // 2. SAAT ASET DIEDIT (Update juga pengeluarannya)
        static::updated(function ($asset) {
            $expense = \App\Models\Expense::where('notes', 'LIKE', '%(ID: ' . $asset->id . ')')->first();
            
            if ($expense) {
                $expense->update([
                    'name' => 'Beli Aset: ' . $asset->name,
                    'amount' => $asset->price,
                    'date_expense' => $asset->purchase_date,
                ]);
            }
        });

        // 3. SAAT ASET DIHAPUS (Hapus juga pengeluarannya/Balikin saldo)
        static::deleted(function ($asset) {
            \App\Models\Expense::where('notes', 'LIKE', '%(ID: ' . $asset->id . ')')->delete();
        });
    }
}