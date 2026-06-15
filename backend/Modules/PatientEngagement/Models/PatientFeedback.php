<?php

namespace Modules\PatientEngagement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;
use Modules\Patient\Models\Patient;

class PatientFeedback extends Model
{
    use HasUuids;

    protected $table = 'patient_feedback';

    protected $fillable = [
        'patient_id',
        'facility_id',
        'feedback_type',
        'rating',
        'comments',
        'is_anonymous',
        'status',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'rating' => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
