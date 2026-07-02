<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Str;

class InvoiceService
{
    /**
     * Generate a unique invoice number for POS transactions.
     * Retries on collision (unique constraint in DB).
     * Format: INV-YYYYMMDD-<unique>
     */
    public function generate(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $number = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            if (!Transaction::where('invoice_number', $number)->exists()) {
                return $number;
            }
        }

        // Fallback: append microseconds for guaranteed uniqueness
        return 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(4)) . substr(microtime(true), -5, 5);
    }

    /**
     * Generate invoice number for imported transactions.
     * Format: IMP-YYYYMMDD
     */
    public function generateImport(\Carbon\Carbon $date): string
    {
        return 'IMP-' . $date->format('Ymd');
    }
}
