<?php

namespace Modules\ICU\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\BedManagement\Models\Bed;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class IcuFlowsheet extends Model
{
    use HasUuids;

    protected $table = 'icu_flowsheets';

    protected $fillable = [
        'encounter_id', 'patient_id', 'bed_id', 'recorded_at', 'recorded_by',
        'gcs', 'gcs_eye', 'gcs_verbal', 'gcs_motor', 'pupil_left', 'pupil_right',
        'on_ventilator', 'ventilator_mode', 'peep', 'fio2', 'tidal_volume',
        'rr_set', 'rr_actual', 'spo2', 'etco2',
        'heart_rate', 'bp_systolic', 'bp_diastolic', 'map', 'cvp', 'temperature',
        'urine_output_ml', 'fluid_balance', 'drips',
        'repositioned', 'suctioned', 'oral_care_done', 'eye_care_done', 'restraints_applied',
        'notes',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'gcs' => 'integer',
        'gcs_eye' => 'integer',
        'gcs_verbal' => 'integer',
        'gcs_motor' => 'integer',
        'on_ventilator' => 'boolean',
        'peep' => 'decimal:1',
        'fio2' => 'decimal:1',
        'spo2' => 'decimal:2',
        'temperature' => 'decimal:2',
        'fluid_balance' => 'decimal:2',
        'drips' => 'array',
        'repositioned' => 'boolean',
        'suctioned' => 'boolean',
        'oral_care_done' => 'boolean',
        'eye_care_done' => 'boolean',
        'restraints_applied' => 'boolean',
    ];

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
