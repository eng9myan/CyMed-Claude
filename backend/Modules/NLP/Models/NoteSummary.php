<?php

namespace Modules\NLP\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NoteSummary extends Model
{
    use HasUuids;

    protected $table = 'note_summaries';

    protected $fillable = [
        'patient_id', 'encounter_id', 'source_type', 'original_text',
        'summary_text', 'key_findings', 'summarized_by', 'model_used',
    ];

    protected function casts(): array
    {
        return [
            'key_findings' => 'array',
        ];
    }
}
