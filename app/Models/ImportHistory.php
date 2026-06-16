<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportHistory extends Model
{
    protected $fillable = [
        'monthly_report_id',
        'user_id',
        'import_month',
        'original_file_name',
        'stored_file_path',
        'status',
        'imported_days',
        'skipped_days',
        'created_transactions',
        'updated_transactions',
        'created_products',
        'imported_items',
        'matched_days',
        'out_of_month_days',
        'first_transaction_date',
        'last_transaction_date',
        'detected_months',
        'validation_status',
        'validation_notes',
        'error_message',
    ];

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
