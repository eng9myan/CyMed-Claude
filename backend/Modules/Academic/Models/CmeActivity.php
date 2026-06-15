<?php

namespace Modules\Academic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class CmeActivity extends Model
{
    use HasUuids;

    protected $table = 'cme_activities';

    protected $fillable = [
        'facility_id',
        'title',
        'activity_type',
        'provider',
        'credit_hours',
        'accreditation_body',
        'activity_date',
        'expiry_date',
        'is_mandatory',
        'created_by',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'expiry_date' => 'date',
        'is_mandatory' => 'boolean',
        'credit_hours' => 'decimal:2',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function completions()
    {
        return $this->hasMany(CmeCompletion::class, 'activity_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
