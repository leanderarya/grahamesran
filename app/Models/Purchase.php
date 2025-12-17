<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'buy_price_per_unit' => 'decimal:2',
        'total_spend' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // THE MAGIC: Event Listener saat data dibuat
    protected static function booted()
    {
        static::created(function ($purchase) {
            $product = $purchase->product;
            
            // 1. Hitung Moving Average Baru
            // (Nilai Stok Lama + Nilai Belanja Baru) / (Qty Lama + Qty Baru)
            $oldValue = $product->stock * $product->cost_price;
            $newValue = $purchase->total_spend;
            $totalQty = $product->stock + $purchase->quantity;
            
            $newAvgCost = ($oldValue + $newValue) / $totalQty;

            // 2. Update Produk (Stok Nambah, HPP Berubah)
            $product->update([
                'stock' => $totalQty,
                'cost_price' => $newAvgCost
            ]);
        });
    }
}