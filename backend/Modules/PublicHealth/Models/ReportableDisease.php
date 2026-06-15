<?php

namespace Modules\PublicHealth\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReportableDisease extends Model
{
    use HasUuids;

    protected $table = 'reportable_diseases';

    protected $fillable = [
        'icd10_code', 'disease_name', 'reporting_hours', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function notifications()
    {
        return $this->hasMany(DiseaseNotification::class, 'disease_id');
    }
}
