<?php

namespace Modules\Psychiatry\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PsychiatricAssessment extends Model
{
    use HasUuids;

    protected $table = 'psychiatric_assessments';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'clinician_id',
        'assessment_date',
        'assessment_type',
        'chief_complaint',
        'presenting_history',
        'mental_status',
        'risk_assessment',
        'diagnosis_primary',
        'diagnosis_secondary',
        'formulation',
        'treatment_plan',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'mental_status' => 'array',
        'risk_assessment' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function clinician()
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }
}
