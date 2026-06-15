<?php

namespace Modules\NICU\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class NicuAdmission extends Model
{
    use HasUuids;

    protected $table = 'nicu_admissions';

    protected $fillable = [
        'admission_number',
        'patient_id',
        'mother_patient_id',
        'facility_id',
        'admitted_by',
        'birth_weight_grams',
        'gestational_age_weeks',
        'apgar_1min',
        'apgar_5min',
        'admission_reason',
        'incubator_number',
        'status',
        'admitted_at',
        'discharged_at',
    ];

    protected $casts = [
        'birth_weight_grams' => 'integer',
        'gestational_age_weeks' => 'integer',
        'apgar_1min' => 'integer',
        'apgar_5min' => 'integer',
        'admitted_at' => 'datetime',
        'discharged_at' => 'datetime',
    ];

    public static function generateAdmissionNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(admission_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM nicu_admissions WHERE admission_number LIKE ?",
            ["NICU-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('NICU-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function motherPatient()
    {
        return $this->belongsTo(Patient::class, 'mother_patient_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function admittedBy()
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    public function flowsheets()
    {
        return $this->hasMany(NicuFlowsheet::class, 'admission_id');
    }
}
