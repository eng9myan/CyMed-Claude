<?php

namespace Modules\Psychiatry\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class TherapySession extends Model
{
    use HasUuids;

    protected $table = 'therapy_sessions';

    protected $fillable = [
        'patient_id',
        'therapist_id',
        'session_date',
        'session_type',
        'duration_minutes',
        'session_number',
        'mood_rating',
        'progress_notes',
        'homework_assigned',
        'risk_update',
    ];

    protected $casts = [
        'session_date' => 'date',
        'mood_rating' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapist_id');
    }
}
