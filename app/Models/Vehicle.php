<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vehicle extends Model
{
    protected $guarded = [];

    /**
     * Relasi: Satu tipe Mobil punya BANYAK sparepart yang kompatibel.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }
    
    // Helper function biar gampang memanggil nama lengkap mobil
    // Contoh output: "Toyota Avanza (2012-2015)"
    public function getFullNameAttribute()
    {
        return "{$this->brand} {$this->model} ({$this->year_generation})";
    }
}