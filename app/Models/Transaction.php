<?php

namespace App\Models;

use App\Services\MonthlyReportService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class Transaction extends Model
{
    // Opsi 'Malas tapi Aman' untuk MVP: Izinkan semua kolom diisi
    protected $guarded = [];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saved(function (Transaction $transaction): void {
            $transaction->syncMonthlyReports();
        });

        static::deleted(function (Transaction $transaction): void {
            $transaction->syncMonthlyReports();
        });
    }

    // Relasi: Nota ini dibuat oleh User siapa?
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cashierSession(): BelongsTo
    {
        return $this->belongsTo(CashierSession::class);
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // Relasi: Nota ini berisi item apa saja?
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function reportMonth(): Carbon
    {
        return Carbon::parse($this->created_at)->startOfMonth();
    }

    public function isInFinalizedMonth(): bool
    {
        if (! Schema::hasTable('monthly_reports')) {
            return false;
        }

        return app(MonthlyReportService::class)->isFinalized($this->reportMonth());
    }

    private function syncMonthlyReports(): void
    {
        if (! Schema::hasTable('monthly_reports')) {
            return;
        }

        $service = app(MonthlyReportService::class);
        $currentCreatedAt = $this->created_at ?? now();

        $service->syncMonth(Carbon::parse($currentCreatedAt));

        $originalCreatedAt = $this->getOriginal('created_at');

        if ($originalCreatedAt !== null) {
            $service->syncMonth(Carbon::parse($originalCreatedAt));
        }
    }
}
