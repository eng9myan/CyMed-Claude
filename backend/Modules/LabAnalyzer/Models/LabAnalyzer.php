<?php

namespace Modules\LabAnalyzer\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LabAnalyzer extends Model
{
    use HasUuids;

    protected $table = 'lab_analyzers';

    protected $fillable = [
        'device_id', 'device_name', 'manufacturer', 'model', 'facility_id',
        'department', 'analyzer_type', 'connection_type', 'ip_address', 'port',
        'status', 'last_calibration_at', 'last_qc_at',
    ];

    protected $casts = [
        'last_calibration_at' => 'datetime',
        'last_qc_at' => 'datetime',
    ];

    public function poctResults()
    {
        return $this->hasMany(PoctResult::class);
    }
}
