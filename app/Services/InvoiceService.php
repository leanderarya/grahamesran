<?php

namespace App\Services;

class InvoiceService
{
    /**
     * Generate a unique invoice number for POS transactions.
     * Format: INV-YYYYMMDD-<unique>
     */
    public function generate(): string
    {
        return 'INV-'.date('Ymd').'-'.strtoupper(substr(uniqid(), -6));
    }

    /**
     * Generate invoice number for imported transactions.
     * Format: IMP-YYYYMMDD
     */
    public function generateImport(\Carbon\Carbon $date): string
    {
        return 'IMP-'.$date->format('Ymd');
    }
}
