<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class TrialAdverseEvent extends Model
{
    use HasUuids;

    protected $table = 'trial_adverse_events';

    protected $fillable = [
        'clinical_trial_id', 'patient_id', 'event_date', 'event_description',
        'severity', 'relatedness', 'is_serious', 'was_reported', 'reported_by',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_serious' => 'boolean',
        'was_reported' => 'boolean',
    ];

    public function trial()
    {
        return $this->belongsTo(ClinicalTrial::class, 'clinical_trial_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
