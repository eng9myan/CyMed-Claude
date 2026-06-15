<?php

namespace Modules\Maternity\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class AntenatalVisit extends Model
{
    use HasUuids;

    protected $table = 'antenatal_visits';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'provider_id',
        'visit_date',
        'gestational_age_weeks',
        'gestational_age_days',
        'gravida',
        'para',
        'fundal_height_cm',
        'fetal_heart_rate',
        'fetal_presentation',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'weight_kg',
        'urine_protein',
        'urine_glucose',
        'edema',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'gestational_age_weeks' => 'integer',
        'gestational_age_days' => 'integer',
        'gravida' => 'integer',
        'para' => 'integer',
        'fundal_height_cm' => 'decimal:1',
        'fetal_heart_rate' => 'integer',
        'blood_pressure_systolic' => 'integer',
        'blood_pressure_diastolic' => 'integer',
        'weight_kg' => 'decimal:2',
        'edema' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
