<?php

namespace Modules\Patient\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PatientInsurance extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'patient_id', 'insurer_id', 'coverage_type', 'policy_number', 'member_id',
        'group_number', 'network_name', 'plan_name', 'valid_from', 'valid_to',
        'eligibility_status', 'last_verified_at', 'eligibility_response',
        'coverage_details', 'annual_deductible', 'deductible_met', 'out_of_pocket_max',
        'out_of_pocket_met', 'copay_percentage', 'card_scan_path', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
            'valid_to' => 'date',
            'last_verified_at' => 'datetime',
            'eligibility_response' => 'array',
            'coverage_details' => 'array',
            'is_active' => 'boolean',
            'annual_deductible' => 'decimal:2',
            'deductible_met' => 'decimal:2',
            'out_of_pocket_max' => 'decimal:2',
            'out_of_pocket_met' => 'decimal:2',
            'copay_percentage' => 'decimal:2',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function insurer()
    {
        return $this->belongsTo(Insurer::class);
    }
}
