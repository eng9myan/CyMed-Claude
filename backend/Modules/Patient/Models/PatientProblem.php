<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PatientProblem extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'encounter_id', 'icd11_code', 'icd10_code', 'snomed_code',
        'problem_name', 'problem_type', 'clinical_status', 'verification_status',
        'severity', 'onset_date', 'abatement_date', 'notes', 'recorded_by',
        'fhir_condition',
    ];

    protected function casts(): array
    {
        return [
            'onset_date' => 'date',
            'abatement_date' => 'date',
            'fhir_condition' => 'array',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
