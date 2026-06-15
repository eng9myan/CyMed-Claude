<?php

namespace Modules\Core\Models;

use App\Models\HospitalGroup;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facility extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'hospital_group_id', 'parent_facility_id', 'code', 'name', 'name_ar',
        'facility_type', 'license_number', 'tax_number', 'address', 'city',
        'region', 'country', 'postal_code', 'phone', 'fax', 'email', 'website',
        'latitude', 'longitude', 'timezone', 'currency', 'settings',
        'vat_rate', 'income_tax_rate', 'insurance_claim_format',
        'bed_count', 'emergency_available', 'icu_available',
        'is_active', 'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'emergency_available' => 'boolean',
            'icu_available' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'vat_rate' => 'decimal:2',
            'income_tax_rate' => 'decimal:2',
        ];
    }

    public function hospitalGroup()
    {
        return $this->belongsTo(HospitalGroup::class);
    }

    public function parentFacility()
    {
        return $this->belongsTo(Facility::class, 'parent_facility_id');
    }

    public function childFacilities()
    {
        return $this->hasMany(Facility::class, 'parent_facility_id');
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
