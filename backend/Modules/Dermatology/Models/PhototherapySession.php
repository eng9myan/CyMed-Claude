<?php

namespace Modules\Dermatology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class PhototherapySession extends Model
{
    use HasUuids;

    protected $table = 'phototherapy_sessions';

    protected $fillable = [
        'patient_id',
        'facility_id',
        'administered_by',
        'session_date',
        'session_number',
        'therapy_type',
        'dose_mj_cm2',
        'exposure_seconds',
        'affected_area',
        'response',
        'side_effects',
    ];

    protected $casts = [
        'session_date' => 'date',
        'dose_mj_cm2' => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function administeredBy()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
