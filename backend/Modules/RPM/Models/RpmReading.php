<?php

namespace Modules\RPM\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class RpmReading extends Model
{
    use HasUuids;

    protected $table = 'rpm_readings';

    protected $fillable = [
        'device_id', 'patient_id', 'reading_at',
        'metric', 'value', 'unit', 'is_alert', 'alert_severity',
    ];

    protected $casts = [
        'reading_at' => 'datetime',
        'value' => 'decimal:2',
        'is_alert' => 'boolean',
    ];

    public function device()
    {
        return $this->belongsTo(RpmDevice::class, 'device_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
