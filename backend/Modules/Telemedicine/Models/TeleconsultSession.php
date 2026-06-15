<?php

namespace Modules\Telemedicine\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TeleconsultSession extends Model
{
    use HasUuids;

    protected $table = 'teleconsult_sessions';

    protected $fillable = [
        'session_number',
        'patient_id',
        'provider_id',
        'appointment_id',
        'encounter_id',
        'session_type',
        'status',
        'scheduled_at',
        'started_at',
        'ended_at',
        'duration_minutes',
        'platform_session_id',
        'chief_complaint',
        'session_notes',
        'prescription_issued',
        'follow_up_required',
        'follow_up_notes',
        'technical_issues',
        'patient_rating',
        'cancelled_by',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'prescription_issued' => 'boolean',
            'follow_up_required' => 'boolean',
        ];
    }

    public static function generateSessionNumber(): string
    {
        $year = date('Y');
        $prefix = "TC-{$year}-";
        $rows = DB::select(
            "SELECT MAX(CAST(SUBSTRING(session_number FROM LENGTH(?) + 1) AS INTEGER)) as max_seq FROM teleconsult_sessions WHERE session_number LIKE ?",
            [$prefix, $prefix . '%']
        );
        $seq = (($rows[0]->max_seq ?? 0) + 1);
        return $prefix . str_pad($seq, 6, '0', STR_PAD_LEFT);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function provider()
    {
        return $this->belongsTo(\App\Models\User::class, 'provider_id');
    }

    public function appointment()
    {
        return $this->belongsTo(\Modules\Appointment\Models\Appointment::class);
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function cancelledBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'cancelled_by');
    }

    public function messages()
    {
        return $this->hasMany(TeleconsultMessage::class, 'session_id');
    }
}
