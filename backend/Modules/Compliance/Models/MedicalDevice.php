<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class MedicalDevice extends Model
{
    use HasUuids;

    protected $table = 'medical_devices';

    protected $fillable = [
        'facility_id', 'device_code', 'device_name', 'device_type',
        'manufacturer', 'model_number', 'serial_number', 'location',
        'integration_type', 'is_active', 'last_calibrated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'          => 'boolean',
            'last_calibrated_at' => 'datetime',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function readings()
    {
        return $this->hasMany(DeviceReading::class, 'device_id');
    }
}
