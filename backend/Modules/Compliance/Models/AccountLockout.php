<?php

namespace Modules\Compliance\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AccountLockout extends Model
{
    use HasUuids;

    protected $table = 'account_lockouts';

    protected $fillable = [
        'user_id', 'lockout_reason', 'failed_attempts', 'ip_address',
        'locked_at', 'unlocked_at', 'unlocked_by', 'auto_unlock',
    ];

    protected $casts = [
        'locked_at' => 'datetime',
        'unlocked_at' => 'datetime',
        'auto_unlock' => 'boolean',
    ];
}
