<?php

namespace Modules\Emergency\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class TriageAssessment extends Model
{
    use HasUuids;

    protected $fillable = [
        'encounter_id', 'patient_id', 'triaged_by', 'triaged_at',
        'triage_system', 'triage_level', 'triage_category', 'chief_complaint',
        'arrival_mode', 'referred_from',
        'temperature', 'heart_rate', 'respiratory_rate', 'bp_systolic', 'bp_diastolic',
        'oxygen_saturation', 'gcs', 'pain_score', 'weight_kg',
        'trauma_mechanism', 'trauma_type', 'sepsis_suspected', 'stroke_suspected',
        'stemi_suspected', 'pregnancy_status', 'allergies_reviewed', 'medications_reviewed',
        'news2_score', 'news2_risk', 'assessment_notes', 'immediate_action_taken', 'disposition',
    ];

    protected $casts = [
        'triaged_at' => 'datetime',
        'triage_level' => 'integer',
        'temperature' => 'decimal:2',
        'oxygen_saturation' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'heart_rate' => 'integer',
        'respiratory_rate' => 'integer',
        'bp_systolic' => 'integer',
        'bp_diastolic' => 'integer',
        'gcs' => 'integer',
        'pain_score' => 'integer',
        'news2_score' => 'integer',
        'trauma_mechanism' => 'boolean',
        'sepsis_suspected' => 'boolean',
        'stroke_suspected' => 'boolean',
        'stemi_suspected' => 'boolean',
        'pregnancy_status' => 'boolean',
        'allergies_reviewed' => 'boolean',
        'medications_reviewed' => 'boolean',
    ];

    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function triagedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triaged_by');
    }
}
