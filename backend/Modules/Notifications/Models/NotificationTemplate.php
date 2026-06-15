<?php

namespace Modules\Notifications\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use HasUuids;

    protected $table = 'notification_templates';

    protected $fillable = [
        'template_code', 'name', 'channel', 'subject',
        'body_template', 'language', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
