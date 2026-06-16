<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'date_expense',
        'name',
        'category',
        'amount',
        'notes',
    ];

    protected $casts = [
        'date_expense' => 'date',
        'amount' => 'decimal:2',
    ];
}