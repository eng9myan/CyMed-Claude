<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GrantExpenditure extends Model
{
    use HasUuids;

    protected $table = 'grant_expenditures';

    protected $fillable = [
        'research_grant_id', 'expenditure_date', 'category',
        'description', 'amount', 'currency', 'recorded_by',
    ];

    protected $casts = [
        'expenditure_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function grant()
    {
        return $this->belongsTo(ResearchGrant::class, 'research_grant_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
