<?php

namespace Modules\CommandCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OperationalAlert extends Model
{
    use HasUuids;

    protected $table = 'operational_alerts';

    protected $fillable = [
        'facility_id', 'alert_type', 'severity', 'title', 'description',
        'triggered_by', 'triggered_at', 'resolved_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'triggered_at' => 'datetime',
            'resolved_at'  => 'datetime',
        ];
    }
}
