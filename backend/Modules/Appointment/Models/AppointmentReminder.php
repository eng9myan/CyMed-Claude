<?php

namespace Modules\Appointment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AppointmentReminder extends Model
{
    use HasUuids;

    protected $table = 'appointment_reminders';

    protected $fillable = [
        'appointment_id', 'channel', 'hours_before',
        'status', 'scheduled_at', 'sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];
}
