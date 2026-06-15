<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SatisfactionSurvey extends Model
{
    use HasUuids;

    protected $table = 'satisfaction_surveys';

    protected $fillable = [
        'facility_id', 'survey_code', 'survey_name', 'survey_type',
        'questions', 'is_active',
    ];

    protected $casts = [
        'questions' => 'array',
        'is_active' => 'boolean',
    ];
}
