<?php

namespace Modules\Physiotherapy\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PhysioSession extends Model
{
    use HasUuids;

    protected $table = 'physio_sessions';

    protected $fillable = [
        'patient_id',
        'assessment_id',
        'therapist_id',
        'session_date',
        'session_number',
        'duration_minutes',
        'interventions',
        'pain_score_pre',
        'pain_score_post',
        'patient_response',
        'home_exercise_given',
        'notes',
    ];

    protected $casts = [
        'session_date' => 'date',
        'interventions' => 'array',
        'home_exercise_given' => 'boolean',
        'pain_score_pre' => 'integer',
        'pain_score_post' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapist_id');
    }

    public function assessment()
    {
        return $this->belongsTo(PhysioAssessment::class);
    }
}
