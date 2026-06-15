<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ClinicalTrial extends Model
{
    use HasUuids;

    protected $table = 'clinical_trials';

    protected $fillable = [
        'trial_number', 'facility_id', 'irb_submission_id', 'principal_investigator_id',
        'title', 'phase', 'sponsor', 'clinicaltrials_gov_id', 'status',
        'start_date', 'end_date', 'target_enrollment', 'intervention_type',
        'inclusion_criteria', 'exclusion_criteria',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public static function generateTrialNumber(): string
    {
        $year = now()->year;
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(trial_number FROM 'CT-{$year}-(.+)') AS INTEGER)), 0) AS max_seq FROM clinical_trials WHERE trial_number LIKE 'CT-{$year}-%'"
        );
        $seq = ((int) $result[0]->max_seq) + 1;

        return 'CT-' . $year . '-' . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }

    public function principalInvestigator()
    {
        return $this->belongsTo(User::class, 'principal_investigator_id');
    }

    public function enrollments()
    {
        return $this->hasMany(TrialEnrollment::class);
    }

    public function adverseEvents()
    {
        return $this->hasMany(TrialAdverseEvent::class);
    }
}
