<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CompetencyAssessment extends Model
{
    use HasUuids;

    protected $table = 'competency_assessments';

    protected $fillable = [
        'trainee_id',
        'assessor_id',
        'rotation_id',
        'assessment_date',
        'assessment_tool',
        'competency_domain',
        'performance_level',
        'feedback',
        'is_shared_with_trainee',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'performance_level' => 'integer',
        'is_shared_with_trainee' => 'boolean',
    ];

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    public function rotation()
    {
        return $this->belongsTo(MedicalRotation::class, 'rotation_id');
    }
}
