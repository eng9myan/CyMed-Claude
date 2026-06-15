<?php

namespace Modules\BedManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Modules\Core\Models\Department;
use Modules\Core\Models\Facility;

class Ward extends Model
{
    use HasUuids;

    protected $fillable = [
        'facility_id', 'department_id', 'ward_code', 'ward_name',
        'ward_type', 'total_beds', 'floor', 'wing', 'phone_extension', 'is_active',
    ];

    protected $casts = [
        'total_beds' => 'integer',
        'is_active' => 'boolean',
    ];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }
}
