<?php

namespace Modules\Finance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AnnualBudget extends Model
{
    use HasUuids;

    protected $table = 'annual_budgets';

    protected $fillable = [
        'cost_center_id', 'fiscal_year', 'budget_amount', 'actual_spent',
        'currency', 'notes', 'approved_by', 'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'budget_amount' => 'decimal:2',
            'actual_spent'  => 'decimal:2',
            'approved_at'   => 'datetime',
        ];
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
