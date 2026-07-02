<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    protected $fillable = [
        'date',
        'supplier_name',
        'product_id',
        'quantity',
        'buy_price_per_unit',
        'total_spend',
        'notes',
    ];

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
            \DB::transaction(function () use ($purchase) {
                $product = \App\Models\Product::lockForUpdate()->find($purchase->product_id);

                if (! $product) {
                    return;
                }

                // 1. Hitung Moving Average Baru
                // (Nilai Stok Lama + Nilai Belanja Baru) / (Qty Lama + Qty Baru)
                $oldValue = $product->stock * $product->cost_price;
                $newValue = $purchase->total_spend;
                $totalQty = $product->stock + $purchase->quantity;

                $newAvgCost = $totalQty > 0 ? ($oldValue + $newValue) / $totalQty : 0;

                // 2. Update Produk (Stok Nambah, HPP Berubah)
                $product->update([
                    'stock' => $totalQty,
                    'cost_price' => $newAvgCost,
                ]);

                \Cache::forget('dashboard_asset_value');
            });
        });
    }
}