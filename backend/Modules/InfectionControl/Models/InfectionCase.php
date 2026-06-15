<?php

namespace Modules\InfectionControl\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class InfectionCase extends Model
{
    use HasUuids;

    protected $table = 'infection_cases';

    protected $fillable = [
        'facility_id', 'patient_id', 'encounter_id',
        'case_reference', 'pathogen', 'case_type', 'infection_site',
        'risk_factors', 'is_multidrug_resistant', 'is_reportable', 'reported_to_moh',
        'status', 'reported_by', 'assigned_to', 'reported_at',
        'confirmed_at', 'closed_at', 'clinical_notes',
        'interventions_taken', 'lab_results',
    ];

    protected $casts = [
        'reported_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'closed_at' => 'datetime',
        'is_multidrug_resistant' => 'boolean',
        'is_reportable' => 'boolean',
        'reported_to_moh' => 'boolean',
        'interventions_taken' => 'array',
        'lab_results' => 'array',
    ];

    public static function generateCaseReference(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('INF-%d-%05d', $year, $seq);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
