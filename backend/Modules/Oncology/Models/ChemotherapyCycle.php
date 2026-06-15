<?php

namespace Modules\Oncology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class ChemotherapyCycle extends Model
{
    use HasUuids;

    protected $table = 'chemotherapy_cycles';

    protected $fillable = [
        'oncology_case_id',
        'patient_id',
        'protocol_name',
        'cycle_number',
        'total_cycles',
        'scheduled_date',
        'administered_date',
        'administered_by',
        'status',
        'delay_reason',
        'pre_medications',
        'drugs',
        'toxicity_grade',
        'toxicity_notes',
        'next_cycle_date',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'administered_date' => 'date',
        'next_cycle_date' => 'date',
        'pre_medications' => 'array',
        'drugs' => 'array',
        'cycle_number' => 'integer',
        'total_cycles' => 'integer',
        'toxicity_grade' => 'integer',
    ];

    public function oncologyCase()
    {
        return $this->belongsTo(OncologyCase::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function administeredBy()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }
}
