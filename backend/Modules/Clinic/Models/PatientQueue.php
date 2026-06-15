<?php

namespace Modules\Clinic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Patient\Models\Patient;

class PatientQueue extends Model
{
    use HasUuids;

    protected $table = 'patient_queues';

    protected $fillable = [
        'token_number',
        'clinic_id',
        'patient_id',
        'registered_by',
        'queue_date',
        'queue_position',
        'status',
        'priority',
        'registered_at',
        'called_at',
        'consultation_started_at',
        'consultation_ended_at',
        'wait_time_minutes',
        'consultation_time_minutes',
    ];

    protected $casts = [
        'queue_date' => 'date',
        'registered_at' => 'datetime',
        'called_at' => 'datetime',
        'consultation_started_at' => 'datetime',
        'consultation_ended_at' => 'datetime',
    ];

    public static function generateTokenNumber(string $clinicId, string $date): array
    {
        $result = DB::select(
            'SELECT COALESCE(MAX(CAST(queue_position AS integer)), 0) as max_pos FROM patient_queues WHERE clinic_id = ? AND queue_date = ?',
            [$clinicId, $date]
        );

        $position = ((int) $result[0]->max_pos) + 1;
        $token = 'QUE-' . str_replace('-', '', $date) . '-' . str_pad((string) $position, 4, '0', STR_PAD_LEFT);

        return ['position' => $position, 'token' => $token];
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }
}
