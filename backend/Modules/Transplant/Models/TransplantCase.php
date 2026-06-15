<?php

namespace Modules\Transplant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class TransplantCase extends Model
{
    use HasUuids;

    protected $table = 'transplant_cases';

    protected $fillable = [
        'case_number',
        'recipient_id',
        'facility_id',
        'waitlist_id',
        'surgeon_id',
        'organ_type',
        'donor_type',
        'transplant_date',
        'cold_ischemia_time_hours',
        'warm_ischemia_time_minutes',
        'hla_match_score',
        'immunosuppression_protocol',
        'outcome',
        'notes',
    ];

    protected $casts = [
        'transplant_date' => 'date',
        'cold_ischemia_time_hours' => 'decimal:2',
    ];

    public static function generateCaseNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(case_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM transplant_cases WHERE case_number LIKE ?",
            ["TXP-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('TXP-%d-%06d', $year, $seq);
    }

    public function recipient()
    {
        return $this->belongsTo(Patient::class, 'recipient_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function waitlist()
    {
        return $this->belongsTo(TransplantWaitlist::class, 'waitlist_id');
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }

    public function followups()
    {
        return $this->hasMany(TransplantFollowup::class, 'transplant_case_id');
    }
}
