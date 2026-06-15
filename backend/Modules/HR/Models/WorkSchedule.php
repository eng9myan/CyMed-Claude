<?php

namespace Modules\HR\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id', 'facility_id', 'department_id', 'schedule_type',
        'day_of_week', 'start_time', 'end_time',
        'effective_from', 'effective_until', 'is_active', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'effective_from' => 'date',
            'effective_until' => 'date',
            'is_active' => 'boolean',
            'day_of_week' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facility()
    {
        return $this->belongsTo(\Modules\Core\Models\Facility::class);
    }

    public function department()
    {
        return $this->belongsTo(\Modules\Core\Models\Department::class);
    }

    public function getDayNameAttribute(): string
    {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][$this->day_of_week] ?? 'Unknown';
    }
}
