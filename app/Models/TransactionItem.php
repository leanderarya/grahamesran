<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $guarded = [];
    
    // Supaya bisa akses tanggal created_at di tabel pivot ini jika perlu
    public $timestamps = true;

    // Item ini milik Nota nomor berapa?
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    // Item ini sebenarnya barang apa?
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}