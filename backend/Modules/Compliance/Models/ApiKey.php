<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use HasUuids;

    protected $table = 'api_keys';

    protected $fillable = [
        'facility_id', 'key_name', 'key_hash', 'key_prefix',
        'system_type', 'permissions', 'status', 'expires_at',
        'last_used_at', 'created_by',
    ];

    protected $hidden = ['key_hash'];

    protected $casts = [
        'permissions' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];
}
