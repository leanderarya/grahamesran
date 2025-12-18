<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    // Opsi 'Malas tapi Aman' untuk MVP: Izinkan semua kolom diisi
    protected $guarded = [];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'total_profit' => 'decimal:2',
        
        // --- TAMBAHAN PENTING ---
        // Pastikan angka ini keluar sebagai Decimal/Double, bukan String
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    // Relasi: Nota ini dibuat oleh User siapa?
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // Relasi: Nota ini berisi item apa saja?
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}