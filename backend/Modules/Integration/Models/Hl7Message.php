<?php

namespace Modules\Integration\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Hl7Message extends Model
{
    use HasUuids;

    protected $table = 'hl7_messages';

    protected $fillable = [
        'message_id', 'facility_id', 'message_type', 'trigger_event',
        'direction', 'source_system', 'destination_system', 'raw_message',
        'processing_status', 'error_message', 'patient_id', 'message_datetime',
    ];

    protected $casts = [
        'message_datetime' => 'datetime',
    ];
}
