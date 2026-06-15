<?php

namespace Modules\Orthopedics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class OrthoAssessment extends Model
{
    use HasUuids;

    protected $table = 'ortho_assessments';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'surgeon_id',
        'assessment_date',
        'presenting_complaint',
        'fracture_classification',
        'affected_region',
        'laterality',
        'imaging_findings',
        'neurovascular_status',
        'range_of_motion',
        'management_plan',
        'surgery_required',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'range_of_motion' => 'array',
        'surgery_required' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }
}
