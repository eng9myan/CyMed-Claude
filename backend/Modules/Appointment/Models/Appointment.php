<?php

namespace Modules\Appointment\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Appointment extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'facility_id', 'patient_id', 'department_id', 'physician_id',
        'schedule_id', 'encounter_id',
        'appointment_number', 'appointment_type', 'visit_reason', 'icd_reason_code',
        'appointment_date', 'start_time', 'end_time', 'duration_minutes',
        'status', 'booking_source', 'booked_by_type', 'booked_by_id',
        'is_new_patient', 'reminder_sent_24h', 'reminder_sent_2h',
        'arrived_at', 'seen_at', 'completed_at', 'cancelled_at',
        'cancellation_reason', 'cancellation_by',
        'notes', 'pre_visit_questionnaire', 'fhir_appointment',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'arrived_at' => 'datetime',
            'seen_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'is_new_patient' => 'boolean',
            'reminder_sent_24h' => 'boolean',
            'reminder_sent_2h' => 'boolean',
            'pre_visit_questionnaire' => 'array',
            'fhir_appointment' => 'array',
            'duration_minutes' => 'integer',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function physician()
    {
        return $this->belongsTo(\App\Models\User::class, 'physician_id');
    }

    public function facility()
    {
        return $this->belongsTo(\Modules\Core\Models\Facility::class);
    }

    public function department()
    {
        return $this->belongsTo(\Modules\Core\Models\Department::class);
    }

    public function schedule()
    {
        return $this->belongsTo(AppointmentSchedule::class, 'schedule_id');
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('appointment_date', $date);
    }

    public function scopeForPhysician($query, string $physicianId)
    {
        return $query->where('physician_id', $physicianId);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['scheduled', 'confirmed']);
    }

    public static function generateAppointmentNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('APT-%d-%07d', $year, $seq);
    }
}
