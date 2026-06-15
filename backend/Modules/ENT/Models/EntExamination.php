<?php

namespace Modules\ENT\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Patient\Models\Patient;

class EntExamination extends Model
{
    use HasUuids;

    protected $table = 'ent_examinations';

    protected $fillable = [
        'patient_id',
        'encounter_id',
        'examiner_id',
        'exam_date',
        'ear_right',
        'ear_left',
        'nose',
        'throat',
        'hearing_right_db',
        'hearing_left_db',
        'hearing_classification',
        'diagnosis',
        'plan',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'ear_right' => 'array',
        'ear_left' => 'array',
        'nose' => 'array',
        'throat' => 'array',
        'hearing_right_db' => 'decimal:1',
        'hearing_left_db' => 'decimal:1',
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
