<?php

namespace Modules\CareManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class CarePlan extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'care_plans';

    protected $fillable = [
        'encounter_id', 'patient_id', 'plan_title', 'care_type', 'status',
        'goals', 'interventions', 'barriers',
        'created_by', 'approved_by', 'approved_at', 'review_date',
        'patient_education_notes', 'discharge_criteria',
    ];

    protected $casts = [
        'goals' => 'array',
        'interventions' => 'array',
        'barriers' => 'array',
        'approved_at' => 'datetime',
        'review_date' => 'datetime',
    ];

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
