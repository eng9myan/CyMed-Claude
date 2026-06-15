<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class MedicalRotation extends Model
{
    use HasUuids;

    protected $table = 'medical_rotations';

    protected $fillable = [
        'trainee_id',
        'supervisor_id',
        'facility_id',
        'department',
        'rotation_type',
        'start_date',
        'end_date',
        'competencies',
        'supervisor_rating',
        'supervisor_comments',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'competencies' => 'array',
        'supervisor_rating' => 'integer',
    ];

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
