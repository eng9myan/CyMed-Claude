<?php

namespace Modules\Pharmacy\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MedicationOrder extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'encounter_id', 'drug_id', 'ordered_by',
        'order_number', 'ordered_at', 'priority',
        'drug_name', 'rxnorm_code', 'dose', 'dose_unit', 'route', 'frequency',
        'frequency_interval_hours', 'is_prn', 'prn_reason', 'prn_max_dose', 'prn_interval_hours',
        'start_date', 'end_date', 'duration_days', 'refills_allowed',
        'quantity', 'quantity_unit',
        'indication', 'sig', 'pharmacist_notes', 'prescriber_notes',
        'allergy_checked_at', 'interaction_checked_at',
        'interaction_alerts', 'interaction_override', 'interaction_override_reason',
        'verified_by', 'verified_at',
        'dispensed_by', 'dispensed_at',
        'status',
        'discontinued_reason', 'discontinued_by', 'discontinued_at',
        'is_discharge_prescription', 'sent_to_external_pharmacy',
    ];

    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
            'verified_at' => 'datetime',
            'dispensed_at' => 'datetime',
            'discontinued_at' => 'datetime',
            'allergy_checked_at' => 'datetime',
            'interaction_checked_at' => 'datetime',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_prn' => 'boolean',
            'interaction_override' => 'boolean',
            'is_discharge_prescription' => 'boolean',
            'sent_to_external_pharmacy' => 'boolean',
            'interaction_alerts' => 'array',
            'quantity' => 'decimal:2',
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

    public function orderedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'ordered_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    public function administrations()
    {
        return $this->hasMany(MedicationAdministration::class);
    }

    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('RX-%d-%07d', $year, $seq);
    }
}
