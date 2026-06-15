<?php

namespace Modules\InfectionControl\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class HaiSurveillanceRecord extends Model
{
    use HasUuids;

    protected $table = 'hai_surveillance_records';

    protected $fillable = [
        'facility_id', 'patient_id', 'hai_type', 'infection_date',
        'organism', 'resistance_pattern', 'source', 'unit',
        'is_outbreak_related', 'outcome', 'reported_by',
    ];

    protected $casts = [
        'infection_date' => 'date',
        'is_outbreak_related' => 'boolean',
    ];
}
