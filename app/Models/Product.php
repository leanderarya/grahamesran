<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $guarded = [];

    protected $casts = [
        'stock' => 'integer',
        'volume_liter' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'workshop_price' => 'decimal:2', // <--- TAMBAHKAN INI
    ];

    // ... sisa kode biarkan sama ...
    public function vehicles(): BelongsToMany
    {
        return $this->belongsToMany(Vehicle::class);
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function getDisplayNameAttribute(): string
    {
        if (! $this->volume_liter) {
            return $this->name;
        }

        $volume = rtrim(rtrim(number_format((float) $this->volume_liter, 2, '.', ''), '0'), '.');

        return "{$this->name} ({$volume}L)";
    }

    protected static function booted(): void
    {
        static::created(function (Product $product) {
            if ($product->stock > 0 && $product->cost_price > 0) {
                Purchase::withoutEvents(function () use ($product) {
                    Purchase::create([
                        'product_id' => $product->id,
                        'date' => now(),
                        'supplier_name' => 'Stok Awal (Opname)',
                        'quantity' => $product->stock,
                        'buy_price_per_unit' => $product->cost_price,
                        'total_spend' => $product->stock * $product->cost_price,
                        'notes' => 'Otomatis tercatat saat input produk baru.',
                    ]);
                });
            }
        });
    }
}
