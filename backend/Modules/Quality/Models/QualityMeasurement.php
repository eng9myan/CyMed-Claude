<?php

namespace Modules\Quality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QualityMeasurement extends Model
{
    use HasUuids;

    protected $table = 'quality_measurements';

    protected $fillable = [
        'indicator_id', 'period', 'numerator', 'denominator',
        'result_value', 'target_value', 'target_met', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'target_met' => 'boolean',
        'numerator' => 'float',
        'denominator' => 'float',
        'result_value' => 'float',
        'target_value' => 'float',
    ];
}
