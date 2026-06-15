<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Insurer extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'name', 'name_ar', 'insurer_type', 'nphies_payer_id', 'tax_number',
        'phone', 'email', 'portal_url', 'claims_email', 'contact_info',
        'submission_config', 'coverage_config', 'requires_prior_auth',
        'supports_realtime_eligibility', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'contact_info' => 'array',
            'submission_config' => 'array',
            'coverage_config' => 'array',
            'requires_prior_auth' => 'boolean',
            'supports_realtime_eligibility' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function patientInsurances()
    {
        return $this->hasMany(PatientInsurance::class);
    }
}
