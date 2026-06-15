<?php

namespace Modules\Finance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class CostCenter extends Model
{
    use HasUuids;

    protected $table = 'cost_centers';

    protected $fillable = [
        'facility_id', 'code', 'name', 'type', 'parent_id', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function budgets()
    {
        return $this->hasMany(AnnualBudget::class);
    }
}
