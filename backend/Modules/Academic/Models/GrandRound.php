<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class GrandRound extends Model
{
    use HasUuids;

    protected $table = 'grand_rounds';

    protected $fillable = [
        'facility_id',
        'title',
        'presenter_id',
        'department',
        'scheduled_at',
        'duration_minutes',
        'location',
        'topic_category',
        'case_summary',
        'learning_objectives',
        'cme_credit_hours',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'learning_objectives' => 'array',
        'cme_credit_hours' => 'decimal:2',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function presenter()
    {
        return $this->belongsTo(User::class, 'presenter_id');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(GrandRoundsAttendance::class, 'grand_rounds_id');
    }
}
