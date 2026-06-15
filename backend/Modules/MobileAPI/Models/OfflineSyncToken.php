<?php

namespace Modules\MobileAPI\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OfflineSyncToken extends Model
{
    use HasUuids;

    protected $table = 'offline_sync_tokens';

    protected $fillable = [
        'user_id', 'sync_token', 'pending_sync', 'token_expires_at', 'last_synced_at',
    ];

    protected $casts = [
        'pending_sync' => 'array',
        'token_expires_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];
}
