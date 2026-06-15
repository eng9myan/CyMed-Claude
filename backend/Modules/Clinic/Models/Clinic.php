<?php

namespace Modules\Clinic\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\Facility;

class Clinic extends Model
{
    use HasUuids;

    protected $table = 'clinics';

    protected $fillable = [
        'clinic_code',
        'facility_id',
        'name',
        'name_ar',
        'clinic_type',
        'consultation_fee',
        'follow_up_fee',
        'operating_hours',
        'is_active',
        'max_daily_patients',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'is_active' => 'boolean',
        'consultation_fee' => 'decimal:2',
        'follow_up_fee' => 'decimal:2',
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function providers()
    {
        return $this->hasMany(ClinicProvider::class);
    }

    public function providerUsers()
    {
        return $this->belongsToMany(User::class, 'clinic_providers')
            ->withPivot('is_primary')
            ->withTimestamps();
    }
}
