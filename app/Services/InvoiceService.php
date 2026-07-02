<?php

namespace App\Services;

use Illuminate\Support\Str;

class InvoiceService
{
    /**
     * Generate a unique invoice number for POS transactions.
     * Format: INV-YYYYMMDD-<random>
     * Uses random hex which makes collision astronomically unlikely.
     */
    public function generate(): string
    {
        return 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(8));
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
