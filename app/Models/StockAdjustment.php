<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustment extends Model
{
    protected $guarded = ['id'];

    // Relasi
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // --- MAGIC LOGIC ---
    // Saat data audit disimpan, stok produk ikut berubah otomatis
    protected static function booted()
    {
        static::created(function ($adjustment) {
            $product = $adjustment->product;
            
            // Update stok produk menjadi angka fisik terbaru
            $product->update([
                'stock' => $adjustment->physical_stock
            ]);
        });
    }
}