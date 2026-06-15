<?php

namespace Modules\BedManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Modules\Patient\Models\Encounter;
use Modules\Patient\Models\Patient;

class BedAssignment extends Model
{
    use HasUuids;

    protected $fillable = [
        'bed_id', 'patient_id', 'encounter_id', 'assigned_at', 'vacated_at',
        'assignment_reason', 'assigned_by', 'vacated_by', 'vacate_reason', 'is_current',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'vacated_at' => 'datetime',
        'is_current' => 'boolean',
    ];

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function vacatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vacated_by');
    }
}
