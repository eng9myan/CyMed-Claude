<?php

namespace Modules\BedManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Bed extends Model
{
    use HasUuids;

    protected $fillable = [
        'ward_id', 'bed_number', 'room_number', 'bed_type', 'status',
        'is_isolation_capable', 'is_monitoring_capable', 'has_ventilator_outlet',
        'current_patient_id', 'occupied_since', 'expected_discharge', 'is_active',
    ];

    protected $casts = [
        'is_isolation_capable' => 'boolean',
        'is_monitoring_capable' => 'boolean',
        'has_ventilator_outlet' => 'boolean',
        'is_active' => 'boolean',
        'occupied_since' => 'datetime',
        'expected_discharge' => 'datetime',
    ];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BedAssignment::class);
    }

    public function currentAssignment()
    {
        return $this->hasOne(BedAssignment::class)->where('is_current', true);
    }
}
