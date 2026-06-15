<?php

namespace Modules\MobileAPI\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MobileDeviceToken extends Model
{
    use HasUuids;

    protected $table = 'mobile_device_tokens';

    protected $fillable = [
        'user_id', 'device_token', 'platform', 'app_version',
        'device_model', 'is_active', 'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];
}
