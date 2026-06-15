<?php

namespace Modules\BloodBank\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class BloodTransfusion extends Model
{
    use HasUuids;

    protected $table = 'blood_transfusions';

    protected $fillable = [
        'blood_unit_id',
        'patient_id',
        'encounter_id',
        'administered_by',
        'started_at',
        'ended_at',
        'volume_transfused_ml',
        'reaction_observed',
        'reaction_notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'volume_transfused_ml' => 'integer',
        'reaction_observed' => 'boolean',
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

    public function administeredBy()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }
}
