<?php

namespace Modules\Telemedicine\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VirtualWaitingRoom extends Model
{
    use HasUuids;

    protected $table = 'virtual_waiting_room';

    protected $fillable = [
        'session_id', 'patient_id', 'joined_waiting_at',
        'admitted_at', 'wait_time_seconds', 'status',
    ];

    protected $casts = [
        'joined_waiting_at' => 'datetime',
        'admitted_at' => 'datetime',
    ];
}
