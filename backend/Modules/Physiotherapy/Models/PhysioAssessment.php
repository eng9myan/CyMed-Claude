<?php

namespace Modules\Physiotherapy\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PhysioAssessment extends Model
{
    use HasUuids;

    protected $table = 'physio_assessments';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'therapist_id',
        'assessment_date',
        'referral_diagnosis',
        'chief_complaint',
        'pain_score',
        'range_of_motion',
        'muscle_strength',
        'functional_limitations',
        'treatment_goals',
        'discharge_criteria',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'range_of_motion' => 'array',
        'muscle_strength' => 'array',
        'pain_score' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapist_id');
    }
}
