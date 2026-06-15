<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EntityAuditLog extends Model
{
    use HasUuids;

    protected $table = 'entity_audit_logs';

    protected $fillable = [
        'user_id', 'entity_type', 'entity_id', 'action',
        'old_values', 'new_values', 'changed_fields',
        'ip_address', 'user_agent', 'request_id', 'audited_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'changed_fields' => 'array',
        'audited_at' => 'datetime',
    ];
}
