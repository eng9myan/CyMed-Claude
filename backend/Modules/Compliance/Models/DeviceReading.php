<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DeviceReading extends Model
{
    use HasUuids;

    protected $table = 'device_readings';

    protected $fillable = [
        'device_id', 'patient_id', 'encounter_id',
        'reading_type', 'reading_value', 'unit',
        'reading_at', 'transmitted_at', 'is_critical',
    ];

    protected function casts(): array
    {
        return [
            'reading_at'    => 'datetime',
            'transmitted_at' => 'datetime',
            'is_critical'   => 'boolean',
        ];
    }

    public function device()
    {
        return $this->belongsTo(MedicalDevice::class);
    }
}
