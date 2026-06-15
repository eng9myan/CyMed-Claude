<?php

namespace Modules\Notifications\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasUuids;

    protected $table = 'notification_logs';

    protected $fillable = [
        'user_id', 'patient_id', 'template_code', 'channel',
        'recipient', 'subject', 'body', 'status', 'external_id',
        'error_message', 'sent_at', 'delivered_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];
}
