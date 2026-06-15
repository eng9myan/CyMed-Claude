<?php

namespace Modules\Maternity\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class LaborDelivery extends Model
{
    use HasUuids;

    protected $table = 'labor_deliveries';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'provider_id',
        'delivery_date',
        'delivery_time',
        'gestational_age_weeks',
        'delivery_mode',
        'labor_onset',
        'duration_labor_hours',
        'blood_loss_ml',
        'complications',
        'anesthesia_type',
        'apgar_1min',
        'apgar_5min',
        'birth_weight_grams',
        'baby_gender',
        'neonatal_outcome',
        'mother_outcome',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'gestational_age_weeks' => 'integer',
        'duration_labor_hours' => 'decimal:2',
        'blood_loss_ml' => 'integer',
        'apgar_1min' => 'integer',
        'apgar_5min' => 'integer',
        'birth_weight_grams' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter()
    {
        return $this->belongsTo(Encounter::class);
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
