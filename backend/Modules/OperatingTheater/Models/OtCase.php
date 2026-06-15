<?php

namespace Modules\OperatingTheater\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class OtCase extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'ot_cases';

    protected $fillable = [
        'facility_id', 'encounter_id', 'patient_id',
        'case_number', 'procedure_name', 'procedure_codes', 'theater_room',
        'scheduled_start', 'scheduled_duration_minutes', 'actual_start', 'actual_end',
        'anesthesia_type', 'surgeon_id', 'assistant_surgeon_ids',
        'anesthesiologist_id', 'scrub_nurse_id',
        'case_status', 'pre_op_checklist_done',
        'post_op_diagnosis', 'implants_used', 'specimens_collected',
        'estimated_blood_loss_ml', 'complications', 'intraop_notes',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'actual_start' => 'datetime',
        'actual_end' => 'datetime',
        'procedure_codes' => 'array',
        'assistant_surgeon_ids' => 'array',
        'implants_used' => 'array',
        'specimens_collected' => 'array',
        'pre_op_checklist_done' => 'boolean',
        'scheduled_duration_minutes' => 'integer',
        'estimated_blood_loss_ml' => 'integer',
    ];

    public static function generateCaseNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('OT-%d-%06d', $year, $seq);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }

    public function anesthesiologist()
    {
        return $this->belongsTo(User::class, 'anesthesiologist_id');
    }

    public function scrubNurse()
    {
        return $this->belongsTo(User::class, 'scrub_nurse_id');
    }
}
