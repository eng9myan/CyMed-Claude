<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'facility_id', 'parent_id', 'code', 'name', 'name_ar',
        'department_type', 'specialty', 'cost_center_code',
        'phone_extension', 'email', 'location_floor', 'location_wing',
        'total_beds', 'is_active', 'settings',
        'head_of_department_id',
    ];

    protected function casts(): array
    {
        return [
            'settings'  => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
