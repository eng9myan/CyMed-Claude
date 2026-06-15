<?php

namespace Modules\NLP\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CodingSuggestion extends Model
{
    use HasUuids;

    protected $table = 'coding_suggestions';

    protected $fillable = [
        'patient_id', 'encounter_id', 'code_type', 'suggested_code',
        'description', 'confidence_score', 'rationale', 'status', 'accepted_by',
    ];

    protected function casts(): array
    {
        return [
            'confidence_score' => 'decimal:4',
        ];
    }
}
