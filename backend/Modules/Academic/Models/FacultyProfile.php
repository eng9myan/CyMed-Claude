<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class FacultyProfile extends Model
{
    use HasUuids;

    protected $table = 'faculty_profiles';

    protected $fillable = [
        'user_id',
        'facility_id',
        'academic_rank',
        'department',
        'specialty',
        'orcid_id',
        'research_interests',
        'publications_count',
        'is_active',
    ];

    protected $casts = [
        'research_interests' => 'array',
        'is_active' => 'boolean',
        'publications_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
