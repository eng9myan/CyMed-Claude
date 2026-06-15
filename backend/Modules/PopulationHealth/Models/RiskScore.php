<?php

namespace Modules\PopulationHealth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RiskScore extends Model
{
    use HasUuids;

    protected $table = 'risk_scores';

    protected $fillable = [
        'facility_id', 'patient_id', 'risk_model',
        'score', 'risk_level', 'scored_at',
    ];

    protected function casts(): array
    {
        return [
            'score'     => 'decimal:2',
            'scored_at' => 'datetime',
        ];
    }
}
