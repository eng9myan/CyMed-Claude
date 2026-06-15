<?php

namespace Modules\Cardiology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class CathLabCase extends Model
{
    use HasUuids;

    protected $table = 'cath_lab_cases';

    protected $fillable = [
        'case_number',
        'patient_id',
        'encounter_id',
        'cardiologist_id',
        'procedure_type',
        'scheduled_at',
        'started_at',
        'ended_at',
        'access_site',
        'contrast_volume_ml',
        'fluoroscopy_time_min',
        'findings',
        'intervention_performed',
        'complications',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'contrast_volume_ml' => 'integer',
        'fluoroscopy_time_min' => 'decimal:2',
    ];

    public static function generateCaseNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(case_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM cath_lab_cases WHERE case_number LIKE ?",
            ["CATH-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('CATH-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function cardiologist()
    {
        return $this->belongsTo(User::class, 'cardiologist_id');
    }
}
