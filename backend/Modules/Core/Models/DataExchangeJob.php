<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DataExchangeJob extends Model
{
    use HasUuids;

    protected $table = 'data_exchange_jobs';

    protected $fillable = [
        'facility_id', 'job_type', 'source_system', 'destination_system',
        'data_category', 'format', 'status', 'records_processed',
        'records_succeeded', 'records_failed', 'error_log',
        'triggered_by', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}
