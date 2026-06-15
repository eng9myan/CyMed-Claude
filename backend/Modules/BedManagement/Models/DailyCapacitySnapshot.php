<?php

namespace Modules\BedManagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DailyCapacitySnapshot extends Model
{
    use HasUuids;

    protected $table = 'daily_capacity_snapshots';

    protected $fillable = [
        'facility_id', 'snapshot_date', 'total_beds', 'occupied_beds',
        'available_beds', 'icu_total', 'icu_occupied', 'er_visits',
        'surgeries_performed', 'outpatient_visits', 'admissions',
        'discharges', 'bed_occupancy_rate', 'average_los',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'bed_occupancy_rate' => 'float',
        'average_los' => 'float',
    ];
}
