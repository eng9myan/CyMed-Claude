<?php

namespace Modules\DataWarehouse\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReportSchedule extends Model
{
    use HasUuids;

    protected $table = 'report_schedules';

    protected $fillable = [
        'report_id', 'user_id', 'frequency', 'delivery_channel', 'recipient',
        'parameter_values', 'next_run_at', 'last_run_at', 'is_active',
    ];

    protected $casts = [
        'parameter_values' => 'array',
        'next_run_at' => 'datetime',
        'last_run_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
