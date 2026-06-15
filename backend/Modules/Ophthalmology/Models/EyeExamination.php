<?php

namespace Modules\Ophthalmology\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class EyeExamination extends Model
{
    use HasUuids;

    protected $table = 'eye_examinations';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'examiner_id',
        'exam_date',
        'va_right_unaided',
        'va_left_unaided',
        'va_right_corrected',
        'va_left_corrected',
        'iop_right_mmhg',
        'iop_left_mmhg',
        'refraction_right',
        'refraction_left',
        'anterior_segment_right',
        'anterior_segment_left',
        'posterior_segment_right',
        'posterior_segment_left',
        'diagnosis',
        'plan',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'refraction_right' => 'array',
        'refraction_left' => 'array',
        'iop_right_mmhg' => 'float',
        'iop_left_mmhg' => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function examiner()
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }
}
