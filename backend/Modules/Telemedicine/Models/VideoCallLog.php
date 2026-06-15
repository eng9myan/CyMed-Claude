<?php

namespace Modules\Telemedicine\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VideoCallLog extends Model
{
    use HasUuids;

    protected $table = 'video_call_logs';

    protected $fillable = [
        'session_id', 'user_id', 'event_type', 'platform',
        'connection_quality', 'duration_seconds', 'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];
}
