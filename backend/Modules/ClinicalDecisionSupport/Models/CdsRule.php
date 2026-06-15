<?php

namespace Modules\ClinicalDecisionSupport\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CdsRule extends Model
{
    use HasUuids;

    protected $table = 'cds_rules';

    protected $fillable = [
        'facility_id', 'rule_code', 'rule_name', 'category',
        'condition', 'recommendations', 'severity', 'is_active', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'condition'       => 'array',
            'recommendations' => 'array',
            'is_active'       => 'boolean',
        ];
    }

    public function alerts()
    {
        return $this->hasMany(CdsAlert::class, 'rule_id');
    }
}
