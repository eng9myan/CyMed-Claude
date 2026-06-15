<?php

namespace Modules\Billing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServiceCharge extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'encounter_id', 'patient_id', 'service_id',
        'service_date', 'charged_at',
        'quantity', 'unit_price', 'gross_amount',
        'discount_percent', 'discount_amount',
        'tax_percent', 'tax_amount',
        'net_amount', 'total_amount',
        'coverage_type', 'insurance_covered', 'patient_responsibility',
        'insurance_id', 'pre_auth_number', 'revenue_code',
        'posted_by', 'status', 'void_reason', 'voided_by',
        'icd_diagnoses', 'modifiers',
    ];

    protected function casts(): array
    {
        return [
            'service_date' => 'date',
            'charged_at' => 'datetime',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'gross_amount' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_percent' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'insurance_covered' => 'decimal:2',
            'patient_responsibility' => 'decimal:2',
            'icd_diagnoses' => 'array',
            'modifiers' => 'array',
        ];
    }

    public function encounter()
    {
        return $this->belongsTo(\Modules\Patient\Models\Encounter::class);
    }

    public function patient()
    {
        return $this->belongsTo(\Modules\Patient\Models\Patient::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'posted_by');
    }
}
