<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PatientAllergy extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'allergen_type', 'allergen_name', 'allergen_code',
        'allergen_rxnorm', 'reaction_type', 'severity', 'reaction_description',
        'onset_date', 'status', 'recorded_by', 'verified_by', 'verified_at',
        'fhir_allergy_intolerance',
    ];

    protected function casts(): array
    {
        return [
            'onset_date' => 'date',
            'verified_at' => 'datetime',
            'fhir_allergy_intolerance' => 'array',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
