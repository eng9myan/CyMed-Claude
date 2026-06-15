<?php

namespace Modules\Appointment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AppointmentWaitlist extends Model
{
    use HasUuids;

    protected $table = 'appointment_waitlists';

    protected $fillable = [
        'facility_id', 'patient_id', 'provider_id', 'specialty',
        'appointment_type', 'earliest_date', 'latest_date',
        'priority', 'status', 'booked_appointment_id', 'notified_at',
    ];

    protected $casts = [
        'earliest_date' => 'date',
        'latest_date' => 'date',
        'notified_at' => 'datetime',
    ];
}
