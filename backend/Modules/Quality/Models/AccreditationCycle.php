<?php

namespace Modules\Quality\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AccreditationCycle extends Model
{
    use HasUuids;

    protected $table = 'accreditation_cycles';

    protected $fillable = [
        'facility_id', 'accreditation_body', 'cycle_name',
        'survey_date', 'expiry_date', 'status', 'score', 'findings',
    ];

    protected $casts = [
        'survey_date' => 'date',
        'expiry_date' => 'date',
    ];
}
