<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HipaaAccessLog extends Model
{
    use HasUuids;

    protected $table = 'hipaa_access_logs';

    protected $fillable = [
        'user_id', 'patient_id', 'facility_id', 'resource_type', 'resource_id',
        'action', 'ip_address', 'user_agent', 'is_authorized', 'is_break_glass',
        'break_glass_reason', 'accessed_at',
    ];

    protected $casts = [
        'is_authorized' => 'boolean',
        'is_break_glass' => 'boolean',
        'accessed_at' => 'datetime',
    ];
}
