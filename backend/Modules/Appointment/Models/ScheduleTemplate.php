<?php

namespace Modules\Appointment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ScheduleTemplate extends Model
{
    use HasUuids;

    protected $table = 'schedule_templates';

    protected $fillable = [
        'facility_id', 'provider_id', 'template_name', 'specialty',
        'slot_duration_minutes', 'weekly_pattern', 'max_patients_per_slot',
        'allow_double_booking', 'is_active',
    ];

    protected $casts = [
        'weekly_pattern' => 'array',
        'allow_double_booking' => 'boolean',
        'is_active' => 'boolean',
    ];
}
