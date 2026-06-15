<?php

namespace Modules\Cardiology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class EchoReport extends Model
{
    use HasUuids;

    protected $table = 'echo_reports';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'performed_by',
        'performed_at',
        'echo_type',
        'ef_percent',
        'lv_function',
        'wall_motion',
        'valvular_findings',
        'pericardial_effusion',
        'impression',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
        'ef_percent' => 'decimal:2',
        'pericardial_effusion' => 'boolean',
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
}
