<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MonthlyReport extends Model
{
    protected $guarded = [];

    protected $casts = [
        'month_date' => 'date',
        'finalized_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'total_profit' => 'decimal:2',
    ];

    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    public function importHistories(): HasMany
    {
        return $this->hasMany(ImportHistory::class);
    }

    public function latestImportHistory(): HasOne
    {
        return $this->hasOne(ImportHistory::class)->latestOfMany();
    }

    public function isFinalized(): bool
    {
        return $this->finalized_at !== null;
    }

    public function getMonthKey(): string
    {
        return $this->month_date->format('Y-m');
    }

    public function getMonthLabel(): string
    {
        return ucfirst($this->month_date->locale('id')->translatedFormat('F Y'));
    }

    public function getLatestValidationSummary(): string
    {
        $history = $this->latestImportHistory;

        if (! $history) {
            return 'Belum ada impor untuk bulan ini.';
        }

        $delta = $this->transaction_count - (int) $history->matched_days;
        $deltaLabel = $delta === 0 ? 'pas' : ($delta > 0 ? '+'.$delta : (string) $delta);

        return "Cocok {$history->matched_days} hari, beda bulan {$history->out_of_month_days} hari, ".
            "transaksi bulan ini {$this->transaction_count}, selisih {$deltaLabel}.";
    }
}
