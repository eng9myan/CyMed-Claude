<?php

namespace Modules\Integration\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class IntegrationEndpoint extends Model
{
    use HasUuids;

    protected $table = 'integration_endpoints';

    protected $fillable = [
        'facility_id', 'endpoint_name', 'system_type', 'protocol',
        'host', 'port', 'path', 'auth_config', 'status', 'last_successful_at',
    ];

    protected $casts = [
        'auth_config' => 'array',
        'last_successful_at' => 'datetime',
    ];
}
