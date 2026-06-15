<?php

namespace Modules\Patient\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PromsScore extends Model
{
    use HasUuids;

    protected $table = 'proms_scores';

    protected $fillable = [
        'patient_id', 'instrument_id', 'encounter_id', 'score',
        'subscores', 'administration_mode', 'completed_at', 'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'score'        => 'decimal:2',
            'subscores'    => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function instrument()
    {
        return $this->belongsTo(PromsInstrument::class);
    }

    public function recordedByUser()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
