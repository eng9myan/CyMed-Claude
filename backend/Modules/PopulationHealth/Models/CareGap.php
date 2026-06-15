<?php

namespace Modules\PopulationHealth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CareGap extends Model
{
    use HasUuids;

    protected $table = 'care_gaps';

    protected $fillable = [
        'facility_id', 'patient_id', 'gap_type', 'description',
        'due_date', 'status', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date'    => 'date',
            'resolved_at' => 'datetime',
        ];
    }
}
