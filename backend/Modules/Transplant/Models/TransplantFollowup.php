<?php

namespace Modules\Transplant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class TransplantFollowup extends Model
{
    use HasUuids;

    protected $table = 'transplant_followups';

    protected $fillable = [
        'transplant_case_id',
        'patient_id',
        'clinician_id',
        'followup_date',
        'days_post_transplant',
        'graft_function',
        'rejection_episode',
        'rejection_type',
        'biopsy_done',
        'biopsy_result',
        'immunosuppression_adjustment',
        'notes',
    ];

    protected $casts = [
        'followup_date' => 'date',
        'rejection_episode' => 'boolean',
        'biopsy_done' => 'boolean',
    ];

    public function transplantCase()
    {
        return $this->belongsTo(TransplantCase::class, 'transplant_case_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function clinician()
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }
}
