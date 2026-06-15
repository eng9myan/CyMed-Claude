<?php

namespace Modules\Pharmacy\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MedicationAdministration extends Model
{
    use HasUuids;

    protected $fillable = [
        'medication_order_id', 'patient_id', 'encounter_id', 'administered_by',
        'scheduled_at', 'administered_at',
        'status', 'dose_given', 'dose_unit', 'route_given', 'site',
        'batch_number', 'expiry_date', 'barcode_scanned',
        'hold_reason', 'refuse_reason', 'notes',
        'witnessed_by', 'witnessed_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'administered_at' => 'datetime',
            'witnessed_at' => 'datetime',
            'expiry_date' => 'date',
        ];
    }

    public function medicationOrder()
    {
        return $this->belongsTo(MedicationOrder::class);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function administeredBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'administered_by');
    }
}
