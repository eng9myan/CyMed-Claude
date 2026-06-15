<?php

namespace Modules\Dental\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class DentalTreatment extends Model
{
    use HasUuids;

    protected $table = 'dental_treatments';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'dentist_id',
        'tooth_numbers',
        'treatment_type',
        'procedure_code',
        'diagnosis',
        'treatment_notes',
        'materials_used',
        'treatment_date',
        'next_appointment_date',
        'status',
    ];

    protected $casts = [
        'tooth_numbers' => 'array',
        'treatment_date' => 'date',
        'next_appointment_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function dentist()
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }
}
