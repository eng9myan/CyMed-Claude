<?php

namespace Modules\RPM\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class RpmDevice extends Model
{
    use HasUuids;

    protected $table = 'rpm_devices';

    protected $fillable = [
        'patient_id', 'enrolled_by', 'device_type', 'device_id',
        'manufacturer', 'model', 'is_active', 'enrolled_at',
        'last_reading_at', 'alert_thresholds',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'enrolled_at' => 'datetime',
        'last_reading_at' => 'datetime',
        'alert_thresholds' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function enrolledBy()
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    public function readings()
    {
        return $this->hasMany(RpmReading::class, 'device_id');
    }
}
