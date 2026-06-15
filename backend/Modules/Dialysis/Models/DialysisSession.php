<?php

namespace Modules\Dialysis\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class DialysisSession extends Model
{
    use HasUuids;

    protected $table = 'dialysis_sessions';

    protected $fillable = [
        'session_number',
        'patient_id',
        'encounter_id',
        'facility_id',
        'performed_by',
        'session_type',
        'machine_id',
        'access_type',
        'scheduled_at',
        'started_at',
        'ended_at',
        'planned_duration_hours',
        'actual_duration_hours',
        'pre_weight_kg',
        'post_weight_kg',
        'fluid_removed_liters',
        'blood_flow_rate',
        'dialysate_flow_rate',
        'kt_v',
        'pre_bp_systolic',
        'pre_bp_diastolic',
        'post_bp_systolic',
        'post_bp_diastolic',
        'complications',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'planned_duration_hours' => 'decimal:2',
        'actual_duration_hours' => 'decimal:2',
        'pre_weight_kg' => 'decimal:2',
        'post_weight_kg' => 'decimal:2',
        'fluid_removed_liters' => 'decimal:3',
        'kt_v' => 'decimal:2',
        'blood_flow_rate' => 'integer',
        'dialysate_flow_rate' => 'integer',
        'pre_bp_systolic' => 'integer',
        'pre_bp_diastolic' => 'integer',
        'post_bp_systolic' => 'integer',
        'post_bp_diastolic' => 'integer',
    ];

    public static function generateSessionNumber(): string
    {
        $year = now()->year;
        $rows = DB::select(
            "SELECT CAST(MAX(CAST(SPLIT_PART(session_number, '-', 3) AS INTEGER)) AS INTEGER) AS max_seq FROM dialysis_sessions WHERE session_number LIKE ?",
            ["DLY-{$year}-%"]
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return sprintf('DLY-%d-%06d', $year, $seq);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
