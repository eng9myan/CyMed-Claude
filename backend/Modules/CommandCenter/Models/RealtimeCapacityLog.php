<?php

namespace Modules\CommandCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RealtimeCapacityLog extends Model
{
    use HasUuids;

    protected $table = 'realtime_capacity_logs';

    protected $fillable = [
        'facility_id', 'recorded_at', 'total_beds', 'occupied_beds',
        'icu_beds', 'icu_occupied', 'ed_boarding',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
        ];
    }
}
