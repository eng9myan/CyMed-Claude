<?php

namespace Modules\Laboratory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LabResult extends Model
{
    use HasUuids;

    protected $fillable = [
        'lab_order_id', 'patient_id', 'specimen_id',
        'loinc_code', 'test_code', 'test_name', 'panel_code',
        'result_value', 'result_unit', 'result_type', 'numeric_value',
        'reference_range', 'reference_range_low', 'reference_range_high',
        'result_interpretation', 'result_status',
        'is_critical', 'is_delta_check_failed',
        'resulted_at', 'resulted_by', 'verified_by', 'verified_at',
        'critical_notified_at', 'critical_notified_to',
        'critical_notification_method', 'critical_read_back_confirmation',
        'analyzer_id', 'analyzer_name', 'comments', 'fhir_observation',
    ];

    protected function casts(): array
    {
        return [
            'resulted_at' => 'datetime',
            'verified_at' => 'datetime',
            'critical_notified_at' => 'datetime',
            'is_critical' => 'boolean',
            'is_delta_check_failed' => 'boolean',
            'numeric_value' => 'decimal:4',
            'reference_range_low' => 'decimal:4',
            'reference_range_high' => 'decimal:4',
            'fhir_observation' => 'array',
        ];
    }

    public function labOrder()
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    public function scopeUnacknowledged($query)
    {
        return $query->whereNull('critical_read_back_confirmation');
    }
}
