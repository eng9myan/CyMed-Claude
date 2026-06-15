<?php

namespace Modules\NICU\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NicuFlowsheet extends Model
{
    use HasUuids;

    protected $table = 'nicu_flowsheets';

    protected $fillable = [
        'admission_id',
        'recorded_by',
        'recorded_at',
        'weight_grams',
        'temperature_celsius',
        'heart_rate',
        'respiratory_rate',
        'spo2_percent',
        'blood_glucose',
        'feeding_type',
        'feeding_volume_ml',
        'urine_output_ml',
        'on_ventilator',
        'on_phototherapy',
        'notes',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'weight_grams' => 'integer',
        'temperature_celsius' => 'decimal:1',
        'heart_rate' => 'integer',
        'respiratory_rate' => 'integer',
        'spo2_percent' => 'decimal:2',
        'blood_glucose' => 'decimal:2',
        'feeding_volume_ml' => 'decimal:1',
        'urine_output_ml' => 'decimal:1',
        'on_ventilator' => 'boolean',
        'on_phototherapy' => 'boolean',
    ];

    public function admission()
    {
        return $this->belongsTo(NicuAdmission::class, 'admission_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
