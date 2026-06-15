<?php

namespace Modules\CareManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StructuredCarePlan extends Model
{
    use HasUuids;

    protected $table = 'structured_care_plans';

    protected $fillable = [
        'patient_id', 'facility_id', 'plan_type', 'condition',
        'goals', 'interventions', 'status', 'start_date', 'end_date',
        'review_date', 'created_by',
    ];

    protected $casts = [
        'goals' => 'array',
        'interventions' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'review_date' => 'date',
    ];
}
