<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SurveyResponse extends Model
{
    use HasUuids;

    protected $table = 'survey_responses';

    protected $fillable = [
        'survey_id', 'patient_id', 'encounter_id', 'answers',
        'overall_score', 'is_anonymous', 'channel', 'submitted_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'is_anonymous' => 'boolean',
        'submitted_at' => 'datetime',
        'overall_score' => 'float',
    ];
}
