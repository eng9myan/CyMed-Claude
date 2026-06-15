<?php

namespace Modules\Nursing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class VitalSign extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'patient_id', 'encounter_id', 'recorded_by', 'recorded_at',
        'temperature', 'temperature_unit', 'temperature_route',
        'heart_rate',
        'blood_pressure_systolic', 'blood_pressure_diastolic', 'bp_position', 'bp_arm', 'mean_arterial_pressure',
        'respiratory_rate', 'oxygen_saturation', 'on_oxygen', 'oxygen_flow_rate', 'oxygen_delivery_device',
        'gcs_total', 'gcs_eye', 'gcs_verbal', 'gcs_motor', 'pupil_right', 'pupil_left',
        'blood_glucose', 'glucose_timing',
        'weight_kg', 'height_cm', 'bmi', 'head_circumference_cm', 'waist_cm',
        'pain_score', 'pain_scale', 'pain_location',
        'urine_output_ml', 'capillary_refill_seconds', 'skin_condition',
        'device_id', 'notes', 'fhir_observations',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'on_oxygen' => 'boolean',
            'temperature' => 'decimal:2',
            'oxygen_saturation' => 'decimal:2',
            'oxygen_flow_rate' => 'decimal:2',
            'blood_glucose' => 'decimal:2',
            'weight_kg' => 'decimal:2',
            'height_cm' => 'decimal:1',
            'bmi' => 'decimal:2',
            'head_circumference_cm' => 'decimal:1',
            'waist_cm' => 'decimal:1',
            'urine_output_ml' => 'decimal:2',
            'heart_rate' => 'integer',
            'blood_pressure_systolic' => 'integer',
            'blood_pressure_diastolic' => 'integer',
            'mean_arterial_pressure' => 'integer',
            'respiratory_rate' => 'integer',
            'gcs_total' => 'integer',
            'gcs_eye' => 'integer',
            'gcs_verbal' => 'integer',
            'gcs_motor' => 'integer',
            'pain_score' => 'integer',
            'capillary_refill_seconds' => 'integer',
            'fhir_observations' => 'array',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'recorded_by');
    }
}
