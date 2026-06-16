<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierSession extends Model
{
    protected $fillable = [
        'user_id',
        'opening_cash',
        'opened_at',
        'cash_sales_total',
        'non_cash_sales_total',
        'transactions_count',
        'closing_cash_physical',
        'expected_cash',
        'cash_difference',
        'closed_at',
        'opening_notes',
        'closing_notes',
    ];

    protected $casts = [
        'opening_cash' => 'decimal:2',
        'cash_sales_total' => 'decimal:2',
        'non_cash_sales_total' => 'decimal:2',
        'closing_cash_physical' => 'decimal:2',
        'expected_cash' => 'decimal:2',
        'cash_difference' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getIsOpenAttribute(): bool
    {
        return $this->closed_at === null;
    }
}
