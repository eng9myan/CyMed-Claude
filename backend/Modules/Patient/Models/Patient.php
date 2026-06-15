<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Patient extends Model
{
    use SoftDeletes, HasUuids, HasFactory, LogsActivity;

    protected static function newFactory()
    {
        return \Database\Factories\PatientFactory::new();
    }

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'facility_id', 'mrn', 'national_id', 'iqama_number', 'passport_number',
        'first_name', 'middle_name', 'last_name', 'first_name_ar', 'middle_name_ar', 'last_name_ar',
        'date_of_birth', 'gender', 'blood_group', 'rh_factor',
        'nationality', 'religion', 'marital_status', 'occupation', 'primary_language',
        'phone_primary', 'phone_secondary', 'email',
        'addresses', 'emergency_contacts',
        'is_deceased', 'deceased_at', 'is_vip', 'is_staff', 'is_newborn',
        'photo_path', 'registered_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'deceased_at' => 'datetime',
            'is_deceased' => 'boolean',
            'is_vip' => 'boolean',
            'is_staff' => 'boolean',
            'is_newborn' => 'boolean',
            'is_merged' => 'boolean',
            'merged_at' => 'datetime',
            'addresses' => 'array',
            'emergency_contacts' => 'array',
            'spoken_languages' => 'array',
            'biometric_data' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['mrn', 'national_id', 'first_name', 'last_name', 'date_of_birth', 'gender'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    // Relationships
    public function facility()
    {
        return $this->belongsTo(\Modules\Core\Models\Facility::class);
    }

    public function encounters()
    {
        return $this->hasMany(Encounter::class);
    }

    public function activeEncounter()
    {
        return $this->hasOne(Encounter::class)->where('status', 'active')->latest();
    }

    public function allergies()
    {
        return $this->hasMany(PatientAllergy::class);
    }

    public function activeAllergies()
    {
        return $this->hasMany(PatientAllergy::class)->where('status', 'active');
    }

    public function problems()
    {
        return $this->hasMany(PatientProblem::class);
    }

    public function activeProblems()
    {
        return $this->hasMany(PatientProblem::class)->where('clinical_status', 'active');
    }

    public function insurances()
    {
        return $this->hasMany(PatientInsurance::class);
    }

    public function primaryInsurance()
    {
        return $this->hasOne(PatientInsurance::class)
            ->where('coverage_type', 'primary')
            ->where('is_active', true);
    }

    public function immunizations()
    {
        return $this->hasMany(\Modules\Patient\Models\PatientImmunization::class);
    }

    // Computed Attributes
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} " . ($this->middle_name ? "{$this->middle_name} " : '') . $this->last_name);
    }

    public function getFullNameArAttribute(): ?string
    {
        if ($this->first_name_ar || $this->last_name_ar) {
            return trim(($this->first_name_ar ?? '') . ' ' . ($this->middle_name_ar ? "{$this->middle_name_ar} " : '') . ($this->last_name_ar ?? ''));
        }
        return null;
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth?->age;
    }

    public function getAgeStringAttribute(): ?string
    {
        if (! $this->date_of_birth) return null;
        $diff = now()->diff($this->date_of_birth);
        if ($diff->y >= 2) return "{$diff->y} years";
        if ($diff->m >= 1) return "{$diff->y}y {$diff->m}m";
        return "{$diff->d} days";
    }

    // Search scope
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->whereRaw("similarity(first_name || ' ' || last_name, ?) > 0.2", [$term])
              ->orWhere('mrn', 'ilike', "%{$term}%")
              ->orWhere('national_id', 'like', "%{$term}%")
              ->orWhere('phone_primary', 'like', "%{$term}%");
        });
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at')->where('is_merged', false);
    }

    // Generate MRN
    public static function generateMrn(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;
        return sprintf('CYM-%d-%06d', $year, $seq);
    }
}
