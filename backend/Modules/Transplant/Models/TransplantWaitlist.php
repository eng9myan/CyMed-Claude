<?php

namespace Modules\Transplant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class TransplantWaitlist extends Model
{
    use HasUuids;

    protected $table = 'transplant_waitlists';

    protected $fillable = [
        'patient_id',
        'facility_id',
        'registered_by',
        'organ_type',
        'blood_group',
        'registered_at',
        'status',
        'urgency_score',
        'hla_typing',
        'pra_percent',
        'medical_urgency',
        'notes',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'hla_typing' => 'array',
        'urgency_score' => 'decimal:2',
        'pra_percent' => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }
}
