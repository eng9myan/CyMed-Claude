<?php

namespace Modules\DataWarehouse\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EncounterFact extends Model
{
    use HasUuids;

    protected $table = 'encounter_facts';

    protected $fillable = [
        'facility_id', 'patient_id', 'encounter_id', 'encounter_date',
        'encounter_type', 'primary_diagnosis_code', 'los_days', 'total_charges',
    ];

    protected function casts(): array
    {
        return [
            'encounter_date' => 'date',
            'total_charges'  => 'decimal:2',
        ];
    }
}
