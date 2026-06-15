<?php

namespace Modules\PopulationHealth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PopulationRegistry extends Model
{
    use HasUuids;

    protected $table = 'population_registry';

    protected $fillable = [
        'facility_id', 'patient_id', 'condition_code',
        'condition_name', 'enrolled_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'is_active'   => 'boolean',
        ];
    }
}
