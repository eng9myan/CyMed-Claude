<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SystemHealthCheck extends Model
{
    use HasUuids;

    protected $table = 'system_health_checks';

    protected $fillable = [
        'service_name', 'status', 'response_time_ms', 'details', 'checked_at',
    ];

    protected $casts = [
        'checked_at' => 'datetime',
    ];
}
