<?php

namespace Modules\BloodBank\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class BloodCrossmatch extends Model
{
    use HasUuids;

    protected $table = 'blood_crossmatches';

    protected $fillable = [
        'blood_unit_id',
        'patient_id',
        'encounter_id',
        'requested_by',
        'crossmatch_result',
        'crossmatched_at',
        'crossmatched_by',
        'reserved_until',
    ];

    protected $casts = [
        'crossmatched_at' => 'datetime',
        'reserved_until' => 'datetime',
    ];

    public function bloodUnit()
    {
        return $this->belongsTo(BloodUnit::class, 'blood_unit_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function crossmatchedBy()
    {
        return $this->belongsTo(User::class, 'crossmatched_by');
    }
}
