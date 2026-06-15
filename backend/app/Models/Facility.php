<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facility extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'hospital_group_id', 'code', 'name', 'name_ar', 'facility_type', 'type',
        'license_number', 'tax_number', 'address', 'city', 'region', 'country',
        'postal_code', 'phone', 'fax', 'email', 'website', 'latitude', 'longitude',
        'timezone', 'currency', 'settings', 'is_active', 'is_primary',
        'vat_rate', 'income_tax_rate', 'insurance_claim_format',
        'parent_facility_id', 'bed_count', 'emergency_available', 'icu_available', 'coordinates',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'coordinates' => 'array',
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'emergency_available' => 'boolean',
            'icu_available' => 'boolean',
            'vat_rate' => 'decimal:2',
            'income_tax_rate' => 'decimal:2',
        ];
    }

    public function hospitalGroup(): BelongsTo
    {
        return $this->belongsTo(HospitalGroup::class);
    }

    public function parentFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'parent_facility_id');
    }

    public function childFacilities(): HasMany
    {
        return $this->hasMany(Facility::class, 'parent_facility_id');
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
