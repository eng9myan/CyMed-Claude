<?php

namespace Modules\Appointment\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AppointmentSchedule extends Model
{
    use HasUuids;

    protected $fillable = [
        'facility_id', 'department_id', 'physician_id', 'schedule_name',
        'schedule_type', 'slot_duration_minutes', 'working_days',
        'start_time', 'end_time', 'max_daily_patients',
        'allow_overbooking', 'overbooking_limit', 'is_active', 'exceptions',
    ];

    protected function casts(): array
    {
        return [
            'working_days' => 'array',
            'exceptions' => 'array',
            'is_active' => 'boolean',
            'allow_overbooking' => 'boolean',
            'slot_duration_minutes' => 'integer',
            'max_daily_patients' => 'integer',
            'overbooking_limit' => 'integer',
        ];
    }

    public function physician()
    {
        return $this->belongsTo(\App\Models\User::class, 'physician_id');
    }

    public function facility()
    {
        return $this->belongsTo(\Modules\Core\Models\Facility::class);
    }

    public function department()
    {
        return $this->belongsTo(\Modules\Core\Models\Department::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'schedule_id');
    }
}
