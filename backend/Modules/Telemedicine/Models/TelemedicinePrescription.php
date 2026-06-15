<?php

namespace Modules\Telemedicine\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TelemedicinePrescription extends Model
{
    use HasUuids;

    protected $table = 'telemedicine_prescriptions';

    protected $fillable = [
        'session_id', 'prescriber_id', 'patient_id', 'drug_name',
        'dosage', 'frequency', 'duration_days', 'instructions',
        'is_controlled', 'status', 'issued_at',
    ];

    protected $casts = [
        'is_controlled' => 'boolean',
        'issued_at' => 'datetime',
    ];
}
