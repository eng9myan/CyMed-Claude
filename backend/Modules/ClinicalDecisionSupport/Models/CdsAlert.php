<?php

namespace Modules\ClinicalDecisionSupport\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CdsAlert extends Model
{
    use HasUuids;

    protected $table = 'cds_alerts';

    protected $fillable = [
        'facility_id', 'patient_id', 'rule_id', 'encounter_id',
        'alert_text', 'acknowledged', 'acknowledged_by',
        'acknowledged_at', 'override_reason',
    ];

    protected function casts(): array
    {
        return [
            'acknowledged'    => 'boolean',
            'acknowledged_at' => 'datetime',
        ];
    }

    public function rule()
    {
        return $this->belongsTo(CdsRule::class, 'rule_id');
    }
}
