<?php

namespace Modules\Pediatrics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class GrowthRecord extends Model
{
    use HasUuids;

    protected $table = 'growth_records';

    protected $fillable = [
        'patient_id',
        'recorded_by',
        'recorded_at',
        'age_months',
        'weight_kg',
        'height_cm',
        'head_circumference_cm',
        'bmi',
        'weight_percentile',
        'height_percentile',
        'hc_percentile',
        'nutritional_status',
    ];

    protected $casts = [
        'recorded_at' => 'date',
        'age_months' => 'integer',
        'weight_kg' => 'decimal:3',
        'height_cm' => 'decimal:1',
        'head_circumference_cm' => 'decimal:1',
        'bmi' => 'decimal:2',
        'weight_percentile' => 'decimal:2',
        'height_percentile' => 'decimal:2',
        'hc_percentile' => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
