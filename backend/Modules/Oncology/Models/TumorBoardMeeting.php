<?php

namespace Modules\Oncology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class TumorBoardMeeting extends Model
{
    use HasUuids;

    protected $table = 'tumor_board_meetings';

    protected $fillable = [
        'facility_id',
        'oncology_case_id',
        'meeting_date',
        'attendees',
        'recommendation',
        'treatment_plan',
        'follow_up_date',
        'recorded_by',
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'follow_up_date' => 'date',
        'attendees' => 'array',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function oncologyCase()
    {
        return $this->belongsTo(OncologyCase::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
