<?php

namespace Modules\Oncology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class OncologyCase extends Model
{
    use HasUuids;

    protected $table = 'oncology_cases';

    protected $fillable = [
        'case_number',
        'patient_id',
        'facility_id',
        'primary_oncologist_id',
        'cancer_type',
        'icd10_code',
        'histology',
        'stage',
        'grade',
        'diagnosis_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'diagnosis_date' => 'date',
    ];

    public static function generateCaseNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(case_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM oncology_cases WHERE case_number LIKE ?",
            ["ONC-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('ONC-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function primaryOncologist()
    {
        return $this->belongsTo(User::class, 'primary_oncologist_id');
    }

    public function chemotherapyCycles()
    {
        return $this->hasMany(ChemotherapyCycle::class);
    }

    public function tumorBoardMeetings()
    {
        return $this->hasMany(TumorBoardMeeting::class);
    }
}
