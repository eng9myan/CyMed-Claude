<?php

namespace Modules\DataWarehouse\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FinancialFact extends Model
{
    use HasUuids;

    protected $table = 'financial_facts';

    protected $fillable = [
        'facility_id', 'period_year', 'period_month',
        'revenue_type', 'amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
