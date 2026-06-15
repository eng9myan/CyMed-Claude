<?php

namespace Modules\PatientEngagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PatientNotification extends Model
{
    use HasUuids;

    protected $table = 'patient_notifications';

    protected $fillable = [
        'patient_id',
        'notification_type',
        'title',
        'message',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
