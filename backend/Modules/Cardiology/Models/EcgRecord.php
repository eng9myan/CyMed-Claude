<?php

namespace Modules\Cardiology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class EcgRecord extends Model
{
    use HasUuids;

    protected $table = 'ecg_records';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'performed_by',
        'interpreted_by',
        'performed_at',
        'heart_rate',
        'rhythm',
        'pr_interval_ms',
        'qrs_duration_ms',
        'qt_interval_ms',
        'qtc_interval_ms',
        'axis',
        'st_changes',
        'st_notes',
        'interpretation',
        'is_abnormal',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
        'heart_rate' => 'integer',
        'pr_interval_ms' => 'integer',
        'qrs_duration_ms' => 'integer',
        'qt_interval_ms' => 'integer',
        'qtc_interval_ms' => 'integer',
        'st_changes' => 'boolean',
        'is_abnormal' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function interpretedBy()
    {
        return $this->belongsTo(User::class, 'interpreted_by');
    }
}
