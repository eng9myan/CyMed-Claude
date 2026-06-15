<?php

namespace Modules\Research\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class TrialEnrollment extends Model
{
    use HasUuids;

    protected $table = 'trial_enrollments';

    protected $fillable = [
        'clinical_trial_id', 'patient_id', 'enrollment_date', 'arm',
        'status', 'withdrawal_date', 'withdrawal_reason',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'withdrawal_date' => 'date',
    ];

    public function trial()
    {
        return $this->belongsTo(ClinicalTrial::class, 'clinical_trial_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
