<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CaseLog extends Model
{
    use HasUuids;

    protected $table = 'case_logs';

    protected $fillable = [
        'trainee_id',
        'supervisor_id',
        'logged_date',
        'patient_age_group',
        'encounter_type',
        'primary_diagnosis',
        'procedures_performed',
        'role',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'logged_date' => 'date',
        'procedures_performed' => 'array',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
