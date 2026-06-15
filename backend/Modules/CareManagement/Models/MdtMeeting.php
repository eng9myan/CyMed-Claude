<?php

namespace Modules\CareManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MdtMeeting extends Model
{
    use HasUuids;

    protected $table = 'mdt_meetings';

    protected $fillable = [
        'facility_id', 'patient_id', 'meeting_type', 'status',
        'scheduled_at', 'duration_minutes', 'agenda', 'discussion_notes',
        'decisions', 'attendee_ids', 'chaired_by',
    ];

    protected $casts = [
        'decisions' => 'array',
        'attendee_ids' => 'array',
        'scheduled_at' => 'datetime',
    ];
}
