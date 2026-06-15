<?php

namespace Modules\Research\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class IrbSubmission extends Model
{
    use HasUuids;

    protected $table = 'irb_submissions';

    protected $fillable = [
        'submission_number', 'facility_id', 'principal_investigator_id',
        'title', 'study_type', 'submission_date', 'review_date', 'review_type',
        'status', 'summary', 'expected_subjects', 'start_date', 'end_date',
        'involves_minors', 'involves_vulnerable', 'reviewer_comments', 'reviewed_by',
    ];

    protected $casts = [
        'submission_date' => 'date',
        'review_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'involves_minors' => 'boolean',
        'involves_vulnerable' => 'boolean',
    ];

    public static function generateSubmissionNumber(): string
    {
        $year = now()->year;
        $result = DB::select(
            "SELECT COALESCE(MAX(CAST(SUBSTRING(submission_number FROM 'IRB-{$year}-(.+)') AS INTEGER)), 0) AS max_seq FROM irb_submissions WHERE submission_number LIKE 'IRB-{$year}-%'"
        );
        $seq = ((int) $result[0]->max_seq) + 1;

        return 'IRB-' . $year . '-' . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }

    public function principalInvestigator()
    {
        return $this->belongsTo(User::class, 'principal_investigator_id');
    }

    public function amendments()
    {
        return $this->hasMany(IrbAmendment::class);
    }
}
