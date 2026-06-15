<?php

namespace Modules\Physiotherapy\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PhysioOutcomeScore extends Model
{
    use HasUuids;

    protected $table = 'physio_outcome_scores';

    protected $fillable = [
        'patient_id',
        'assessment_id',
        'scored_by',
        'scoring_date',
        'tool',
        'total_score',
        'max_score',
        'subscores',
        'interpretation',
    ];

    protected $casts = [
        'scoring_date' => 'date',
        'subscores' => 'array',
        'total_score' => 'float',
        'max_score' => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function scoredBy()
    {
        return $this->belongsTo(User::class, 'scored_by');
    }

    public function assessment()
    {
        return $this->belongsTo(PhysioAssessment::class);
    }
}
