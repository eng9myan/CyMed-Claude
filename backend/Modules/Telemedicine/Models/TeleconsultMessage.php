<?php

namespace Modules\Telemedicine\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TeleconsultMessage extends Model
{
    use HasUuids;

    protected $table = 'teleconsult_messages';

    protected $fillable = [
        'session_id',
        'sender_id',
        'sender_type',
        'message_type',
        'content',
        'attachment_url',
    ];

    public function session()
    {
        return $this->belongsTo(TeleconsultSession::class, 'session_id');
    }

    public function sender()
    {
        return $this->belongsTo(\App\Models\User::class, 'sender_id');
    }
}
