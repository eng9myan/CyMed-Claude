<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'facility_id', 'parent_id', 'code', 'name', 'name_ar',
        'department_type', 'specialty', 'cost_center_code',
        'phone_extension', 'email', 'location_floor', 'location_wing',
        'total_beds', 'is_active', 'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
            'total_beds' => 'integer',
        ];
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function parent()
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Department::class, 'parent_id');
    }
}
