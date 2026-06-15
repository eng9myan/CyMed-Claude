<?php

namespace Modules\Quality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class QualityIndicator extends Model
{
    use HasUuids;

    protected $table = 'quality_indicators';

    protected $fillable = [
        'facility_id', 'indicator_code', 'indicator_name', 'category',
        'measurement_type', 'numerator_desc', 'denominator_desc',
        'target_value', 'reporting_period', 'data_source',
        'is_joint_commission', 'is_active',
    ];

    protected $casts = [
        'is_joint_commission' => 'boolean',
        'is_active' => 'boolean',
        'target_value' => 'float',
    ];
}
