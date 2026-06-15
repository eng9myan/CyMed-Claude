<?php

namespace Modules\Pediatrics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class ImmunizationRecord extends Model
{
    use HasUuids;

    protected $table = 'immunization_records';

    protected $fillable = [
        'patient_id',
        'facility_id',
        'administered_by',
        'vaccine_name',
        'vaccine_code',
        'dose_number',
        'lot_number',
        'manufacturer',
        'administered_at',
        'site',
        'route',
        'next_due_date',
        'adverse_reaction',
    ];

    protected $casts = [
        'administered_at' => 'date',
        'next_due_date' => 'date',
        'dose_number' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function administeredBy()
    {
        return $this->belongsTo(User::class, 'administered_by');
    }
}
