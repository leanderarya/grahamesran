<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportHistory extends Model
{
    protected $guarded = [];

    protected $casts = [
        'import_month' => 'date',
        'first_transaction_date' => 'date',
        'last_transaction_date' => 'date',
        'detected_months' => 'array',
    ];

    public function monthlyReport(): BelongsTo
    {
        return $this->belongsTo(MonthlyReport::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getValidationStatusLabel(): string
    {
        return match ($this->validation_status) {
            'match' => 'Cocok',
            'mixed' => 'Campuran',
            'outside' => 'Di luar bulan',
            'empty' => 'Kosong',
            default => 'Belum dicek',
        };
    }

    public function getValidationStatusColor(): string
    {
        return match ($this->validation_status) {
            'match' => 'success',
            'mixed' => 'warning',
            'outside' => 'danger',
            'empty' => 'gray',
            default => 'gray',
        };
    }
}
