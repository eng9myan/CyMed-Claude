<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Encounter extends Model
{
    use SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'facility_id', 'patient_id', 'department_id', 'encounter_number',
        'encounter_type', 'admission_type', 'chief_complaint',
        'arrived_at', 'registered_at', 'triaged_at', 'seen_at', 'admitted_at', 'discharged_at',
        'status', 'discharge_disposition',
        'attending_physician_id', 'admitting_physician_id', 'primary_nurse_id',
        'consulting_physicians', 'care_team',
        'primary_diagnosis_code', 'primary_diagnosis_name', 'secondary_diagnoses',
        'drg_code', 'drg_weight',
        'primary_insurance_id', 'payment_method', 'pre_auth_number',
        'referral_source', 'transport_mode', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'arrived_at' => 'datetime',
            'registered_at' => 'datetime',
            'triaged_at' => 'datetime',
            'seen_at' => 'datetime',
            'admitted_at' => 'datetime',
            'discharged_at' => 'datetime',
            'consulting_physicians' => 'array',
            'care_team' => 'array',
            'secondary_diagnoses' => 'array',
            'fhir_encounter' => 'array',
            'pre_auth_approved' => 'boolean',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function attendingPhysician()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_physician_id');
    }

    public function vitals()
    {
        return $this->hasMany(\Modules\Nursing\Models\VitalSign::class);
    }

    public function notes()
    {
        return $this->hasMany(\Modules\EMR\Models\ClinicalNote::class);
    }

    public function medicationOrders()
    {
        return $this->hasMany(\Modules\Pharmacy\Models\MedicationOrder::class);
    }

    public function labOrders()
    {
        return $this->hasMany(\Modules\Laboratory\Models\LabOrder::class);
    }

    public function imagingOrders()
    {
        return $this->hasMany(\Modules\Radiology\Models\ImagingOrder::class);
    }

    public function charges()
    {
        return $this->hasMany(\Modules\Billing\Models\ServiceCharge::class);
    }

    public function getLengthOfStayAttribute(): ?int
    {
        if ($this->admitted_at) {
            $end = $this->discharged_at ?? now();
            return (int) $this->admitted_at->diffInDays($end);
        }
        return null;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public static function generateEncounterNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('ENC-%d-%07d', $year, $seq);
    }
}
