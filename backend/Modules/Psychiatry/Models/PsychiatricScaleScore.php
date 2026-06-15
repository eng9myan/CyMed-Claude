<?php

namespace Modules\Psychiatry\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class PsychiatricScaleScore extends Model
{
    use HasUuids;

    protected $table = 'psychiatric_scale_scores';

    protected $fillable = [
        'patient_id',
        'assessed_by',
        'scored_at',
        'scale',
        'total_score',
        'severity',
        'item_scores',
        'notes',
    ];

    protected $casts = [
        'scored_at' => 'date',
        'item_scores' => 'array',
        'total_score' => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function assessedBy()
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }
}
