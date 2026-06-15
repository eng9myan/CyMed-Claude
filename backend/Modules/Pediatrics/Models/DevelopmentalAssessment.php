<?php

namespace Modules\Pediatrics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class DevelopmentalAssessment extends Model
{
    use HasUuids;

    protected $table = 'developmental_assessments';

    protected $fillable = [
        'patient_id',
        'assessed_by',
        'assessment_date',
        'age_months',
        'gross_motor',
        'fine_motor',
        'language',
        'social_emotional',
        'cognitive',
        'concerns',
        'referral_needed',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'age_months' => 'integer',
        'referral_needed' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function assessedBy()
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }
}
