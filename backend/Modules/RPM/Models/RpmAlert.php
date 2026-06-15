<?php

namespace Modules\RPM\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class RpmAlert extends Model
{
    use HasUuids;

    protected $table = 'rpm_alerts';

    protected $fillable = [
        'reading_id', 'patient_id', 'device_id',
        'metric', 'value', 'severity', 'message',
        'acknowledged', 'acknowledged_by', 'acknowledged_at', 'action_taken',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
    ];

    public function reading()
    {
        return $this->belongsTo(RpmReading::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function device()
    {
        return $this->belongsTo(RpmDevice::class, 'device_id');
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
