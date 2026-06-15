<?php

namespace Modules\BedManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SurgeCapacityPlan extends Model
{
    use HasUuids;

    protected $table = 'surge_capacity_plans';

    protected $fillable = [
        'facility_id', 'plan_name', 'trigger_condition',
        'additional_beds', 'actions', 'is_active',
        'activated_at', 'deactivated_at',
    ];

    protected $casts = [
        'actions' => 'array',
        'is_active' => 'boolean',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];
}
