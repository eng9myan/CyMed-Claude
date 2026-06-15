<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SecurityEvent extends Model
{
    use HasUuids;

    protected $table = 'security_events';

    protected $fillable = [
        'user_id', 'event_type', 'severity', 'ip_address', 'user_agent',
        'country_code', 'event_details', 'is_resolved', 'resolved_by',
        'resolved_at', 'occurred_at',
    ];

    protected $casts = [
        'event_details' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'occurred_at' => 'datetime',
    ];
}
